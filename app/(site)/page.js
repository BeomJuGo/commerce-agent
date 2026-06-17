import Link from "next/link";
import { CATEGORIES } from "@/lib/store";
import { getListing } from "@/lib/products";
import ProductGrid from "@/components/ProductGrid";

export default async function StoreHome() {
  // 카테고리별 rail (TTL 캐시 — 쿼터 보호)
  const rails = await Promise.all(
    CATEGORIES.map(async (c) => ({
      ...c,
      products: (await getListing(`cat:${c.slug}`, c.q, { display: 8 })).slice(0, 8),
    }))
  );

  return (
    <div>
      {/* 히어로 밴드 */}
      <section style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="mx-auto max-w-6xl px-6 py-14">
          <span
            className="ca-mono"
            style={{
              display: "inline-block",
              fontSize: 12,
              letterSpacing: "0.1em",
              color: "#ff7a3d",
              border: "1px solid rgba(255,92,26,0.4)",
              borderRadius: 999,
              padding: "5px 12px",
            }}
          >
            AI COMMERCE STORE
          </span>
          <h1 style={{ margin: "18px 0 0", fontSize: 40, fontWeight: 800, letterSpacing: "-0.03em", color: "#fafafa", lineHeight: 1.2 }}>
            필요한 걸 검색하면,
            <br />
            AI가 골라 담아드립니다.
          </h1>
          <p style={{ margin: "14px 0 0", maxWidth: 560, fontSize: 16, lineHeight: 1.7, color: "#9a9a9d" }}>
            네이버 쇼핑의 실시간 상품을 검색·비교·분석하고 장바구니에 담아보세요. 상단 검색창에 원하는 상품을 입력하면 됩니다.
          </p>
        </div>
      </section>

      {/* 카테고리 rails */}
      <div className="mx-auto max-w-6xl space-y-12 px-6 py-12">
        {rails.map((r) => (
          <section key={r.slug}>
            <div className="mb-4 flex items-end justify-between">
              <h2 style={{ fontSize: 22, fontWeight: 700, color: "#fafafa" }}>{r.label}</h2>
              <Link href={`/search?cat=${r.slug}`} className="ca-link-muted text-sm text-[#9a9a9d]">
                더보기 →
              </Link>
            </div>
            <ProductGrid products={r.products} />
          </section>
        ))}
      </div>
    </div>
  );
}
