"use client";
import { useState, useEffect } from "react";
import { PageHeader, Card, Button, ErrorBox, Field, inputClass, postJSON, formatPrice } from "@/components/ui";
import Sparkline from "@/components/Sparkline";

function dirStyle(dir) {
  if (dir === "상승") return { color: "#5fbf8a", border: "rgba(95,191,138,0.4)" };
  if (dir === "하락") return { color: "#ff6b6b", border: "rgba(255,107,107,0.4)" };
  return { color: "#9a9a9d", border: "rgba(255,255,255,0.15)" };
}

export default function SourcingPage() {
  const [keyword, setKeyword] = useState("");
  const [marginTarget, setMarginTarget] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [board, setBoard] = useState(null);
  const [analyzeKw, setAnalyzeKw] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisErr, setAnalysisErr] = useState("");

  useEffect(() => {
    fetch("/api/trends")
      .then((r) => r.json())
      .then((d) => setBoard(d.board || []))
      .catch(() => setBoard([]));
  }, []);

  async function analyzeTrend(t) {
    setKeyword(t.keyword);
    setAnalyzeKw(t.keyword);
    setAnalysis(null);
    setAnalysisErr("");
    setAnalyzing(true);
    try {
      const d = await postJSON("/api/trend-analysis", {
        keyword: t.keyword,
        momentum: t.momentum,
        direction: t.direction,
        peakMonth: t.peakMonth,
        series: t.series,
      });
      setAnalysis(d.analysis);
    } catch (err) {
      setAnalysisErr(err.message);
    } finally {
      setAnalyzing(false);
    }
  }

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const body = { keyword };
      if (marginTarget) body.marginTarget = Number(marginTarget);
      setResult(await postJSON("/api/sourcing", body));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <PageHeader
        eyebrow="SOURCING"
        title="상품 소싱 아이디어"
        description="분야/키워드를 입력하면 소싱 아이디어와 함께 현재 시장의 가격대·경쟁강도·검색 트렌드·마진 신호를 제안합니다."
      />

      {board && board.length > 0 && (
        <Card className="mb-6">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="ca-mono rounded-md border border-[#ff5c1a]/40 px-2 py-0.5 text-[11px] text-[#ff7a3d]">지금 뜨는 검색 트렌드</span>
            <span className="text-xs text-[#86868a]">최근 추세가 좋은 순 · 클릭하면 키워드로 입력</span>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {board.slice(0, 10).map((t) => (
              <button
                key={t.keyword}
                type="button"
                onClick={() => analyzeTrend(t)}
                className={`flex items-center gap-2 rounded-xl border bg-white/[0.02] px-3 py-2 text-left transition hover:border-[#ff5c1a]/50 ${
                  analyzeKw === t.keyword ? "border-[#ff5c1a]/60" : "border-white/[0.07]"
                }`}
              >
                <span className="min-w-0 flex-1 truncate text-sm text-[#eaeaea]">{t.keyword}</span>
                <span className="ca-mono whitespace-nowrap text-xs font-semibold" style={{ color: dirStyle(t.direction).color }}>
                  {t.direction} {t.momentum > 0 ? "+" : ""}
                  {t.momentum}%
                </span>
                <Sparkline series={t.series} width={84} height={26} />
              </button>
            ))}
          </div>
        </Card>
      )}

      {(analyzing || analysis || analysisErr) && (
        <Card className="mb-6">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="ca-mono rounded-md border border-[#ff5c1a]/40 px-2 py-0.5 text-[11px] text-[#ff7a3d]">AI 트렌드 해석</span>
            <span className="font-semibold text-[#fafafa]">{analyzeKw}</span>
            {analysis?.verdict && (
              <span
                className="ca-mono rounded-md px-2 py-0.5 text-xs font-semibold"
                style={
                  analysis.verdict === "좋음"
                    ? { color: "#5fbf8a", border: "1px solid rgba(95,191,138,0.4)" }
                    : analysis.verdict === "나쁨"
                    ? { color: "#ff6b6b", border: "1px solid rgba(255,107,107,0.4)" }
                    : { color: "#9a9a9d", border: "1px solid rgba(255,255,255,0.15)" }
                }
              >
                {analysis.verdict}
              </span>
            )}
          </div>

          {analyzing && <p className="text-sm text-[#86868a]">AI가 추세를 분석하는 중…</p>}
          {analysisErr && <p className="text-sm text-red-300">{analysisErr}</p>}

          {analysis && (
            <div className="space-y-2.5 text-sm">
              {analysis.summary && <p className="text-[#c8c8cc]">{analysis.summary}</p>}
              {analysis.reasons?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-[#909093]">추세 원인 (추정)</p>
                  <ul className="mt-1 list-disc pl-5 text-[#b8b8bc]">
                    {analysis.reasons.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}
              {analysis.seasonality && (
                <p className="text-[#b8b8bc]">
                  <b className="text-[#909093]">계절성</b> · {analysis.seasonality}
                </p>
              )}
              {analysis.sourcingTip && (
                <p className="rounded-xl bg-[#ff5c1a]/10 px-3 py-2 text-[#ff9d6e]">
                  <b>소싱 팁</b> · {analysis.sourcingTip}
                </p>
              )}
              {analysis.outlook && (
                <p className="text-[#b8b8bc]">
                  <b className="text-[#909093]">전망</b> · {analysis.outlook}
                </p>
              )}
              <p className="ca-mono text-[10px] leading-relaxed text-[#5e5e62]">
                ※ 검색 트렌드 데이터 + AI 일반지식 기반 해석(추정). 실시간 시장·뉴스 요인은 반영되지 않을 수 있습니다.
              </p>
            </div>
          )}
        </Card>
      )}

      <Card className="mb-6">
        <form onSubmit={submit} className="space-y-4">
          <Field label="분야 / 키워드">
            <input
              className={inputClass}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="예: 캠핑용품, 반려동물, 홈카페"
              required
            />
          </Field>
          <Field label="목표 마진율 (%, 선택)">
            <input
              className={inputClass}
              type="number"
              value={marginTarget}
              onChange={(e) => setMarginTarget(e.target.value)}
              placeholder="30"
            />
          </Field>
          <Button type="submit" loading={loading}>
            아이디어 받기
          </Button>
        </form>
      </Card>
      <ErrorBox message={error} />
      {result && (
        <div className="space-y-4">
          {result.ideas?.map((it, i) => (
            <Card key={i}>
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold text-[#fafafa]">{it.idea}</h3>
                {it.market && (
                  <span className="whitespace-nowrap rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-xs text-[#9a9a9d]">
                    경쟁 {it.market.competition}
                  </span>
                )}
              </div>
              {it.rationale && <p className="mt-2 text-sm text-[#b8b8bc]">{it.rationale}</p>}
              {it.demandSignal && <p className="mt-1 text-sm text-[#909093]">수요(AI): {it.demandSignal}</p>}
              {it.riskNote && <p className="mt-1 text-sm text-[#86868a]">리스크: {it.riskNote}</p>}

              {it.trend ? (
                <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 py-2">
                  <span className="ca-mono text-[10px] tracking-wider text-[#6f6f72]">검색 트렌드 (데이터랩, 12개월)</span>
                  <span
                    className="ca-mono rounded-md px-2 py-0.5 text-xs font-semibold"
                    style={{ color: dirStyle(it.trend.direction).color, border: `1px solid ${dirStyle(it.trend.direction).border}` }}
                  >
                    {it.trend.direction} {it.trend.momentum > 0 ? "+" : ""}
                    {it.trend.momentum}%
                  </span>
                  {it.trend.peakMonth && <span className="text-xs text-[#909093]">피크 {it.trend.peakMonth}월</span>}
                  <span className="ml-auto">
                    <Sparkline series={it.trend.series} />
                  </span>
                </div>
              ) : (
                <p className="ca-mono mt-3 text-[10px] text-[#5e5e62]">검색 트렌드 데이터 없음</p>
              )}

              {it.margin && it.margin.marginPct != null && (
                <div className="mt-3 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 py-2.5">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                    <span className="text-[#909093]">예상 사입가<span className="text-[#5e5e62]">(추정)</span> <b className="text-[#c8c8cc]">{formatPrice(it.margin.estCost)}</b></span>
                    <span className="text-[#909093]">시장 평균가 <b className="text-[#c8c8cc]">{formatPrice(it.margin.sellPrice)}</b></span>
                    <span className="text-[#909093]">예상 마진율 <b className="text-[#ff7a3d]">{it.margin.marginPct}%</b></span>
                    {it.margin.target != null && (
                      <span
                        className="ca-mono rounded-md px-2 py-0.5 font-semibold"
                        style={
                          it.margin.targetMet
                            ? { color: "#5fbf8a", border: "1px solid rgba(95,191,138,0.4)" }
                            : { color: "#ff6b6b", border: "1px solid rgba(255,107,107,0.4)" }
                        }
                      >
                        목표 {it.margin.target}% {it.margin.targetMet ? "달성 가능" : "미달"}
                      </span>
                    )}
                  </div>
                  {it.margin.target != null && !it.margin.targetMet && (
                    <p className="ca-mono mt-1.5 text-[11px] text-[#86868a]">
                      목표 달성: 사입가 ≤ {formatPrice(it.margin.requiredCost)} 또는 판매가 ≥ {formatPrice(it.margin.requiredSell)}
                    </p>
                  )}
                </div>
              )}

              {it.market && it.market.avg != null && (
                <p className="ca-mono mt-2 text-xs text-[#6f6f72]">
                  시장가 {formatPrice(it.market.min)} ~ {formatPrice(it.market.max)} (평균 {formatPrice(it.market.avg)}) · 경쟁 {it.market.competition}
                </p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
