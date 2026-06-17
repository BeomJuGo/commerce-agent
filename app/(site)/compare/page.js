"use client";
import { useState } from "react";
import { PageHeader, Card, Button, ErrorBox, Field, inputClass, postJSON, formatPrice } from "@/components/ui";

export default function ComparePage() {
  const [names, setNames] = useState(["", ""]);
  const [criteria, setCriteria] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const setName = (i, v) => setNames((prev) => prev.map((x, idx) => (idx === i ? v : x)));

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const products = names
        .map((n) => n.trim())
        .filter(Boolean)
        .map((name) => ({ name }));
      if (products.length < 2) throw new Error("상품을 2개 이상 입력하세요.");
      setResult(await postJSON("/api/compare", { products, criteria: criteria || undefined }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        emoji="⚖️"
        title="비교 · 구매 판단"
        description="여러 상품명을 입력하면 가격대와 장단점을 비교해 무엇을 살지 판단을 도와줍니다."
      />
      <Card className="mb-6">
        <form onSubmit={submit} className="space-y-4">
          {names.map((n, i) => (
            <Field key={i} label={`상품 ${i + 1}`}>
              <input className={inputClass} value={n} onChange={(e) => setName(i, e.target.value)} placeholder="상품명" />
            </Field>
          ))}
          <button
            type="button"
            onClick={() => setNames((p) => [...p, ""])}
            disabled={names.length >= 5}
            className="text-sm text-indigo-600 hover:underline disabled:text-gray-400"
          >
            + 상품 추가
          </button>
          <Field label="중점 비교 기준 (선택)">
            <input
              className={inputClass}
              value={criteria}
              onChange={(e) => setCriteria(e.target.value)}
              placeholder="예: 가성비, 내구성, 디자인"
            />
          </Field>
          <Button type="submit" loading={loading}>
            비교하기
          </Button>
        </form>
      </Card>
      <ErrorBox message={error} />
      {result && (
        <div className="space-y-4">
          {result.verdict && (
            <Card>
              <p className="font-medium text-gray-900">🧠 종합 판단</p>
              <p className="mt-1 text-gray-700">{result.verdict}</p>
              {result.winner && (
                <p className="mt-2 text-sm text-indigo-600">
                  추천: {result.winner.name} — {result.winner.why}
                </p>
              )}
            </Card>
          )}
          <div className="grid gap-4 md:grid-cols-2">
            {result.products?.map((p, i) => (
              <Card key={i}>
                <div className="flex gap-3">
                  {p.image && <img src={p.image} alt="" className="h-16 w-16 rounded object-cover" />}
                  <div>
                    <a href={p.link} target="_blank" rel="noreferrer" className="font-medium text-gray-900 hover:text-indigo-600">
                      {p.name}
                    </a>
                    <p className="text-sm text-indigo-600">{formatPrice(p.lprice)}</p>
                  </div>
                </div>
                {p.pros?.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-semibold text-green-700">장점</p>
                    <ul className="list-disc pl-5 text-sm text-gray-700">
                      {p.pros.map((x, j) => (
                        <li key={j}>{x}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {p.cons?.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-semibold text-red-700">단점</p>
                    <ul className="list-disc pl-5 text-sm text-gray-700">
                      {p.cons.map((x, j) => (
                        <li key={j}>{x}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {p.bestFor && <p className="mt-2 text-xs text-gray-500">👤 {p.bestFor}</p>}
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
