"use client";
import { useState } from "react";
import { PageHeader, Card, Button, ErrorBox, Field, inputClass, postJSON } from "@/components/ui";

export default function ReviewPage() {
  const [productName, setProductName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      setResult(await postJSON("/api/review", { productName }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <PageHeader
        eyebrow="REVIEW"
        title="리뷰 요약 · 장단점 분석"
        description="상품명을 입력하면 장단점과 구매 추천 여부를 요약합니다. 한 번 분석한 상품은 캐시됩니다."
      />
      <Card className="mb-6">
        <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
          <input
            className={`${inputClass} sm:flex-1`}
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="예: 다이슨 V15 무선청소기"
            required
          />
          <Button type="submit" loading={loading} className="shrink-0 whitespace-nowrap px-7">
            분석
          </Button>
        </form>
      </Card>
      <ErrorBox message={error} />
      {result && (
        <Card>
          <div className="mb-3 flex items-center gap-2">
            <h2 className="text-lg font-semibold text-[#fafafa]">{result.productName}</h2>
            {result.score != null && (
              <span className="rounded-full bg-[#ff5c1a]/15 px-2 py-0.5 text-xs font-medium text-[#ff7a3d]">
                {result.score}점
              </span>
            )}
            {result.cached && <span className="ca-mono text-xs text-[#6f6f72]">CACHED</span>}
          </div>
          {result.summary && <p className="text-[#b8b8bc]">{result.summary}</p>}
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-semibold text-emerald-400">장점</p>
              <ul className="mt-1 list-disc pl-5 text-sm text-[#b8b8bc]">
                {result.pros?.map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold text-red-400">단점</p>
              <ul className="mt-1 list-disc pl-5 text-sm text-[#b8b8bc]">
                {result.cons?.map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
            </div>
          </div>
          {result.verdict && (
            <p className="mt-4 rounded-xl bg-white/[0.04] px-4 py-3 text-sm text-[#c8c8cc]">{result.verdict}</p>
          )}

          {result.reviews?.length > 0 && (
            <div className="mt-6">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-[#fafafa]">사용자 리뷰</p>
                <span className="ca-mono text-[10px] text-[#6f6f72]">※ AI가 평판을 바탕으로 정리한 대표 리뷰</span>
              </div>
              <div className="space-y-2">
                {result.reviews.map((r, i) => (
                  <div key={i} className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm tracking-tight text-[#ff7a3d]">
                        {"★".repeat(r.rating)}
                        <span className="text-[#3a3a3a]">{"★".repeat(5 - r.rating)}</span>
                      </span>
                      <span className="ca-mono text-[10px] text-[#6f6f72]">{r.sentiment}</span>
                    </div>
                    <p className="mt-1 text-sm text-[#b8b8bc]">{r.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
