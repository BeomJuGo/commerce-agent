// 검색 트렌드 AI 해석 — 특정 키워드의 추세가 왜 좋은지/나쁜지 분석 (소싱 관점)
export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { parseBody, handleError } from "@/lib/validate";
import { trendAnalysisSchema } from "@/lib/schemas";
import { chatJSON } from "@/lib/openai";
import { searchTrend } from "@/lib/datalab";
import { rateLimit } from "@/lib/rateLimit";
import logger from "@/lib/logger";

export async function POST(req) {
  const limited = rateLimit(req, { name: "trend-analysis", max: 15, windowMs: 60000 });
  if (limited) return limited;
  const { data, response } = await parseBody(trendAnalysisSchema, req);
  if (response) return response;

  const { keyword } = data;
  try {
    // 클라이언트가 보낸 추세가 있으면 사용, 없으면 서버에서 조회
    let trend = data.series?.length
      ? { series: data.series, momentum: data.momentum, direction: data.direction, peakMonth: data.peakMonth }
      : null;
    if (!trend) trend = await searchTrend(keyword, { months: 12 });
    if (!trend?.series?.length) {
      return NextResponse.json({ keyword, error: "트렌드 데이터가 없어 분석할 수 없습니다." }, { status: 404 });
    }

    const seriesText = trend.series.map((s) => `${s.period}:${s.ratio}`).join(", ");
    const analysis = await chatJSON(
      [
        {
          role: "user",
          content:
            `네이버 검색 트렌드를 셀러(소싱) 관점에서 해석하세요.\n` +
            `키워드: "${keyword}"\n` +
            `월별 상대 검색량(0~100, 12개월): ${seriesText}\n` +
            `추세: ${trend.direction || "?"} (모멘텀 ${trend.momentum ?? "?"}%), 피크 ${trend.peakMonth || "?"}월\n\n` +
            `데이터 기반으로 해석하되, 외부 실시간 요인은 단정하지 말고 '추정'으로 표현하세요.\n` +
            `형식: {"verdict":"좋음|보통|나쁨","summary":"현재 추세 한줄 해석",` +
            `"reasons":["추세의 원인 추정 2~4개(계절성·수요변화·라이프스타일 등)"],` +
            `"seasonality":"피크 시즌의 의미와 계절성 패턴","sourcingTip":"소싱 타이밍·전략 조언(지금 들어갈지, 시즌 대비 등)",` +
            `"outlook":"향후 1~3개월 전망"}`,
        },
      ],
      { maxTokens: 2500 }
    );

    return NextResponse.json({ keyword, trend, analysis });
  } catch (e) {
    logger.error(`trend-analysis 실패: ${e.message}`);
    return handleError(e, "트렌드 분석에 실패했습니다.");
  }
}
