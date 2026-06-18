"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getCart, setQty, removeFromCart, cartTotal, clearCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";

export default function CartPage() {
  const [cart, setCart] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  const refresh = () => setCart(getCart());

  useEffect(() => {
    setMounted(true);
    refresh();
    const h = () => refresh();
    window.addEventListener("ca-cart-change", h);
    return () => window.removeEventListener("ca-cart-change", h);
  }, []);

  const total = cartTotal(cart);

  async function order() {
    setPlacing(true);
    setError("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cart, total }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error || "주문에 실패했습니다.");
      clearCart();
      window.location.href = `/order/complete?no=${encodeURIComponent(d.orderNo)}`;
    } catch (e) {
      setError(e.message);
    } finally {
      setPlacing(false);
    }
  }

  if (!mounted) return <div className="mx-auto max-w-3xl px-6 py-12" />;

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 style={{ fontSize: 26, fontWeight: 800, color: "#18181b" }}>장바구니</h1>

      {cart.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-black/[0.07] bg-[#ffffff] px-6 py-12 text-center">
          <p className="text-[#71717a]">장바구니가 비어 있습니다.</p>
          <Link href="/" className="mt-3 inline-block text-[#e0480f]">
            쇼핑하러 가기 →
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-6 space-y-3">
            {cart.map((it) => (
              <div key={it.pkey} className="flex items-center gap-3 rounded-2xl border border-black/[0.07] bg-[#ffffff] p-3">
                {it.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={it.image} alt="" className="h-20 w-20 flex-shrink-0 rounded-lg object-cover" />
                ) : (
                  <div className="ca-mono flex h-20 w-20 items-center justify-center rounded-lg bg-[#f1f1f3] text-[10px] text-[#a1a1aa]">
                    NO IMG
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm text-[#27272a]">{it.title}</p>
                  <p className="mt-1 font-semibold text-[#e0480f]">{formatPrice(it.lprice)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setQty(it.pkey, it.qty - 1)} className="h-7 w-7 rounded-md border border-black/10 text-[#3f3f46]">
                    −
                  </button>
                  <span className="ca-mono w-6 text-center text-sm text-[#27272a]">{it.qty}</span>
                  <button onClick={() => setQty(it.pkey, it.qty + 1)} className="h-7 w-7 rounded-md border border-black/10 text-[#3f3f46]">
                    +
                  </button>
                </div>
                <button onClick={() => removeFromCart(it.pkey)} className="ca-mono ml-1 text-xs text-[#a1a1aa] hover:text-red-600">
                  삭제
                </button>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-black/[0.07] bg-[#ffffff] p-5">
            <div className="flex items-center justify-between">
              <span className="text-[#71717a]">총 결제금액</span>
              <span className="text-2xl font-extrabold text-[#e0480f]">{formatPrice(total)}</span>
            </div>
            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
            <button
              onClick={order}
              disabled={placing}
              className="ca-btn-primary mt-4 w-full whitespace-nowrap rounded-full bg-[#ff5c1a] py-3 font-semibold text-white disabled:opacity-50"
            >
              {placing ? "주문 처리 중…" : "주문하기 (모의 결제)"}
            </button>
            <p className="ca-mono mt-2 text-center text-[11px] text-[#b0b0b8]">실제 결제는 발생하지 않는 데모 주문입니다.</p>
          </div>
        </>
      )}
    </div>
  );
}
