"use client";
import { useState } from "react";
import { PageHeader, Card, Button, ErrorBox, ProductCard, Field, inputClass, postJSON } from "@/components/ui";

export default function RecommendPage() {
  const [situation, setSituation] = useState("");
  const [budget, setBudget] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const body = { situation };
      if (budget) body.budget = Number(budget);
      setResult(await postJSON("/api/recommend", body));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <PageHeader
        eyebrow="RECOMMEND"
        title="상황 기반 상품 추천"
        description="상황을 자연어로 설명하면 AI가 키워드를 뽑아 네이버 쇼핑에서 딱 맞는 상품을 추천합니다."
      />
      <Card className="mb-6">
        <form onSubmit={submit} className="space-y-4">
          <Field label="어떤 상황인가요?" hint="예: 신혼집 거실에 둘 가성비 공기청정기">
            <textarea
              className={inputClass}
              rows={3}
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              placeholder="상황을 자세히 적을수록 추천이 정확해집니다."
              required
            />
          </Field>
          <Field label="예산 (원, 선택)">
            <input
              className={inputClass}
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="300000"
            />
          </Field>
          <Button type="submit" loading={loading}>
            추천받기
          </Button>
        </form>
      </Card>
      <ErrorBox message={error} />
      {result && (
        <div className="space-y-4">
          {result.summary && (
            <Card>
              <p className="text-[#eaeaea]">{result.summary}</p>
              {result.keywords?.length > 0 && (
                <p className="ca-mono mt-2 text-xs text-[#6f6f72]">검색 키워드: {result.keywords.join(", ")}</p>
              )}
            </Card>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            {result.products?.map((p, i) => (
              <ProductCard key={i} product={p} />
            ))}
          </div>
          {result.products?.length === 0 && <p className="text-[#86868a]">추천 상품이 없습니다.</p>}
        </div>
      )}
    </div>
  );
}
