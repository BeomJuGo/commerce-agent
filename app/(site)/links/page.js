"use client";
import { useEffect, useState, useCallback } from "react";
import { PageHeader, Card, Button, ErrorBox, Field, inputClass, postJSON, formatPrice } from "@/components/ui";
import Sparkline from "@/components/Sparkline";

function priceChange(l) {
  const h = l.priceHistory || [];
  if (h.length < 2) return null;
  const last = h[h.length - 1].price;
  const prev = h[h.length - 2].price;
  const diff = last - prev;
  if (!diff) return null;
  return { diff, pct: prev ? Math.round((diff / prev) * 100) : 0, up: diff > 0 };
}

export default function LinksPage() {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [memo, setMemo] = useState("");
  const [tags, setTags] = useState("");
  const [q, setQ] = useState("");
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dbOff, setDbOff] = useState(false);

  const load = useCallback(async (query = "") => {
    try {
      const res = await fetch(`/api/links${query ? `?q=${encodeURIComponent(query)}` : ""}`);
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
      if (price) body.price = Number(price.replace(/[^0-9]/g, ""));
      if (memo) body.memo = memo;
      const t = tags.split(",").map((s) => s.trim()).filter(Boolean);
      if (t.length) body.tags = t;
      await postJSON("/api/links", body);
      setUrl("");
      setTitle("");
      setPrice("");
      setMemo("");
      setTags("");
      await load(q);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function refreshPrice(l) {
    let res = await fetch("/api/links", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: l.id }),
    });
    let d = await res.json().catch(() => ({}));
    if (d.ok === false) {
      const input = prompt(`자동 가격 수집 실패(쿠팡 등 봇 차단). "${(l.title || "").slice(0, 24)}"의 현재 가격을 직접 입력하세요(원):`);
      const p = input && Number(input.replace(/[^0-9]/g, ""));
      if (!p) return;
      res = await fetch("/api/links", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: l.id, price: p }),
      });
    }
    await load(q);
  }

  async function remove(id) {
    if (!confirm("이 링크를 삭제할까요?")) return;
    await fetch(`/api/links?id=${id}`, { method: "DELETE" });
    await load(q);
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <PageHeader
        eyebrow="LINKS"
        title="쿠팡/자사몰 링크 관리 도우미"
        description="경쟁사(쿠팡)·자사몰 상품 링크를 한곳에 모아 가격을 추적·관리하는 셀러용 도구입니다."
      />

      <Card className="mb-6">
        <p className="text-sm leading-relaxed text-[#52525b]">
          <b className="text-[#18181b]">이 도구로 할 수 있는 것</b>
          <br />· 추적할 상품 URL을 저장하고 <b>제목·이미지·가격을 자동 보강</b>(OG 지원 사이트)
          <br />· <b>가격 갱신</b>으로 시점별 가격을 기록 → <b>변동 추이</b>(▲▼)와 스파크라인 확인
          <br />· 태그·메모로 분류하고 검색으로 빠르게 찾기
        </p>
        <p className="ca-mono mt-2 text-[11px] text-[#9a9aa2]">
          ※ 쿠팡은 봇 차단으로 자동 수집이 안 됩니다 → 제목·가격을 직접 입력하면 동일하게 추적됩니다. (무신사 등 OG 지원 자사몰은 자동)
        </p>
      </Card>

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
                <Field label="가격 (선택, 쿠팡은 직접 입력)">
                  <input className={inputClass} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="29900" inputMode="numeric" />
                </Field>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="태그 (쉼표 구분, 선택)">
                  <input className={inputClass} value={tags} onChange={(e) => setTags(e.target.value)} placeholder="경쟁사, 가전" />
                </Field>
                <Field label="메모 (선택)">
                  <input className={inputClass} value={memo} onChange={(e) => setMemo(e.target.value)} />
                </Field>
              </div>
              <Button type="submit" loading={loading}>
                저장
              </Button>
            </form>
          </Card>

          <ErrorBox message={error} />

          {/* 검색 필터 */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              load(q);
            }}
            className="mb-4 flex gap-2"
          >
            <input
              className={inputClass}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="제목·태그·출처·메모 검색"
            />
            <Button type="submit" className="shrink-0">
              검색
            </Button>
          </form>

          <div className="space-y-3">
            {links.map((l) => {
              const ch = priceChange(l);
              const series = (l.priceHistory || []).map((h) => ({ ratio: h.price }));
              return (
                <Card key={l.id}>
                  <div className="flex items-start gap-3">
                    {l.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={l.image} alt="" className="h-16 w-16 flex-shrink-0 rounded object-cover" />
                    ) : (
                      <div className="ca-mono flex h-16 w-16 flex-shrink-0 items-center justify-center rounded bg-[#f1f1f3] text-[9px] text-[#a1a1aa]">
                        NO IMG
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        {l.source && (
                          <span className="ca-mono rounded border border-[#ff5c1a]/30 bg-[#ff5c1a]/10 px-1.5 py-0.5 text-[10px] text-[#e0480f]">
                            {l.source}
                          </span>
                        )}
                        <a href={l.url || "#"} target="_blank" rel="noreferrer" className="truncate font-medium text-[#27272a] hover:text-[#e0480f]">
                          {l.title}
                        </a>
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        {l.price != null ? (
                          <span className="text-sm font-semibold text-[#e0480f]">{formatPrice(l.price)}</span>
                        ) : (
                          <span className="text-xs text-[#a1a1aa]">가격 미기록</span>
                        )}
                        {ch && (
                          <span className="ca-mono text-xs font-semibold" style={{ color: ch.up ? "#dc2626" : "#2563eb" }}>
                            {ch.up ? "▲" : "▼"} {Math.abs(ch.pct)}%
                          </span>
                        )}
                        {series.length >= 2 && <Sparkline series={series} width={80} height={22} />}
                        <button onClick={() => refreshPrice(l)} className="ca-mono rounded-md border border-black/10 px-2 py-0.5 text-[11px] text-[#3f3f46] hover:border-[#ff5c1a]/50">
                          가격 갱신
                        </button>
                      </div>

                      {l.memo && <p className="mt-1 text-sm text-[#71717a]">{l.memo}</p>}
                      {l.tags?.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {l.tags.map((t) => (
                            <button
                              key={t}
                              onClick={() => {
                                setQ(t);
                                load(t);
                              }}
                              className="rounded-full border border-black/10 bg-black/[0.04] px-2 py-0.5 text-xs text-[#71717a] hover:border-[#ff5c1a]/40"
                            >
                              #{t}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <button onClick={() => remove(l.id)} className="ca-mono text-xs text-[#a1a1aa] hover:text-red-600">
                      삭제
                    </button>
                  </div>
                </Card>
              );
            })}
            {links.length === 0 && <p className="text-sm text-[#9a9aa2]">저장된 링크가 없습니다. 위에 상품 URL을 붙여넣어 추적을 시작하세요.</p>}
          </div>
        </>
      )}
    </div>
  );
}
