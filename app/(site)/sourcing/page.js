"use client";
import { useState } from "react";
import { PageHeader, Card, Button, ErrorBox, Field, inputClass, postJSON, formatPrice } from "@/components/ui";

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
    <div>
      <PageHeader
        emoji="💡"
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
                <h3 className="font-semibold text-gray-900">{it.idea}</h3>
                {it.market && (
                  <span className="whitespace-nowrap rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                    경쟁 {it.market.competition}
                  </span>
                )}
              </div>
              {it.rationale && <p className="mt-1 text-sm text-gray-700">📌 {it.rationale}</p>}
              {it.demandSignal && <p className="mt-1 text-sm text-gray-600">📈 수요: {it.demandSignal}</p>}
              {it.riskNote && <p className="mt-1 text-sm text-gray-500">⚠️ {it.riskNote}</p>}
              {it.market && it.market.avg != null && (
                <p className="mt-2 text-xs text-gray-500">
                  현재 시장가: {formatPrice(it.market.min)} ~ {formatPrice(it.market.max)} (평균 {formatPrice(it.market.avg)})
                </p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
