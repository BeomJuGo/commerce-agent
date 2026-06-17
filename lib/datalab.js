// lib/datalab.js — 네이버 데이터랩 검색어 트렌드 (소싱 수요 신호)
const ENDPOINT = "https://openapi.naver.com/v1/datalab/search";

function fmt(d) {
  return d.toISOString().slice(0, 10);
}

function summarize(data) {
  const series = data.map((d) => ({ period: d.period.slice(0, 7), ratio: Math.round(d.ratio * 10) / 10 }));
  const ratios = series.map((s) => s.ratio);
  if (!ratios.length) return null;

  const half = Math.max(1, Math.floor(ratios.length / 2));
  const avg = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
  const prevAvg = avg(ratios.slice(0, half));
  const recentAvg = avg(ratios.slice(-half));
  const momentum = prevAvg ? Math.round(((recentAvg - prevAvg) / prevAvg) * 100) : 0;

  const peakIdx = ratios.indexOf(Math.max(...ratios));
  const peakMonth = Number((series[peakIdx]?.period || "").slice(5, 7)) || null;
  const direction = momentum > 10 ? "상승" : momentum < -10 ? "하락" : "보합";

  return { series, momentum, direction, peakMonth };
}

// 최근 N개월 월간 검색 트렌드(상대값 0~100). 실패 시 null(graceful).
export async function searchTrend(keyword, { months = 12 } = {}) {
  const id = process.env.NAVER_CLIENT_ID;
  const sec = process.env.NAVER_CLIENT_SECRET;
  if (!id || !sec || !keyword) return null;

  const end = new Date();
  const start = new Date(end);
  start.setMonth(start.getMonth() - (months - 1));
  start.setDate(1);

  const body = {
    startDate: fmt(start),
    endDate: fmt(end),
    timeUnit: "month",
    keywordGroups: [{ groupName: keyword, keywords: [keyword] }],
  };

  try {
    const r = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "X-Naver-Client-Id": id, "X-Naver-Client-Secret": sec, "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(8000),
    });
    if (!r.ok) return null;
    const j = await r.json();
    const data = j.results?.[0]?.data || [];
    return data.length ? summarize(data) : null;
  } catch {
    return null;
  }
}
