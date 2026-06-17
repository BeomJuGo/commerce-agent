// 상품 리뷰 요약 및 장단점 분석 (MongoDB 캐시 — pc-site-backend /api/gpt-info 패턴)
export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { parseBody, handleError } from "@/lib/validate";
import { reviewSchema } from "@/lib/schemas";
import { searchShop } from "@/lib/naver";
import { chatJSON } from "@/lib/openai";
import { getDb } from "@/lib/mongodb";
import logger from "@/lib/logger";

export async function POST(req) {
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
      if (cached?.analysis) {
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
            `위 정보와 일반적으로 알려진 평판을 종합해 이 상품의 리뷰를 요약하세요.\n` +
            `형식: {"summary":"한줄 요약","pros":["장점1","장점2","장점3"],"cons":["단점1","단점2"],` +
            `"verdict":"구매 추천/비추천 및 근거","score":0~100}`,
        },
      ],
      { maxTokens: 900 }
    );

    const result = {
      summary: analysis.summary || "",
      pros: Array.isArray(analysis.pros) ? analysis.pros : [],
      cons: Array.isArray(analysis.cons) ? analysis.cons : [],
      verdict: analysis.verdict || "",
      score: typeof analysis.score === "number" ? analysis.score : null,
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
