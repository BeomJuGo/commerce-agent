"use client";
import Link from "next/link";
import { useState } from "react";
import { addToCart } from "@/lib/cart";
import { formatPrice } from "@/components/ui";

export default function ProductTile({ product }) {
  const [added, setAdded] = useState(false);
  const href = `/product/${encodeURIComponent(product.pkey)}?q=${encodeURIComponent(product.title || "")}`;

  function add(e) {
    e.preventDefault();
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-[#141414]">
      <Link href={href} className="block">
        <div className="aspect-square w-full overflow-hidden bg-[#0e0e0e]">
          {product.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.image} alt={product.title || ""} className="h-full w-full object-cover transition hover:scale-105" />
          ) : (
            <div className="ca-mono flex h-full w-full items-center justify-center text-xs text-[#6f6f72]">NO IMAGE</div>
          )}
        </div>
        <div className="p-3">
          <p className="line-clamp-2 min-h-[2.5rem] text-sm text-[#eaeaea]">{product.title}</p>
          <p className="mt-1 text-base font-bold text-[#ff7a3d]">{formatPrice(product.lprice)}</p>
          {product.mallName && <p className="mt-0.5 text-xs text-[#86868a]">{product.mallName}</p>}
          {product.reason && (
            <p className="mt-1.5 line-clamp-2 rounded-md bg-[#ff5c1a]/10 px-2 py-1 text-xs text-[#ff9d6e]">
              AI · {product.reason}
            </p>
          )}
        </div>
      </Link>
      <div className="px-3 pb-3">
        <button
          onClick={add}
          className="w-full whitespace-nowrap rounded-xl border border-white/10 bg-white/[0.04] py-2 text-sm font-medium text-[#eaeaea] transition hover:border-[#ff5c1a]/50 hover:text-[#ff7a3d]"
        >
          {added ? "담겼습니다 ✓" : "장바구니 담기"}
        </button>
      </div>
    </div>
  );
}
