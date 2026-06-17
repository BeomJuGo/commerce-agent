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
