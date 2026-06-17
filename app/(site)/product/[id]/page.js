import Link from "next/link";
import { getProduct } from "@/lib/products";
import { formatPrice } from "@/lib/format";
import AddToCartBar from "@/components/AddToCartBar";

export default async function ProductPage({ params, searchParams }) {
  const { id } = await params;
  const sp = await searchParams;
  const product = await getProduct(decodeURIComponent(id), { q: sp.q ? String(sp.q) : undefined });

  if (!product) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <p className="text-[#9a9a9d]">상품을 찾을 수 없습니다.</p>
        <Link href="/" className="mt-3 inline-block text-[#ff7a3d]">
          홈으로 →
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <Link href="/" className="ca-mono text-xs text-[#ff7a3d] hover:underline">
        ← 쇼핑 계속하기
      </Link>
      <div className="mt-4 grid gap-8 md:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0e0e0e]">
          {product.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.image} alt={product.title || ""} className="w-full object-cover" />
          ) : (
            <div className="ca-mono flex aspect-square items-center justify-center text-xs text-[#6f6f72]">NO IMAGE</div>
          )}
        </div>
        <div>
          {product.mallName && <span className="ca-mono text-xs text-[#6f6f72]">{product.mallName}</span>}
          <h1 className="mt-2 text-xl font-bold leading-snug text-[#fafafa]">{product.title}</h1>
          {product.category && <p className="mt-2 text-xs text-[#86868a]">{product.category}</p>}
          <p className="mt-5 text-3xl font-extrabold text-[#ff7a3d]">{formatPrice(product.lprice)}</p>

          <AddToCartBar
            product={{
              pkey: product.pkey,
              title: product.title,
              image: product.image || null,
              lprice: Number(product.lprice) || 0,
              link: product.link || null,
              mallName: product.mallName || null,
            }}
          />

          {product.link && (
            <a
              href={product.link}
              target="_blank"
              rel="noreferrer"
              className="mt-4 block text-sm text-[#9a9a9d] hover:text-[#ff7a3d]"
            >
              네이버 쇼핑에서 상세 보기 →
            </a>
          )}
          <p className="ca-mono mt-6 text-[11px] leading-relaxed text-[#5e5e62]">
            ※ 결제는 데모(모의)로 동작합니다. 실제 구매는 네이버 판매처에서 진행됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
