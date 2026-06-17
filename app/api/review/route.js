// 상품 리뷰 요약 및 장단점 분석 (MongoDB 캐시 — pc-site-backend /api/gpt-info 패턴)
export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { parseBody, handleError } from "@/lib/validate";
import { reviewSchema } from "@/lib/schemas";
import { searchShop } from "@/lib/naver";
import { chatJSON } from "@/lib/openai";
import { getDb } from "@/lib/mongodb";
import { rateLimit } from "@/lib/rateLimit";
import logger from "@/lib/logger";

export async function POST(req) {
  const limited = rateLimit(req, { name: "review", max: 10, windowMs: 60000 });
  if (limited) return limited;
  const { data, response } = await parseBody(reviewSchema, req);
  if (response) return response;

  const { productName } = data;
  try {
    // 캐시 조회(미설정/장애 시 조용히 skip)
    let db = null;
    try {
      db = await getDb();
    } catch (_) {}
    if (db) {
      const cached = await db.collection("reviews").findOne({ productName }).catch(() => null);
      // reviews(대표 리뷰 5개)가 포함된 캐시만 유효 — 구버전 캐시는 재생성
      if (cached?.analysis?.reviews?.length) {
        return NextResponse.json({ productName, cached: true, ...cached.analysis });
      }
    }

    // 미스 → 유사/동일 상품 정보 수집 후 GPT 분석
    const items = await searchShop(productName, { display: 8 });
    const context = items
      .map((i) => `- ${i.title} (${i.lprice ? i.lprice + "원" : "가격미상"}${i.mallName ? ", " + i.mallName : ""})`)
      .join("\n");

    const analysis = await chatJSON(
      [
        {
          role: "user",
          content:
            `상품명: "${productName}"\n네이버 쇼핑 검색 결과(유사/동일 상품 제목·가격):\n${context || "(검색 결과 없음)"}\n` +
            `위 정보와 일반적으로 알려진 평판을 종합해 이 상품의 리뷰를 요약하고, 실제 사용자들이 남길 법한 대표 리뷰 5개를 작성하세요.\n` +
            `형식: {"summary":"한줄 요약","pros":["장점1","장점2","장점3"],"cons":["단점1","단점2"],` +
            `"verdict":"구매 추천/비추천 및 근거","score":0~100,` +
            `"reviews":[{"rating":1~5 정수,"text":"실제 사용자 말투의 리뷰 1~2문장","sentiment":"긍정|부정|중립"}]}\n` +
            `reviews는 정확히 5개, 긍정·부정이 섞이도록 현실적으로 작성하세요.`,
        },
      ],
      { maxTokens: 2800 } // gpt-5.5 reasoning + 5리뷰 출력 여유
    );

    const reviews = Array.isArray(analysis.reviews)
      ? analysis.reviews.slice(0, 5).map((r) => ({
          rating: Math.min(5, Math.max(1, Math.round(Number(r.rating) || 3))),
          text: String(r.text || "").slice(0, 300),
          sentiment: ["긍정", "부정", "중립"].includes(r.sentiment) ? r.sentiment : "중립",
        }))
      : [];

    const result = {
      summary: analysis.summary || "",
      pros: Array.isArray(analysis.pros) ? analysis.pros : [],
      cons: Array.isArray(analysis.cons) ? analysis.cons : [],
      verdict: analysis.verdict || "",
      score: typeof analysis.score === "number" ? analysis.score : null,
      reviews,
    };

    if (db) {
      db.collection("reviews")
        .updateOne(
          { productName },
          { $set: { productName, analysis: result, sampleCount: items.length, updatedAt: new Date() } },
          { upsert: true }
        )
        .catch((e) => logger.error(`review 캐시 저장 실패: ${e.message}`));
    }

    return NextResponse.json({ productName, cached: false, ...result });
  } catch (e) {
    logger.error(`review 실패: ${e.message}`);
    return handleError(e, "리뷰 분석에 실패했습니다.");
  }
}
