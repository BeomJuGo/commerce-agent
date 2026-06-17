// 상품 소싱 아이디어 추천 에이전트
export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { parseBody, handleError } from "@/lib/validate";
import { sourcingSchema } from "@/lib/schemas";
import { searchShop, priceStats } from "@/lib/naver";
import { chatJSON } from "@/lib/openai";
import { searchTrend } from "@/lib/datalab";
import { rateLimit } from "@/lib/rateLimit";
import logger from "@/lib/logger";

export async function POST(req) {
  const limited = rateLimit(req, { name: "sourcing", max: 10, windowMs: 60000 });
  if (limited) return limited;
  const { data, response } = await parseBody(sourcingSchema, req);
  if (response) return response;

  const { category, keyword, marginTarget } = data;
  const seed = keyword || category;
  try {
    const ideaRes = await chatJSON(
      [
        {
          role: "user",
          content:
            `이커머스 셀러를 위한 상품 소싱 아이디어를 제안하세요.\n` +
            `분야/키워드: "${seed}"${marginTarget ? `\n목표 마진율: ${marginTarget}%` : ""}\n` +
            `형식: {"ideas":[{"idea":"상품 아이디어","searchKeyword":"네이버 상품검색용 키워드",` +
            `"trendKeyword":"데이터랩 트렌드 조회용 대표 검색어(너무 좁지 않은 1~2어절 일반 키워드, 예: 캠핑 테이블/무선 이어폰)",` +
            `"rationale":"추천 근거","demandSignal":"수요 신호","riskNote":"리스크/주의점"}]}\n4~6개를 제안하세요.`,
        },
      ],
      { maxTokens: 2500 }
    );

    // 각 아이디어: 시장 신호(가격대/경쟁강도) + 네이버 데이터랩 실제 검색 트렌드 첨부
    const ideas = [];
    for (const it of (ideaRes.ideas || []).slice(0, 6)) {
      const kw = it.searchKeyword || it.idea;
      const trendKw = it.trendKeyword || it.searchKeyword || it.idea;
      const [items, trend] = await Promise.all([
        searchShop(kw, { display: 10 }).catch(() => []),
        searchTrend(trendKw, { months: 12 }).catch(() => null),
      ]);
      const stats = priceStats(items);
      const market = {
        ...stats,
        competition: stats.count >= 10 ? "높음" : stats.count >= 4 ? "보통" : "낮음",
      };
      ideas.push({ ...it, market, trend });
    }

    return NextResponse.json({ seed, marginTarget: marginTarget || null, count: ideas.length, ideas });
  } catch (e) {
    logger.error(`sourcing 실패: ${e.message}`);
    return handleError(e, "소싱 아이디어 생성에 실패했습니다.");
  }
}
