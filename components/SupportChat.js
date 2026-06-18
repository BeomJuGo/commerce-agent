"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getCart, addToCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";

export default function SupportChat() {
  const [open, setOpen] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [messages, setMessages] = useState([
    { role: "assistant", content: "안녕하세요! 상품 추천·가격·비교 무엇이든 물어보세요. 지금 보고 계신 상품이나 장바구니에 대해서도 답해드려요." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState({});
  const endRef = useRef(null);

  function addOne(p) {
    addToCart({ pkey: p.pkey, title: p.title, image: p.image, lprice: p.lprice, mallName: p.mallName });
    setAdded((a) => ({ ...a, [p.pkey]: true }));
    setTimeout(
      () =>
        setAdded((a) => {
          const n = { ...a };
          delete n[p.pkey];
          return n;
        }),
      1500
    );
  }

  useEffect(() => {
    let sid = localStorage.getItem("ca_sid");
    if (!sid) {
      sid = (crypto.randomUUID && crypto.randomUUID()) || `s_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      localStorage.setItem("ca_sid", sid);
    }
    setSessionId(sid);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, open]);

  async function send(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: text }]);
    setLoading(true);
    try {
      const currentProduct = typeof window !== "undefined" ? window.__caCurrentProduct : null;
      const cart = getCart()
        .slice(0, 50)
        .map((c) => ({ title: c.title, qty: c.qty, lprice: c.lprice }));
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          message: text,
          shopContext: "COMMERCE STORE",
          ...(currentProduct?.title ? { currentProduct } : {}),
          ...(cart.length ? { cart } : {}),
        }),
      });
      const d = await res.json().catch(() => ({}));
      setMessages((m) => [
        ...m,
        { role: "assistant", content: res.ok ? d.reply : d.error || "잠시 후 다시 시도해주세요.", products: d.products || [] },
      ]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "네트워크 오류가 발생했습니다." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-5 z-[2147483000] flex h-[540px] w-[370px] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border border-black/10 bg-[#f1f1f3] shadow-2xl">
          <div className="flex items-center gap-2 bg-[#ff5c1a] px-4 py-3 text-white">
            <span className="ca-mono text-sm font-extrabold">AI</span>
            <div>
              <p className="text-sm font-semibold leading-tight">상담원</p>
              <p className="text-[11px] opacity-70">COMMERCE STORE</p>
            </div>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto px-3 py-4">
            {messages.map((m, i) => (
              <div key={i}>
                <div className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm ${
                      m.role === "user" ? "bg-[#ff5c1a] text-white" : "border border-black/10 bg-[#ffffff] text-[#27272a]"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
                {m.products?.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {m.products.map((p) => (
                      <div
                        key={p.pkey}
                        className="flex items-center gap-2 rounded-xl border border-black/10 bg-[#ffffff] p-2 transition hover:border-[#ff5c1a]/50"
                      >
                        <Link
                          href={`/product/${encodeURIComponent(p.pkey)}?q=${encodeURIComponent(p.title || "")}`}
                          onClick={() => setOpen(false)}
                          className="flex min-w-0 flex-1 items-center gap-2"
                        >
                          {p.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={p.image} alt="" className="h-12 w-12 flex-shrink-0 rounded-lg object-cover" />
                          ) : (
                            <div className="ca-mono flex h-12 w-12 items-center justify-center rounded-lg bg-[#f1f1f3] text-[9px] text-[#a1a1aa]">
                              NO IMG
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="line-clamp-2 text-xs text-[#27272a]">{p.title}</p>
                            <p className="text-xs font-semibold text-[#e0480f]">{formatPrice(p.lprice)}</p>
                          </div>
                        </Link>
                        <button
                          onClick={() => addOne(p)}
                          className="shrink-0 whitespace-nowrap rounded-lg border border-[#ff5c1a]/40 px-2.5 py-1.5 text-xs font-medium text-[#e0480f] transition hover:bg-[#ff5c1a]/10"
                        >
                          {added[p.pkey] ? "담김 ✓" : "담기"}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl border border-black/10 bg-[#ffffff] px-3 py-2 text-sm text-[#a1a1aa]">입력 중…</div>
              </div>
            )}
            <div ref={endRef} />
          </div>
          <form onSubmit={send} className="flex gap-2 border-t border-black/10 p-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="메시지를 입력하세요…"
              className="flex-1 rounded-xl border border-black/10 bg-[#ffffff] px-3 py-2 text-sm text-[#18181b] placeholder:text-[#a1a1aa] outline-none focus:border-[#ff5c1a]"
            />
            <button type="submit" disabled={loading} className="rounded-xl bg-[#ff5c1a] px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">
              전송
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="AI 상담"
        className="ca-btn-primary fixed bottom-5 right-5 z-[2147483000] flex h-14 items-center gap-2 rounded-full bg-[#ff5c1a] px-5 font-semibold text-white shadow-2xl"
      >
        {open ? "✕ 닫기" : "AI 상담"}
      </button>
    </>
  );
}
