import Link from "next/link";
import Image from "next/image";
import { getProduct, getListing } from "@/lib/products";
import { formatPrice } from "@/lib/format";
import AddToCartBar from "@/components/AddToCartBar";
import ProductGrid from "@/components/ProductGrid";
import ProductReviews from "@/components/ProductReviews";
import CurrentProductSignal from "@/components/CurrentProductSignal";
import { formatPrice as fmt } from "@/lib/format";

export async function generateMetadata({ params, searchParams }) {
  const { id } = await params;
  const sp = await searchParams;
  const product = await getProduct(decodeURIComponent(id), { q: sp.q ? String(sp.q) : undefined });
  if (!product) return { title: "상품을 찾을 수 없습니다" };

  const title = product.title || "상품";
  const priceText = product.lprice ? ` · ${fmt(product.lprice)}` : "";
  const desc = `${title}${priceText}${product.mallName ? ` · ${product.mallName}` : ""} — AI 추천·리뷰 분석과 함께 둘러보세요.`;
  const canonical = `/product/${encodeURIComponent(product.pkey)}`;
  return {
    title,
    description: desc,
    alternates: { canonical },
    openGraph: {
      type: "website",
      title,
      description: desc,
      url: canonical,
      images: product.image ? [{ url: product.image }] : undefined,
    },
    twitter: { card: "summary_large_image", title, description: desc },
  };
}

export default async function ProductPage({ params, searchParams }) {
  const { id } = await params;
  const sp = await searchParams;
  const product = await getProduct(decodeURIComponent(id), { q: sp.q ? String(sp.q) : undefined });

  if (!product) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <p className="text-[#71717a]">상품을 찾을 수 없습니다.</p>
        <Link href="/" className="mt-3 inline-block text-[#e0480f]">
          홈으로 →
        </Link>
      </div>
    );
  }

  // 비슷한 상품(유사 상품 비교용) — 제목 앞 토큰으로 검색, TTL 캐시
  const simQuery = (product.title || "").split(/\s+/).slice(0, 3).join(" ");
  const similarRaw = simQuery ? await getListing(`sim:${product.pkey}`, simQuery, { display: 10 }) : [];
  const similar = similarRaw.filter((p) => p.pkey !== product.pkey).slice(0, 8);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <CurrentProductSignal product={{ pkey: product.pkey, title: product.title, lprice: Number(product.lprice) || null }} />
      <Link href="/" className="ca-mono text-xs text-[#e0480f] hover:underline">
        ← 쇼핑 계속하기
      </Link>
      <div className="mt-4 grid gap-8 md:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-2xl border border-black/[0.07] bg-[#f1f1f3]">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.title || ""}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 480px"
              className="object-cover"
            />
          ) : (
            <div className="ca-mono flex aspect-square items-center justify-center text-xs text-[#a1a1aa]">NO IMAGE</div>
          )}
        </div>
        <div>
          {product.mallName && <span className="ca-mono text-xs text-[#a1a1aa]">{product.mallName}</span>}
          <h1 className="mt-2 text-xl font-bold leading-snug text-[#18181b]">{product.title}</h1>
          {product.category && <p className="mt-2 text-xs text-[#9a9aa2]">{product.category}</p>}
          <p className="mt-5 text-3xl font-extrabold text-[#e0480f]">{formatPrice(product.lprice)}</p>

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
              className="mt-4 block text-sm text-[#71717a] hover:text-[#e0480f]"
            >
              네이버 쇼핑에서 상세 보기 →
            </a>
          )}
          <p className="ca-mono mt-6 text-[11px] leading-relaxed text-[#b0b0b8]">
            ※ 결제는 데모(모의)로 동작합니다. 실제 구매는 네이버 판매처에서 진행됩니다.
          </p>
        </div>
      </div>

      {/* AI 리뷰 분석 (버튼 클릭 시 호출) */}
      <ProductReviews productName={product.title} />

      {/* 비슷한 상품 비교 */}
      {similar.length > 0 && (
        <section className="mt-12 border-t border-black/[0.07] pt-8">
          <h2 className="mb-4 text-lg font-bold text-[#18181b]">비슷한 상품</h2>
          <ProductGrid products={similar} />
        </section>
      )}
    </div>
  );
}
