"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { CATEGORIES } from "@/lib/store";
import { cartCount } from "@/lib/cart";

export default function StoreNav({ authed = false }) {
  const [q, setQ] = useState("");
  const [count, setCount] = useState(0);

  useEffect(() => {
    const update = () => setCount(cartCount());
    update();
    window.addEventListener("ca-cart-change", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("ca-cart-change", update);
      window.removeEventListener("storage", update);
    };
  }, []);

  function submit(e) {
    e.preventDefault();
    const term = q.trim();
    if (term) window.location.href = `/search?q=${encodeURIComponent(term)}`;
  }

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-6 py-3">
        <Link href="/" style={{ textDecoration: "none", fontSize: 18, letterSpacing: "-0.01em", whiteSpace: "nowrap" }}>
          <span style={{ fontWeight: 800, color: "#18181b" }}>COMMERCE</span>
          <span style={{ fontWeight: 400, color: "#a1a1aa" }}> STORE</span>
        </Link>

        <form onSubmit={submit} className="order-3 flex w-full items-center gap-2 sm:order-2 sm:w-auto sm:flex-1">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="상품을 검색하세요 (예: 무선 이어폰)"
            className="w-full rounded-full border border-black/10 bg-[#ffffff] px-5 py-2.5 text-sm text-[#18181b] placeholder:text-[#a1a1aa] outline-none focus:border-[#ff5c1a]"
          />
          <button
            type="submit"
            className="ca-btn-primary shrink-0 whitespace-nowrap rounded-full bg-[#ff5c1a] px-5 py-2.5 text-sm font-semibold text-white"
          >
            검색
          </button>
        </form>

        <div className="order-2 ml-auto flex items-center gap-2 sm:order-3 sm:ml-0">
          <Link
            href="/cart"
            className="ca-link-muted relative inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-black/10 px-4 py-2 text-sm text-[#3f3f46]"
          >
            장바구니
            {count > 0 && (
              <span className="ca-mono inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ff5c1a] px-1.5 text-[11px] font-bold text-white">
                {count}
              </span>
            )}
          </Link>
          <Link
            href={authed ? "/admin" : "/login"}
            className="whitespace-nowrap rounded-full bg-black/[0.06] px-4 py-2 text-sm font-medium text-[#27272a] hover:bg-black/[0.12]"
          >
            {authed ? "관리자" : "관리자 로그인"}
          </Link>
        </div>
      </div>

      <nav className="mx-auto flex max-w-6xl flex-wrap gap-x-5 gap-y-1 px-6 pb-2 text-sm">
        <Link href="/" className="ca-link-muted text-[#71717a]">
          홈
        </Link>
        {CATEGORIES.map((c) => (
          <Link key={c.slug} href={`/search?cat=${c.slug}`} className="ca-link-muted whitespace-nowrap text-[#71717a]">
            {c.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
