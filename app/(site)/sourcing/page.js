"use client";
import { useState } from "react";
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
        description="분야/키워드를 입력하면 소싱 아이디어와 함께 현재 시장의 가격대·경쟁강도 신호를 제안합니다."
      />
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
