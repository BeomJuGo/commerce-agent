"use client";
import { useEffect, useState, useCallback } from "react";
import { PageHeader, Card, Button, ErrorBox, Field, inputClass, postJSON, formatPrice } from "@/components/ui";

export default function LinksPage() {
  const [query, setQuery] = useState("");
  const [memo, setMemo] = useState("");
  const [tags, setTags] = useState("");
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dbOff, setDbOff] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/links");
      const data = await res.json().catch(() => ({}));
      if (res.status === 503) {
        setDbOff(true);
        return;
      }
      if (!res.ok) throw new Error(data.error || "조회 실패");
      setLinks(data.links || []);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function add(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const body = { query };
      if (memo) body.memo = memo;
      const t = tags.split(",").map((s) => s.trim()).filter(Boolean);
      if (t.length) body.tags = t;
      await postJSON("/api/links", body);
      setQuery("");
      setMemo("");
      setTags("");
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function remove(id) {
    if (!confirm("이 링크를 삭제할까요?")) return;
    await fetch(`/api/links?id=${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div>
      <PageHeader
        emoji="🔗"
        title="네이버 상품 링크 관리"
        description="검색어를 입력하면 네이버 쇼핑에서 제목·가격·이미지를 보강해 저장하고 태그로 관리합니다."
      />
      {dbOff ? (
        <ErrorBox message="MongoDB가 설정되지 않아 링크 저장 기능을 사용할 수 없습니다. (.env의 MONGODB_URI 설정 필요)" />
      ) : (
        <>
          <Card className="mb-6">
            <form onSubmit={add} className="space-y-3">
              <Field label="상품 검색어">
                <input
                  className={inputClass}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="예: 무선 이어폰"
                  required
                />
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="메모 (선택)">
                  <input className={inputClass} value={memo} onChange={(e) => setMemo(e.target.value)} />
                </Field>
                <Field label="태그 (쉼표 구분, 선택)">
                  <input className={inputClass} value={tags} onChange={(e) => setTags(e.target.value)} placeholder="가전, 추천" />
                </Field>
              </div>
              <Button type="submit" loading={loading}>
                저장
              </Button>
            </form>
          </Card>
          <ErrorBox message={error} />
          <div className="space-y-3">
            {links.map((l) => (
              <Card key={l.id}>
                <div className="flex items-start gap-3">
                  {l.image && <img src={l.image} alt="" className="h-16 w-16 rounded object-cover" />}
                  <div className="min-w-0 flex-1">
                    <a href={l.url || "#"} target="_blank" rel="noreferrer" className="font-medium text-gray-900 hover:text-indigo-600">
                      {l.title || l.query}
                    </a>
                    {l.lprice != null && <p className="text-sm text-indigo-600">{formatPrice(l.lprice)}</p>}
                    {l.memo && <p className="text-sm text-gray-600">📝 {l.memo}</p>}
                    {l.tags?.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {l.tags.map((t) => (
                          <span key={t} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button onClick={() => remove(l.id)} className="text-sm text-gray-400 hover:text-red-600">
                    삭제
                  </button>
                </div>
              </Card>
            ))}
            {links.length === 0 && <p className="text-sm text-gray-500">저장된 링크가 없습니다.</p>}
          </div>
        </>
      )}
    </div>
  );
}
