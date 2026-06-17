// lib/products.js — 상품/리스팅 캐시 (스토어의 척추)
// 네이버 쇼핑은 "ID로 단건 조회"가 없으므로, 검색 결과를 products에 upsert해 두고
// 상세/장바구니/주문이 ID(pkey)로 읽는다. 리스팅은 TTL 캐시로 쿼터를 보호한다.
import { getDb } from "./mongodb";
import { searchShop, MIN_PRICE } from "./naver";

// URL-safe 상품 키: productId가 있으면 그대로, 없으면 link를 base64url
export function productKey(item) {
  if (item?.productId) return String(item.productId);
  return Buffer.from(item?.link || "").toString("base64url");
}

async function db() {
  try {
    return await getDb();
  } catch {
    return null;
  }
}

export async function cacheProducts(items) {
  const database = await db();
  // 1000원 이하·가격 미상은 캐시하지 않음 (방어선)
  items = (items || []).filter((it) => it.lprice != null && it.lprice > MIN_PRICE);
  if (!database || !items.length) return;
  const ops = items.map((it) => {
    const pkey = productKey(it);
    return {
      updateOne: {
        filter: { pkey },
        update: { $set: { ...it, pkey, cachedAt: new Date() } },
        upsert: true,
      },
    };
  });
  await database.collection("products").bulkWrite(ops, { ordered: false }).catch(() => {});
}

// 상세/장바구니용 단건 조회. 캐시 미스 시 q(제목)로 재검색해 복구(fresh 브라우저/직접링크 안전).
export async function getProduct(pkey, { q } = {}) {
  const database = await db();
  if (database) {
    const doc = await database.collection("products").findOne({ pkey }).catch(() => null);
    if (doc) {
      const { _id, ...rest } = doc;
      return rest;
    }
  }
  if (q) {
    const items = await searchShop(q, { display: 20 }).catch(() => []);
    const withKeys = items.map((it) => ({ ...it, pkey: productKey(it) }));
    await cacheProducts(withKeys);
    return withKeys.find((it) => it.pkey === pkey) || withKeys[0] || null;
  }
  return null;
}

// 여러 키워드 검색을 병합한 리스팅. 키워드×페이지를 병렬 호출(속도) 후 중복 제거. TTL 캐시.
// perQuery: 키워드당 개수(최대 100), pages: 키워드당 페이지 수(start=1,101,...)
export async function getMergedListing(key, queries, { perQuery = 4, pages = 1, sort = "sim", ttlMs = 30 * 60 * 1000 } = {}) {
  const database = await db();
  if (database) {
    const doc = await database.collection("listings").findOne({ key }).catch(() => null);
    if (doc && Date.now() - new Date(doc.at).getTime() < ttlMs) return doc.items || [];
  }

  const display = Math.min(perQuery, 100);
  const tasks = [];
  for (const q of queries) {
    for (let p = 0; p < pages; p++) {
      tasks.push(searchShop(q, { display, sort, start: p * display + 1 }).catch(() => []));
    }
  }
  const results = await Promise.all(tasks);

  const seen = new Set();
  const merged = [];
  for (const items of results) {
    for (const it of items) {
      const k = productKey(it);
      if (seen.has(k)) continue;
      seen.add(k);
      merged.push({ ...it, pkey: k });
    }
  }

  await cacheProducts(merged);
  if (database && merged.length) {
    await database
      .collection("listings")
      .updateOne({ key }, { $set: { key, items: merged, at: new Date() } }, { upsert: true })
      .catch(() => {});
  }
  return merged;
}

// 카테고리/검색 리스팅 — TTL 내면 캐시 반환, 아니면 검색 후 캐시 갱신(+products 캐시)
export async function getListing(key, query, { display = 12, sort = "sim", ttlMs = 30 * 60 * 1000 } = {}) {
  const database = await db();
  if (database) {
    const doc = await database.collection("listings").findOne({ key }).catch(() => null);
    if (doc && Date.now() - new Date(doc.at).getTime() < ttlMs) {
      return doc.items || [];
    }
  }
  const items = await searchShop(query, { display, sort }).catch(() => []);
  // pkey를 미리 부여해 캐시/타일 링크에서 일관 사용
  const withKeys = items.map((it) => ({ ...it, pkey: productKey(it) }));
  await cacheProducts(withKeys);
  if (database && withKeys.length) {
    await database
      .collection("listings")
      .updateOne({ key }, { $set: { key, query, items: withKeys, at: new Date() } }, { upsert: true })
      .catch(() => {});
  }
  return withKeys;
}
