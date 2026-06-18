"use client";
import { useState } from "react";
import { postJSON } from "@/components/ui";
import ProductTile from "@/components/ProductTile";

export default function AIRecommend() {
  const [situation, setSituation] = useState("");
  const [budget, setBudget] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  async function go(e) {
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
    <section className="rounded-2xl border border-[#ff5c1a]/20 bg-[linear-gradient(180deg,rgba(255,92,26,0.06),transparent)] p-6">
      <div className="flex items-center gap-2">
        <span className="ca-mono rounded-md border border-[#ff5c1a]/40 px-2 py-0.5 text-[11px] text-[#e0480f]">AI 추천</span>
        <h2 className="text-lg font-bold text-[#18181b]">상황을 말하면 AI가 골라드려요</h2>
      </div>
      <form onSubmit={go} className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input
          value={situation}
          onChange={(e) => setSituation(e.target.value)}
          placeholder="예: 신혼집 거실에 둘 가성비 공기청정기"
          required
          className="w-full rounded-xl border border-black/10 bg-[#ffffff] px-4 py-2.5 text-sm text-[#18181b] placeholder:text-[#a1a1aa] outline-none focus:border-[#ff5c1a] sm:flex-1"
        />
        <input
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          type="number"
          placeholder="예산(원)"
          className="w-full rounded-xl border border-black/10 bg-[#ffffff] px-4 py-2.5 text-sm text-[#18181b] placeholder:text-[#a1a1aa] outline-none focus:border-[#ff5c1a] sm:w-40"
        />
        <button
          type="submit"
          disabled={loading}
          className="ca-btn-primary shrink-0 whitespace-nowrap rounded-xl bg-[#ff5c1a] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {loading ? "추천 중…" : "AI 추천받기"}
        </button>
      </form>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {loading && (
        <div className="mt-5">
          <p className="mb-4 text-sm text-[#9a9aa2]">AI가 상황에 맞는 상품을 고르고 있어요…</p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-2xl border border-black/[0.07] bg-[#ffffff]">
                <div className="aspect-square w-full animate-pulse bg-black/[0.06]" />
                <div className="space-y-2 p-3">
                  <div className="h-3.5 w-full animate-pulse rounded bg-black/[0.06]" />
                  <div className="h-3.5 w-2/3 animate-pulse rounded bg-black/[0.06]" />
                  <div className="mt-1 h-4 w-1/3 animate-pulse rounded bg-black/[0.08]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {result && (
        <div className="mt-5">
          {result.summary && <p className="mb-4 text-sm text-[#3f3f46]">{result.summary}</p>}
          {result.products?.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {result.products.map((p) => (
                <ProductTile key={p.pkey} product={p} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#9a9aa2]">조건에 맞는 상품을 찾지 못했습니다.</p>
          )}
        </div>
      )}
    </section>
  );
}
