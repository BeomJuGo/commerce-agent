"use client";
import { useEffect, useState, useCallback } from "react";
import { PageHeader, Card, Button, ErrorBox, Field, inputClass, postJSON, formatPrice } from "@/components/ui";

export default function LinksPage() {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
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
      const body = { url };
      if (title) body.title = title;
      if (memo) body.memo = memo;
      const t = tags.split(",").map((s) => s.trim()).filter(Boolean);
      if (t.length) body.tags = t;
      await postJSON("/api/links", body);
      setUrl("");
      setTitle("");
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
    <div className="mx-auto max-w-3xl px-6 py-12">
      <PageHeader
        eyebrow="LINKS"
        title="쿠팡/자사몰 링크 관리 도우미"
        description="쿠팡·자사몰 상품 URL을 붙여넣으면 제목·이미지·가격을 자동 보강해 저장하고 태그로 관리합니다."
      />
      {dbOff ? (
        <ErrorBox message="MongoDB가 설정되지 않아 링크 저장 기능을 사용할 수 없습니다. (.env의 MONGODB_URI 설정 필요)" />
      ) : (
        <>
          <Card className="mb-6">
            <form onSubmit={add} className="space-y-3">
              <Field label="상품 URL" hint="쿠팡·자사몰 등 상품 페이지 주소를 붙여넣으세요.">
                <input
                  className={inputClass}
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://www.coupang.com/vp/products/..."
                  required
                />
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="제목 (선택, 미입력 시 자동 추출)">
                  <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} />
                </Field>
                <Field label="태그 (쉼표 구분, 선택)">
                  <input className={inputClass} value={tags} onChange={(e) => setTags(e.target.value)} placeholder="가전, 추천" />
                </Field>
              </div>
              <Field label="메모 (선택)">
                <input className={inputClass} value={memo} onChange={(e) => setMemo(e.target.value)} />
              </Field>
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
                    <div className="flex items-center gap-2">
                      {l.source && (
                        <span className="ca-mono rounded border border-[#ff5c1a]/30 bg-[#ff5c1a]/10 px-1.5 py-0.5 text-[10px] text-[#ff7a3d]">
                          {l.source}
                        </span>
                      )}
                      <a href={l.url || "#"} target="_blank" rel="noreferrer" className="truncate font-medium text-[#eaeaea] hover:text-[#ff7a3d]">
                        {l.title}
                      </a>
                    </div>
                    {l.price != null && <p className="mt-0.5 text-sm text-[#ff7a3d]">{formatPrice(l.price)}</p>}
                    {l.memo && <p className="mt-0.5 text-sm text-[#909093]">{l.memo}</p>}
                    {l.tags?.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {l.tags.map((t) => (
                          <span key={t} className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-xs text-[#9a9a9d]">
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button onClick={() => remove(l.id)} className="ca-mono text-xs text-[#6f6f72] hover:text-red-400">
                    삭제
                  </button>
                </div>
              </Card>
            ))}
            {links.length === 0 && <p className="text-sm text-[#86868a]">저장된 링크가 없습니다.</p>}
          </div>
        </>
      )}
    </div>
  );
}
