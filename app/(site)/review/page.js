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
    <div>
      <PageHeader
        emoji="📝"
        title="리뷰 요약 · 장단점 분석"
        description="상품명을 입력하면 장단점과 구매 추천 여부를 요약합니다. 한 번 분석한 상품은 캐시됩니다."
      />
      <Card className="mb-6">
        <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row">
          <input
            className={inputClass}
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="예: 다이슨 V15 무선청소기"
            required
          />
          <Button type="submit" loading={loading}>
            분석
          </Button>
        </form>
      </Card>
      <ErrorBox message={error} />
      {result && (
        <Card>
          <div className="mb-3 flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-900">{result.productName}</h2>
            {result.score != null && (
              <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
                {result.score}점
              </span>
            )}
            {result.cached && <span className="text-xs text-gray-400">캐시됨</span>}
          </div>
          {result.summary && <p className="text-gray-700">{result.summary}</p>}
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-semibold text-green-700">👍 장점</p>
              <ul className="mt-1 list-disc pl-5 text-sm text-gray-700">
                {result.pros?.map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold text-red-700">👎 단점</p>
              <ul className="mt-1 list-disc pl-5 text-sm text-gray-700">
                {result.cons?.map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
            </div>
          </div>
          {result.verdict && (
            <p className="mt-4 rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-800">🧠 {result.verdict}</p>
          )}
        </Card>
      )}
    </div>
  );
}
