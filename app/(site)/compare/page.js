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
    <div className="mx-auto max-w-5xl px-6 py-12">
      <PageHeader
        eyebrow="COMPARE"
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
            className="text-sm text-[#ff7a3d] hover:underline disabled:text-[#6f6f72]"
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
              <p className="ca-mono text-xs tracking-widest text-[#6f6f72]">VERDICT</p>
              <p className="mt-2 text-[#eaeaea]">{result.verdict}</p>
              {result.winner && (
                <p className="mt-2 text-sm text-[#ff7a3d]">
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
                    <a href={p.link} target="_blank" rel="noreferrer" className="font-medium text-[#eaeaea] hover:text-[#ff7a3d]">
                      {p.name}
                    </a>
                    <p className="text-sm text-[#ff7a3d]">{formatPrice(p.lprice)}</p>
                  </div>
                </div>
                {p.pros?.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-semibold text-emerald-400">장점</p>
                    <ul className="list-disc pl-5 text-sm text-[#b8b8bc]">
                      {p.pros.map((x, j) => (
                        <li key={j}>{x}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {p.cons?.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-semibold text-red-400">단점</p>
                    <ul className="list-disc pl-5 text-sm text-[#b8b8bc]">
                      {p.cons.map((x, j) => (
                        <li key={j}>{x}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {p.bestFor && <p className="mt-2 text-xs text-[#86868a]">{p.bestFor}</p>}
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
