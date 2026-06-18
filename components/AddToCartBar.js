"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { addToCart } from "@/lib/cart";

export default function AddToCartBar({ product }) {
  const [added, setAdded] = useState(false);
  const router = useRouter();

  return (
    <div className="mt-6 flex gap-3">
      <button
        onClick={() => {
          addToCart(product);
          setAdded(true);
          setTimeout(() => setAdded(false), 1200);
        }}
        className="flex-1 whitespace-nowrap rounded-xl border border-black/10 bg-black/[0.04] py-3 font-medium text-[#27272a] transition hover:border-[#ff5c1a]/50 hover:text-[#e0480f]"
      >
        {added ? "담겼습니다 ✓" : "장바구니 담기"}
      </button>
      <button
        onClick={() => {
          addToCart(product);
          router.push("/cart");
        }}
        className="ca-btn-primary flex-1 whitespace-nowrap rounded-xl bg-[#ff5c1a] py-3 font-semibold text-white"
      >
        바로 구매
      </button>
    </div>
  );
}
