import Link from "next/link";
import { getListing, getMergedListing } from "@/lib/products";
import { categoryBySlug } from "@/lib/store";
import ProductGrid from "@/components/ProductGrid";

// 검색(네이버 정렬) 전용 정렬 — 네이버 API가 서버 정렬
const QUERY_SORTS = [
  ["sim", "정확도순"],
  ["asc", "낮은 가격순"],
  ["dsc", "높은 가격순"],
  ["date", "최신순"],
];
// 카테고리 전용 정렬 — 병합 결과를 인메모리 정렬
const CAT_SORTS = [
  ["sim", "추천순"],
  ["asc", "낮은 가격순"],
  ["dsc", "높은 가격순"],
];

const PER_PAGE = 40;

function toInt(v) {
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

// 가격 범위 필터(인메모리)
function filterByPrice(items, minp, maxp) {
  if (minp == null && maxp == null) return items;
  return items.filter((p) => {
    const v = Number(p.lprice) || 0;
    if (minp != null && v < minp) return false;
    if (maxp != null && v > maxp) return false;
    return true;
  });
}

// 가격 정렬(인메모리) — sim/그 외는 원래 순서 유지
function sortByPrice(items, sort) {
  if (sort === "asc") return [...items].sort((a, b) => (a.lprice || 0) - (b.lprice || 0));
  if (sort === "dsc") return [...items].sort((a, b) => (b.lprice || 0) - (a.lprice || 0));
  return items;
}

// 정렬 칩 + 가격 범위 폼. hidden으로 기존 파라미터 보존.
function FilterBar({ action, hidden, sorts, sort, minp, maxp }) {
  const hiddenEntries = Object.entries(hidden).filter(([, v]) => v != null && v !== "");
  const sortLink = (v) => {
    const params = new URLSearchParams(hiddenEntries.filter(([k]) => k !== "sort"));
    params.set("sort", v);
    if (minp != null) params.set("minp", String(minp));
    if (maxp != null) params.set("maxp", String(maxp));
    return `${action}?${params.toString()}`;
  };
  const hasPrice = minp != null || maxp != null;
  return (
    <div className="mb-6 mt-4 space-y-3">
      <div className="flex flex-wrap gap-2">
        {sorts.map(([v, label]) => (
          <Link
            key={v}
            href={sortLink(v)}
            className={`rounded-full border px-3 py-1.5 text-xs ${
              sort === v ? "border-[#ff5c1a] text-[#e0480f]" : "border-black/10 text-[#71717a] hover:border-black/25"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>
      <form action={action} method="get" className="flex flex-wrap items-center gap-2">
        {hiddenEntries.map(([k, v]) => (
          <input key={k} type="hidden" name={k} value={v} />
        ))}
        <span className="text-xs text-[#9a9aa2]">가격</span>
        <input
          type="number"
          name="minp"
          defaultValue={minp ?? ""}
          placeholder="최소"
          min="0"
          className="w-24 rounded-lg border border-black/10 bg-white px-3 py-1.5 text-xs text-[#18181b] outline-none focus:border-[#ff5c1a]"
        />
        <span className="text-xs text-[#a1a1aa]">~</span>
        <input
          type="number"
          name="maxp"
          defaultValue={maxp ?? ""}
          placeholder="최대"
          min="0"
          className="w-24 rounded-lg border border-black/10 bg-white px-3 py-1.5 text-xs text-[#18181b] outline-none focus:border-[#ff5c1a]"
        />
        <button type="submit" className="rounded-lg border border-black/15 bg-black/[0.04] px-3 py-1.5 text-xs font-medium text-[#3f3f46] hover:border-[#ff5c1a]/50 hover:text-[#e0480f]">
          적용
        </button>
        {hasPrice && (
          <Link
            href={`${action}?${new URLSearchParams(hiddenEntries).toString()}`}
            className="text-xs text-[#a1a1aa] underline hover:text-[#71717a]"
          >
            초기화
          </Link>
        )}
      </form>
    </div>
  );
}

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

// 가격 필터 파라미터를 base URL에 부착(페이지네이션이 필터 유지)
function withPrice(base, minp, maxp) {
  let s = base;
  if (minp != null) s += `&minp=${minp}`;
  if (maxp != null) s += `&maxp=${maxp}`;
  return s;
}

export default async function SearchPage({ searchParams }) {
  const sp = await searchParams;
  const cat = sp.cat ? categoryBySlug(sp.cat) : null;
  const page = Math.max(1, parseInt(sp.page, 10) || 1);
  const minp = toInt(sp.minp);
  const maxp = toInt(sp.maxp);

  if (cat) {
    const sort = ["sim", "asc", "dsc"].includes(sp.sort) ? sp.sort : "sim";
    // 카테고리: 키워드 8개 × 100개 병렬 병합 → 500+ 확보
    const merged = await getMergedListing(`cat:${cat.slug}:full:v2`, cat.queries, {
      perQuery: 100,
      pages: 1,
      ttlMs: 60 * 60 * 1000,
    });
    const all = sortByPrice(filterByPrice(merged, minp, maxp), sort);
    const totalPages = Math.max(1, Math.ceil(all.length / PER_PAGE));
    const cur = Math.min(page, totalPages);
    const slice = all.slice((cur - 1) * PER_PAGE, cur * PER_PAGE);
    const base = withPrice(`/search?cat=${cat.slug}&sort=${sort}`, minp, maxp);

    return (
      <div className="mx-auto max-w-6xl px-6 py-10">
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#18181b" }}>{cat.label}</h1>
        <p className="mt-1 text-sm text-[#9a9aa2]">
          총 {all.length.toLocaleString("ko-KR")}개 상품 · {cur}/{totalPages} 페이지
        </p>
        <FilterBar action="/search" hidden={{ cat: cat.slug, sort }} sorts={CAT_SORTS} sort={sort} minp={minp} maxp={maxp} />
        {all.length > 0 ? (
          <ProductGrid products={slice} />
        ) : (
          <p className="text-sm text-[#9a9aa2]">조건에 맞는 상품이 없습니다. 가격 범위를 조정해 보세요.</p>
        )}
        <Pager base={base} cur={cur} totalPages={totalPages} />
      </div>
    );
  }

  const q = String(sp.q || "").trim();
  const sort = ["sim", "asc", "dsc", "date"].includes(sp.sort) ? sp.sort : "sim";
  // 네이버가 sort로 서버 정렬한 결과에 가격 범위만 인메모리 필터
  const fetched = q ? await getListing(`search:${q}:${sort}`, q, { display: 100, sort }) : [];
  const all = filterByPrice(fetched, minp, maxp);
  const totalPages = Math.max(1, Math.ceil(all.length / PER_PAGE));
  const cur = Math.min(page, totalPages);
  const slice = all.slice((cur - 1) * PER_PAGE, cur * PER_PAGE);
  const base = withPrice(`/search?q=${encodeURIComponent(q)}&sort=${sort}`, minp, maxp);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 style={{ fontSize: 24, fontWeight: 700, color: "#18181b" }}>{q ? `“${q}” 검색 결과` : "검색"}</h1>
      <p className="mt-1 text-sm text-[#9a9aa2]">{all.length.toLocaleString("ko-KR")}개 상품</p>

      {q ? (
        <>
          <FilterBar action="/search" hidden={{ q, sort }} sorts={QUERY_SORTS} sort={sort} minp={minp} maxp={maxp} />
          {all.length > 0 ? (
            <ProductGrid products={slice} />
          ) : (
            <p className="text-sm text-[#9a9aa2]">조건에 맞는 상품이 없습니다. 가격 범위를 조정해 보세요.</p>
          )}
          <Pager base={base} cur={cur} totalPages={totalPages} />
        </>
      ) : (
        <p className="mt-4 text-sm text-[#9a9aa2]">검색어를 입력하세요.</p>
      )}
    </div>
  );
}
