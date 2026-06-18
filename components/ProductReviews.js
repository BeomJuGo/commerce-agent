"use client";
import { useState } from "react";
import { postJSON } from "@/components/ui";

export default function ProductReviews({ productName }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      setData(await postJSON("/api/review", { productName }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mt-12 border-t border-black/[0.07] pt-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-[#18181b]">리뷰 요약 · 장단점 분석</h2>
        {!data && (
          <button
            onClick={load}
            disabled={loading}
            className="ca-btn-primary whitespace-nowrap rounded-full bg-[#ff5c1a] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {loading ? "AI 분석 중…" : "AI 리뷰 분석"}
          </button>
        )}
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {data && (
        <div className="mt-4 space-y-4">
          <div className="rounded-2xl border border-black/[0.07] bg-[#ffffff] p-5">
            <div className="mb-2 flex items-center gap-2">
              {data.score != null && (
                <span className="rounded-full bg-[#ff5c1a]/15 px-2 py-0.5 text-xs font-medium text-[#e0480f]">{data.score}점</span>
              )}
              {data.summary && <p className="text-sm text-[#3f3f46]">{data.summary}</p>}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm font-semibold text-emerald-600">장점</p>
                <ul className="mt-1 list-disc pl-5 text-sm text-[#52525b]">
                  {data.pros?.map((x, i) => (
                    <li key={i}>{x}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-sm font-semibold text-red-600">단점</p>
                <ul className="mt-1 list-disc pl-5 text-sm text-[#52525b]">
                  {data.cons?.map((x, i) => (
                    <li key={i}>{x}</li>
                  ))}
                </ul>
              </div>
            </div>
            {data.verdict && <p className="mt-4 rounded-xl bg-black/[0.04] px-4 py-3 text-sm text-[#3f3f46]">{data.verdict}</p>}
          </div>

          {data.reviews?.length > 0 && (
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-[#18181b]">사용자 리뷰</p>
                <span className="ca-mono text-[10px] text-[#a1a1aa]">※ AI가 평판을 바탕으로 정리한 대표 리뷰</span>
              </div>
              <div className="space-y-2">
                {data.reviews.map((r, i) => (
                  <div key={i} className="rounded-xl border border-black/[0.07] bg-black/[0.02] px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-[#e0480f]">
                        {"★".repeat(r.rating)}
                        <span className="text-[#d4d4d8]">{"★".repeat(5 - r.rating)}</span>
                      </span>
                      <span className="ca-mono text-[10px] text-[#a1a1aa]">{r.sentiment}</span>
                    </div>
                    <p className="mt-1 text-sm text-[#52525b]">{r.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
