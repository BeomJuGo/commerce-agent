import Link from "next/link";
import { CATEGORIES } from "@/lib/store";
import { getMergedListing } from "@/lib/products";
import { getSeasonalCuration } from "@/lib/curate";
import ProductGrid from "@/components/ProductGrid";
import AIRecommend from "@/components/AIRecommend";

export default async function StoreHome() {
  // 카테고리별 rail — 여러 키워드 병합 + TTL 캐시(쿼터 보호)
  const rails = await Promise.all(
    CATEGORIES.map(async (c) => ({
      ...c,
      products: (await getMergedListing(`cat:${c.slug}:mix:v2`, c.queries.slice(0, 2), { perQuery: 5 })).slice(0, 8),
    }))
  );
  const curation = await getSeasonalCuration().catch(() => null);

  return (
    <div>
      {/* 히어로 밴드 */}
      <section style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <div className="mx-auto max-w-6xl px-6 py-14">
          <span
            className="ca-mono"
            style={{
              display: "inline-block",
              fontSize: 12,
              letterSpacing: "0.1em",
              color: "#e0480f",
              border: "1px solid rgba(255,92,26,0.4)",
              borderRadius: 999,
              padding: "5px 12px",
            }}
          >
            AI COMMERCE STORE
          </span>
          <h1 style={{ margin: "18px 0 0", fontSize: 40, fontWeight: 800, letterSpacing: "-0.03em", color: "#18181b", lineHeight: 1.2 }}>
            필요한 걸 검색하면,
            <br />
            AI가 골라 담아드립니다.
          </h1>
          <p style={{ margin: "14px 0 0", maxWidth: 560, fontSize: 16, lineHeight: 1.7, color: "#71717a" }}>
            네이버 쇼핑의 실시간 상품을 검색·비교·분석하고 장바구니에 담아보세요. 상단 검색창에 원하는 상품을 입력하면 됩니다.
          </p>
        </div>
      </section>

      {/* 카테고리 rails */}
      <div className="mx-auto max-w-6xl space-y-12 px-6 py-12">
        <AIRecommend />

        {curation?.themes?.some((t) => t.products?.length) && (
          <section>
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <span className="ca-mono rounded-md border border-[#ff5c1a]/40 px-2 py-0.5 text-[11px] text-[#e0480f]">큐레이션</span>
              <h2 className="text-lg font-bold text-[#18181b]">{curation.title || "이번 시즌 추천"}</h2>
            </div>
            {curation.intro && <p className="mb-5 text-sm text-[#71717a]">{curation.intro}</p>}
            <div className="space-y-8">
              {curation.themes
                .filter((t) => t.products?.length)
                .map((t, i) => (
                  <div key={i}>
                    <h3 className="font-semibold text-[#18181b]">{t.theme}</h3>
                    {t.description && <p className="mb-3 text-sm text-[#71717a]">{t.description}</p>}
                    <ProductGrid products={t.products} />
                  </div>
                ))}
            </div>
          </section>
        )}

        {rails.map((r) => (
          <section key={r.slug}>
            <div className="mb-4 flex items-end justify-between">
              <h2 style={{ fontSize: 22, fontWeight: 700, color: "#18181b" }}>{r.label}</h2>
              <Link href={`/search?cat=${r.slug}`} className="ca-link-muted text-sm text-[#71717a]">
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
