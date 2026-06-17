// 상황 기반 상품 추천 AI 에이전트
export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { parseBody, handleError } from "@/lib/validate";
import { recommendSchema } from "@/lib/schemas";
import { searchShop } from "@/lib/naver";
import { chatJSON } from "@/lib/openai";
import { rateLimit } from "@/lib/rateLimit";
import logger from "@/lib/logger";

export async function POST(req) {
  const limited = rateLimit(req, { name: "recommend", max: 10, windowMs: 60000 });
  if (limited) return limited;
  const { data, response } = await parseBody(recommendSchema, req);
  if (response) return response;

  const { situation, budget } = data;
  try {
    // 1) 자연어 상황 → 검색 의도/키워드 추출
    const intent = await chatJSON([
      {
        role: "user",
        content:
          `사용자의 쇼핑 상황: "${situation}"${budget ? `\n예산: ${budget}원` : ""}\n` +
          `네이버 쇼핑 검색에 사용할 정보를 JSON으로 추출하세요.\n` +
          `형식: {"keywords":["검색어1","검색어2","검색어3"],"category":"대분류","mustHave":["필수 조건1","필수 조건2"]}\n` +
          `keywords는 실제 검색에 쓸 2~4개의 구체적인 한국어 상품 검색어로 작성하세요.`,
      },
    ]);

    const keywords =
      Array.isArray(intent.keywords) && intent.keywords.length ? intent.keywords.slice(0, 4) : [situation];

    // 2) 키워드별 네이버 검색 → 후보 수집(중복/예산초과 제거)
    const seen = new Set();
    const candidates = [];
    for (const kw of keywords) {
      const items = await searchShop(kw, { display: 6, sort: budget ? "asc" : "sim" });
      for (const it of items) {
        const key = it.productId || it.link;
        if (!key || seen.has(key)) continue;
        seen.add(key);
        if (budget && it.lprice && it.lprice > budget * 1.2) continue;
        candidates.push(it);
      }
    }

    if (!candidates.length) {
      return NextResponse.json({
        situation,
        keywords,
        summary: "조건에 맞는 상품을 찾지 못했습니다. 상황을 더 구체적으로 입력해 보세요.",
        products: [],
        count: 0,
      });
    }

    // 3) 후보를 GPT에 넘겨 상황 적합도 랭킹
    const brief = candidates
      .slice(0, 24)
      .map((c, i) => ({ id: i, title: c.title, price: c.lprice, mall: c.mallName }));
    const ranked = await chatJSON(
      [
        {
          role: "user",
          content:
            `상황: "${situation}"${budget ? ` / 예산 ${budget}원` : ""}\n` +
            `필수조건: ${(intent.mustHave || []).join(", ") || "없음"}\n` +
            `후보 상품(JSON): ${JSON.stringify(brief)}\n` +
            `상황 적합도가 높은 순으로 최대 8개를 골라 JSON으로 응답하세요.\n` +
            `형식: {"ranked":[{"id":후보id,"reason":"추천 이유(40자 이내)","fitScore":0~100}],"summary":"전체 추천 요약 2문장"}`,
        },
      ],
      { maxTokens: 1000 }
    );

    const products = (ranked.ranked || [])
      .map((r) => {
        const p = candidates[r.id];
        if (!p) return null;
        return { ...p, reason: r.reason, fitScore: r.fitScore };
      })
      .filter(Boolean);

    return NextResponse.json({
      situation,
      budget: budget || null,
      keywords,
      mustHave: intent.mustHave || [],
      summary: ranked.summary || "",
      count: products.length,
      products,
    });
  } catch (e) {
    logger.error(`recommend 실패: ${e.message}`);
    return handleError(e, "추천 생성에 실패했습니다.");
  }
}
