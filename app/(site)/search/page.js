import Link from "next/link";
import { getListing, getMergedListing } from "@/lib/products";
import { categoryBySlug } from "@/lib/store";
import ProductGrid from "@/components/ProductGrid";

const SORTS = [
  ["sim", "정확도순"],
  ["asc", "낮은 가격순"],
  ["dsc", "높은 가격순"],
  ["date", "최신순"],
];

const PER_PAGE = 40;

function Pager({ base, cur, totalPages }) {
  if (totalPages <= 1) return null;
  const windowSize = 5;
  let start = Math.max(1, cur - Math.floor(windowSize / 2));
  const end = Math.min(totalPages, start + windowSize - 1);
  start = Math.max(1, end - windowSize + 1);
  const nums = [];
  for (let i = start; i <= end; i++) nums.push(i);

  const linkCls = (active) =>
    `inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-2 text-sm ${
      active ? "border-[#ff5c1a] bg-[#ff5c1a] font-semibold text-white" : "border-black/10 text-[#3f3f46] hover:border-black/25"
    }`;

  return (
    <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
      {cur > 1 && (
        <Link href={`${base}&page=${cur - 1}`} className={linkCls(false)}>
          이전
        </Link>
      )}
      {start > 1 && <span className="text-[#a1a1aa]">…</span>}
      {nums.map((n) => (
        <Link key={n} href={`${base}&page=${n}`} className={linkCls(n === cur)}>
          {n}
        </Link>
      ))}
      {end < totalPages && <span className="text-[#a1a1aa]">…</span>}
      {cur < totalPages && (
        <Link href={`${base}&page=${cur + 1}`} className={linkCls(false)}>
          다음
        </Link>
      )}
    </div>
  );
}

export default async function SearchPage({ searchParams }) {
  const sp = await searchParams;
  const cat = sp.cat ? categoryBySlug(sp.cat) : null;
  const page = Math.max(1, parseInt(sp.page, 10) || 1);

  if (cat) {
    // 카테고리: 키워드 8개 × 100개 병렬 병합 → 500+ 확보, 40개씩 페이지네이션
    const all = await getMergedListing(`cat:${cat.slug}:full:v2`, cat.queries, {
      perQuery: 100,
      pages: 1,
      ttlMs: 60 * 60 * 1000,
    });
    const totalPages = Math.max(1, Math.ceil(all.length / PER_PAGE));
    const cur = Math.min(page, totalPages);
    const slice = all.slice((cur - 1) * PER_PAGE, cur * PER_PAGE);

    return (
      <div className="mx-auto max-w-6xl px-6 py-10">
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#18181b" }}>{cat.label}</h1>
        <p className="mt-1 text-sm text-[#9a9aa2]">
          총 {all.length.toLocaleString("ko-KR")}개 상품 · {cur}/{totalPages} 페이지
        </p>
        <div className="mt-6">
          <ProductGrid products={slice} />
        </div>
        <Pager base={`/search?cat=${cat.slug}`} cur={cur} totalPages={totalPages} />
      </div>
    );
  }

  const q = String(sp.q || "").trim();
  const sort = ["sim", "asc", "dsc", "date"].includes(sp.sort) ? sp.sort : "sim";
  const all = q ? await getListing(`search:${q}:${sort}`, q, { display: 100, sort }) : [];
  const totalPages = Math.max(1, Math.ceil(all.length / PER_PAGE));
  const cur = Math.min(page, totalPages);
  const slice = all.slice((cur - 1) * PER_PAGE, cur * PER_PAGE);
  const base = `/search?q=${encodeURIComponent(q)}&sort=${sort}`;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 style={{ fontSize: 24, fontWeight: 700, color: "#18181b" }}>{q ? `“${q}” 검색 결과` : "검색"}</h1>
      <p className="mt-1 text-sm text-[#9a9aa2]">{all.length.toLocaleString("ko-KR")}개 상품</p>

      <div className="mb-6 mt-4 flex flex-wrap gap-2">
        {SORTS.map(([v, label]) => (
          <Link
            key={v}
            href={`/search?q=${encodeURIComponent(q)}&sort=${v}`}
            className={`rounded-full border px-3 py-1.5 text-xs ${
              sort === v ? "border-[#ff5c1a] text-[#e0480f]" : "border-black/10 text-[#71717a] hover:border-black/25"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      {q ? (
        <>
          <ProductGrid products={slice} />
          <Pager base={base} cur={cur} totalPages={totalPages} />
        </>
      ) : (
        <p className="text-sm text-[#9a9aa2]">검색어를 입력하세요.</p>
      )}
    </div>
  );
}
