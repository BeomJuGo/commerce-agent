// 상품 비교 및 구매 판단 도우미
export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { parseBody, handleError } from "@/lib/validate";
import { compareSchema } from "@/lib/schemas";
import { searchShop, priceStats } from "@/lib/naver";
import { chatJSON } from "@/lib/openai";
import logger from "@/lib/logger";

export async function POST(req) {
  const { data, response } = await parseBody(compareSchema, req);
  if (response) return response;

  const { products, criteria } = data;
  try {
    // 각 상품의 대표 정보/가격대 수집
    const enriched = [];
    for (const p of products) {
      const q = p.name || p.productId;
      const items = await searchShop(q, { display: 5 });
      const top = items[0] || null;
      const stats = priceStats(items);
      enriched.push({
        query: q,
        title: top?.title || q,
        image: top?.image || null,
        link: top?.link || null,
        lprice: top?.lprice || null,
        priceRange: stats,
        samples: items.slice(0, 3).map((i) => i.title),
      });
    }

    const brief = enriched.map((e, i) => ({
      id: i,
      name: e.title,
      price: e.lprice,
      priceRange: { min: e.priceRange.min, max: e.priceRange.max },
      samples: e.samples,
    }));

    const analysis = await chatJSON(
      [
        {
          role: "user",
          content:
            `다음 상품들을 비교해 구매 판단을 도와주세요.${criteria ? ` 중점 비교 기준: ${criteria}.` : ""}\n` +
            `상품(JSON): ${JSON.stringify(brief)}\n` +
            `형식: {"table":[{"id":id,"pros":["장점"],"cons":["단점"],"bestFor":"이런 사람에게 적합"}],` +
            `"verdict":"종합 구매 판단 2~3문장","winner":{"id":추천상품id,"why":"선택 이유"}}`,
        },
      ],
      { maxTokens: 1100 }
    );

    const table = (analysis.table || [])
      .map((t) => {
        const e = enriched[t.id];
        if (!e) return null;
        return {
          name: e.title,
          image: e.image,
          link: e.link,
          lprice: e.lprice,
          priceRange: e.priceRange,
          pros: t.pros || [],
          cons: t.cons || [],
          bestFor: t.bestFor || "",
        };
      })
      .filter(Boolean);

    const winner =
      analysis.winner && enriched[analysis.winner.id]
        ? { name: enriched[analysis.winner.id].title, why: analysis.winner.why }
        : null;

    return NextResponse.json({ products: table, verdict: analysis.verdict || "", winner });
  } catch (e) {
    logger.error(`compare 실패: ${e.message}`);
    return handleError(e, "비교 분석에 실패했습니다.");
  }
}
