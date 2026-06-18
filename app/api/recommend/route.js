// 상황 기반 상품 추천 AI 에이전트
export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { parseBody, handleError } from "@/lib/validate";
import { recommendSchema } from "@/lib/schemas";
import { searchShop } from "@/lib/naver";
import { chatJSON, FAST_MODEL } from "@/lib/openai";
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
    // 1) 상황을 바로 검색(의도추출 GPT 생략 → 속도). 관련도순으로 후보 폭넓게 수집.
    const items = await searchShop(situation, { display: 18, sort: "sim" }).catch(() => []);
    const seen = new Set();
    const candidates = [];
    for (const it of items) {
      const key = it.productId || it.link;
      if (!key || seen.has(key)) continue;
      seen.add(key);
      if (budget && it.lprice && it.lprice > budget * 1.3) continue; // 예산 초과만 제외(저가 잡동사니는 GPT가 걸러냄)
      candidates.push(it);
    }

    if (!candidates.length) {
      return NextResponse.json({
        situation,
        summary: "조건에 맞는 상품을 찾지 못했습니다. 상황을 더 구체적으로 입력해 보세요.",
        products: [],
        count: 0,
      });
    }

    // 2) 단일 GPT 호출 — 상품 유형 파악 + 선별 + 이유(랭킹). (호출 1회로 속도 확보)
    const brief = candidates.slice(0, 18).map((c, i) => ({ id: i, title: c.title, price: c.lprice }));
    const ranked = await chatJSON(
      [
        {
          role: "user",
          content:
            `사용자 상황: "${situation}"${budget ? ` / 예산 ${budget}원` : ""}\n` +
            `먼저 사용자가 원하는 상품 유형을 파악한 뒤, 아래 후보를 선별하세요.\n` +
            `1) 원하는 유형의 '본품'이 아닌 것 제외: 유형 불일치(예: 공기청정기인데 가습기·차량용),` +
            ` 부속품·소모품·필터 단품·액세서리·청소도구·장난감/미니어처, 본품으로 보기엔 비현실적으로 낮은 가격.\n` +
            `2) 남은 본품을 상황 적합도(fitScore) 높은 순으로 최대 8개. 필수 조건을 일부만 충족해도 본품이면 포함하고` +
            ` fitScore에 반영(제목에서 모든 조건을 확인할 수 없다고 제외하지 말 것). 본품이 하나도 없을 때만 빈 배열.\n` +
            `후보(JSON: id/title/price): ${JSON.stringify(brief)}\n` +
            `형식: {"ranked":[{"id":후보id,"reason":"추천 이유 30자 이내","fitScore":0~100}],"summary":"추천 요약 1~2문장"}`,
        },
      ],
      { model: FAST_MODEL, temperature: 0.2, maxTokens: 1500 } // 빠른 모델로 랭킹(지연 단축)
    );

    const products = (ranked.ranked || [])
      .map((r) => {
        const p = candidates[r.id];
        if (!p) return null;
        return { ...p, pkey: productKey(p), reason: r.reason, fitScore: r.fitScore };
      })
      .filter(Boolean)
      .filter((p) => p.fitScore == null || p.fitScore >= 45);

    await cacheProducts(products);

    return NextResponse.json({
      situation,
      budget: budget || null,
      summary: ranked.summary || "",
      count: products.length,
      products,
    });
  } catch (e) {
    logger.error(`recommend 실패: ${e.message}`);
    return handleError(e, "추천 생성에 실패했습니다.");
  }
}
