"use client";
import Link from "next/link";
import Image from "next/image";
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
    <div className="flex flex-col overflow-hidden rounded-2xl border border-black/[0.07] bg-[#ffffff]">
      <Link href={href} className="block">
        <div className="relative aspect-square w-full overflow-hidden bg-[#f1f1f3]">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.title || ""}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px"
              className="object-cover transition hover:scale-105"
            />
          ) : (
            <div className="ca-mono flex h-full w-full items-center justify-center text-xs text-[#a1a1aa]">NO IMAGE</div>
          )}
        </div>
        <div className="p-3">
          <p className="line-clamp-2 min-h-[2.5rem] text-sm text-[#27272a]">{product.title}</p>
          <p className="mt-1 text-base font-bold text-[#e0480f]">{formatPrice(product.lprice)}</p>
          {product.mallName && <p className="mt-0.5 text-xs text-[#9a9aa2]">{product.mallName}</p>}
          {product.reason && (
            <p className="mt-1.5 line-clamp-2 rounded-md bg-[#ff5c1a]/10 px-2 py-1 text-xs text-[#c2410c]">
              AI · {product.reason}
            </p>
          )}
        </div>
      </Link>
      <div className="px-3 pb-3">
        <button
          onClick={add}
          className="w-full whitespace-nowrap rounded-xl border border-black/10 bg-black/[0.04] py-2 text-sm font-medium text-[#27272a] transition hover:border-[#ff5c1a]/50 hover:text-[#e0480f]"
        >
          {added ? "담겼습니다 ✓" : "장바구니 담기"}
        </button>
      </div>
    </div>
  );
}
