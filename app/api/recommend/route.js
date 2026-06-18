// 상황 기반 상품 추천 AI 에이전트
export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { parseBody, handleError } from "@/lib/validate";
import { recommendSchema } from "@/lib/schemas";
import { searchShop } from "@/lib/naver";
import { chatJSON } from "@/lib/openai";
import { rateLimit } from "@/lib/rateLimit";
import { productKey, cacheProducts } from "@/lib/products";
import logger from "@/lib/logger";

export async function POST(req) {
  const limited = rateLimit(req, { name: "recommend", max: 10, windowMs: 60000 });
  if (limited) return limited;
  const { data, response } = await parseBody(recommendSchema, req);
  if (response) return response;

  const { situation, budget } = data;
  try {
    // 1) 자연어 상황 → 상품 유형/키워드/필수조건/제외대상 추출
    const intent = await chatJSON([
      {
        role: "user",
        content:
          `사용자의 쇼핑 상황: "${situation}"${budget ? `\n예산: ${budget}원` : ""}\n` +
          `네이버 쇼핑 검색·선별에 쓸 정보를 JSON으로 추출하세요.\n` +
          `형식: {"productType":"사용자가 찾는 핵심 상품 한 단어/구(예: 공기청정기)",` +
          `"keywords":["구체 검색어1","검색어2","검색어3"],"mustHave":["필수 조건"],` +
          `"avoid":["이 상황에서 제외할 상품/유형 키워드(예: 차량용, 가습기, 필터 단품, 청소기)"]}\n` +
          `keywords는 본품을 찾기 위한 2~4개의 구체적 한국어 검색어. avoid는 사용자 의도와 다른 유형/부속품을 가리키는 단어들.`,
      },
    ],
    { maxTokens: 1500 });

    const productType = intent.productType || "";
    const keywords =
      Array.isArray(intent.keywords) && intent.keywords.length ? intent.keywords.slice(0, 4) : [situation];

    // 2) 키워드별 네이버 검색 — 항상 관련도(sim)순, 후보 폭넓게 수집
    const seen = new Set();
    const candidates = [];
    for (const kw of keywords) {
      const items = await searchShop(kw, { display: 10, sort: "sim" });
      for (const it of items) {
        const key = it.productId || it.link;
        if (!key || seen.has(key)) continue;
        seen.add(key);
        if (budget && it.lprice && it.lprice > budget * 1.3) continue; // 예산 초과만 제외(저가 잡동사니는 GPT가 걸러냄)
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

    // 3) 후보를 GPT에 넘겨 엄격히 선별(유형 불일치·부속품·비현실적 저가 제외)
    const brief = candidates
      .slice(0, 24)
      .map((c, i) => ({ id: i, title: c.title, price: c.lprice }));
    const ranked = await chatJSON(
      [
        {
          role: "user",
          content:
            `사용자 상황: "${situation}"\n` +
            `원하는 상품 유형: ${productType || "(상황에서 판단)"}\n` +
            (budget ? `예산: ${budget}원\n` : "") +
            `필수 조건: ${(intent.mustHave || []).join(", ") || "없음"}\n` +
            (intent.avoid?.length ? `제외 대상 키워드: ${intent.avoid.join(", ")}\n` : "") +
            `\n아래 네이버 쇼핑 후보(JSON: id/title/price)를 다음 기준으로 '엄격히' 선별하세요.\n` +
            `1) 원하는 상품 유형의 '본품'이 아닌 것만 제외: 유형 불일치(예: 공기청정기를 원하는데 가습기·차량용),` +
            ` 부속품·소모품·필터 단품·액세서리·청소도구·장난감/미니어처.\n` +
            `2) 가격이 해당 본품으로 보기엔 비현실적으로 낮은 것 제외(예: 공기청정기인데 수천 원 이하).\n` +
            `3) 위 1~2에 해당하지 않는 '본품'은 필수조건을 일부만 충족해도 후보로 남기고 fitScore에 반영하세요` +
            ` (모든 조건을 제목에서 확인할 수 없다는 이유로 제외하지 말 것).\n` +
            `4) 남은 본품을 상황 적합도(fitScore) 높은 순으로 최대 8개 제시하세요. 본품 후보가 하나도 없을 때만 ranked를 빈 배열로.\n\n` +
            `후보: ${JSON.stringify(brief)}\n` +
            `형식: {"ranked":[{"id":후보id,"reason":"왜 적합한지 30자 이내","fitScore":0~100}],` +
            `"summary":"추천 요약 1~2문장(적합 상품이 없거나 부족하면 그 사실을 솔직히)"}`,
        },
      ],
      { maxTokens: 4000 } // gpt-5.5는 reasoning이 토큰을 함께 소비 → 출력 잘림 방지로 넉넉히
    );

    const products = (ranked.ranked || [])
      .map((r) => {
        const p = candidates[r.id];
        if (!p) return null;
        return { ...p, pkey: productKey(p), reason: r.reason, fitScore: r.fitScore };
      })
      .filter(Boolean)
      // 낮은 적합도(잡동사니가 끼어든 경우) 컷
      .filter((p) => p.fitScore == null || p.fitScore >= 45);

    // 추천 상품을 캐시에 저장 → 상세/장바구니에서 클릭 가능
    await cacheProducts(products);

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
