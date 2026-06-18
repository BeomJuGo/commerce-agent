// lib/naver.js — 네이버 쇼핑 검색 (pc-site-backend /api/naver-price 헤더 패턴 이식)
const ENDPOINT = "https://openapi.naver.com/v1/search/shop.json";

// 카테고리 불문 1000원 이하(및 가격 미상) 품목은 검열 — 부속품·소모품·스팸성 저가 리스팅 제거
export const MIN_PRICE = 1000;

export function stripTags(s = "") {
  return String(s)
    .replace(/<[^>]*>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .trim();
}

export function hasNaver() {
  return !!(process.env.NAVER_CLIENT_ID && process.env.NAVER_CLIENT_SECRET);
}

// 제목 정규화 키 — 대괄호/괄호 옵션·특수문자·노이즈 토큰 제거 후 비교용 키
// 같은 상품을 여러 몰이 [단품]·(정품) 등 라벨만 바꿔 올린 중복 리스팅을 묶기 위함
export function titleKey(title = "") {
  return stripTags(title)
    .toLowerCase()
    .replace(/\[[^\]]*\]/g, " ") // [단품] [정품] 등
    .replace(/\([^)]*\)/g, " ") // (...)
    .replace(/(정품|단품|무료배송|무료 배송|당일발송|사은품|증정|특가|행사|택1|택일)/g, " ")
    .replace(/[^0-9a-z가-힣]+/g, " ") // 특수문자 제거
    .replace(/\s+/g, " ")
    .trim();
}

// 표시용 중복 제거 — 정규화 제목 또는 동일 이미지(같은 상품 사진)면 첫 항목만 유지.
// 입력 순서(관련도/가격)를 보존한다. 소싱 경쟁강도 계산에는 쓰지 않음(원본 count 필요).
export function dedupListings(items = []) {
  const seenTitle = new Set();
  const seenImage = new Set();
  const out = [];
  for (const it of items) {
    const tkey = titleKey(it.title);
    const ikey = it.image || "";
    if (tkey && seenTitle.has(tkey)) continue;
    if (ikey && seenImage.has(ikey)) continue;
    if (tkey) seenTitle.add(tkey);
    if (ikey) seenImage.add(ikey);
    out.push(it);
  }
  return out;
}

/**
 * 네이버 쇼핑 검색.
 * @returns 정규화된 상품 배열 [{ title, link, image, lprice, hprice, mallName, productId, brand, maker, category }]
 */
export async function searchShop(query, { display = 10, sort = "sim", start = 1 } = {}) {
  const id = process.env.NAVER_CLIENT_ID;
  const secret = process.env.NAVER_CLIENT_SECRET;
  if (!id || !secret) throw new Error("NAVER_CLIENT_ID/NAVER_CLIENT_SECRET 미설정");

  const url =
    `${ENDPOINT}?query=${encodeURIComponent(query)}` +
    `&display=${Math.min(Math.max(display, 1), 100)}&sort=${sort}&start=${start}`;

  const res = await fetch(url, {
    headers: {
      "X-Naver-Client-Id": id,
      "X-Naver-Client-Secret": secret,
    },
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`네이버 API ${res.status}: ${text.slice(0, 200)}`);
  }

  const data = await res.json();
  return (data.items || [])
    .map((it) => ({
      title: stripTags(it.title),
      link: it.link,
      image: it.image,
      lprice: Number(it.lprice) || null,
      hprice: Number(it.hprice) || null,
      mallName: it.mallName || null,
      productId: it.productId || null,
      brand: it.brand || null,
      maker: it.maker || null,
      category: [it.category1, it.category2, it.category3, it.category4].filter(Boolean).join(" > "),
    }))
    // 1000원 이하·가격 미상 검열
    .filter((it) => it.lprice != null && it.lprice > MIN_PRICE);
}

// 가격 분포 신호(소싱/경쟁강도 분석용)
export function priceStats(items = []) {
  const prices = items.map((i) => i.lprice).filter((n) => typeof n === "number" && n > 0);
  if (!prices.length) return { count: items.length, min: null, max: null, avg: null };
  const sum = prices.reduce((a, b) => a + b, 0);
  return {
    count: items.length,
    min: Math.min(...prices),
    max: Math.max(...prices),
    avg: Math.round(sum / prices.length),
  };
}
