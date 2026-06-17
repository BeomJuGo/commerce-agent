import Link from "next/link";
import { getListing } from "@/lib/products";
import { categoryBySlug } from "@/lib/store";
import ProductGrid from "@/components/ProductGrid";

const SORTS = [
  ["sim", "정확도순"],
  ["asc", "낮은 가격순"],
  ["dsc", "높은 가격순"],
  ["date", "최신순"],
];

export default async function SearchPage({ searchParams }) {
  const sp = await searchParams;
  const cat = sp.cat ? categoryBySlug(sp.cat) : null;
  const q = String(sp.q || cat?.q || "").trim();
  const sort = ["sim", "asc", "dsc", "date"].includes(sp.sort) ? sp.sort : "sim";
  const key = cat ? `cat:${cat.slug}:${sort}` : `search:${q}:${sort}`;
  const products = q ? await getListing(key, q, { display: 24, sort }) : [];
  const title = cat ? cat.label : q ? `“${q}” 검색 결과` : "검색";
  const base = cat ? `cat=${cat.slug}` : `q=${encodeURIComponent(q)}`;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 style={{ fontSize: 24, fontWeight: 700, color: "#fafafa" }}>{title}</h1>
      <p className="mt-1 text-sm text-[#86868a]">{products.length}개 상품</p>

      <div className="mb-6 mt-4 flex flex-wrap gap-2">
        {SORTS.map(([v, label]) => (
          <Link
            key={v}
            href={`/search?${base}&sort=${v}`}
            className={`rounded-full border px-3 py-1.5 text-xs ${
              sort === v ? "border-[#ff5c1a] text-[#ff7a3d]" : "border-white/10 text-[#9a9a9d] hover:border-white/25"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      {q ? <ProductGrid products={products} /> : <p className="text-sm text-[#86868a]">검색어를 입력하세요.</p>}
    </div>
  );
}
