"use client";
import { useState } from "react";
import { PageHeader, Card, Button, ErrorBox, ProductCard, Field, inputClass, postJSON } from "@/components/ui";

const TYPES = [
  ["travel", "여행"],
  ["season", "계절"],
  ["lifestyle", "라이프스타일"],
];

export default function CurationPage() {
  const [type, setType] = useState("travel");
  const [detail, setDetail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      setResult(await postJSON("/api/curation", { context: { type, detail } }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        emoji="🧳"
        title="라이프스타일 큐레이션"
        description="여행·계절·라이프스타일 맥락을 입력하면 테마별로 상품을 큐레이션합니다."
      />
      <Card className="mb-6">
        <form onSubmit={submit} className="space-y-4">
          <Field label="맥락 유형">
            <div className="flex gap-2">
              {TYPES.map(([v, label]) => (
                <button
                  type="button"
                  key={v}
                  onClick={() => setType(v)}
                  className={`rounded-xl border px-4 py-2 text-sm ${
                    type === v ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-gray-300 text-gray-600"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </Field>
          <Field label="상세 내용" hint="예: 2박3일 제주 겨울 여행 / 캠핑 입문 / 자취 원룸 인테리어">
            <input
              className={inputClass}
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="구체적인 상황을 입력하세요."
              required
            />
          </Field>
          <Button type="submit" loading={loading}>
            큐레이션 받기
          </Button>
        </form>
      </Card>
      <ErrorBox message={error} />
      {result && (
        <div className="space-y-6">
          {(result.title || result.intro) && (
            <Card>
              <h2 className="text-lg font-semibold text-gray-900">{result.title}</h2>
              <p className="mt-1 text-gray-600">{result.intro}</p>
            </Card>
          )}
          {result.themes?.map((t, i) => (
            <div key={i}>
              <h3 className="font-semibold text-gray-900">{t.theme}</h3>
              <p className="mb-3 text-sm text-gray-600">{t.description}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {t.products?.map((p, j) => (
                  <ProductCard key={j} product={p} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
