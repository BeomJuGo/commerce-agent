// lib/curate.js — 큐레이션 공용 로직 (API + 홈 계절 rail 공유)
import { chatJSON } from "./openai";
import { searchShop } from "./naver";
import { productKey, cacheProducts } from "./products";
import { getDb } from "./mongodb";

export async function runCuration(context) {
  const themeRes = await chatJSON(
    [
      {
        role: "user",
        content:
          `여행/계절/라이프스타일 기반 쇼핑 큐레이션을 만드세요.\n맥락 유형: ${context.type}\n상세: "${context.detail}"\n` +
          `형식: {"title":"큐레이션 제목","intro":"소개 1~2문장","themes":[{"theme":"테마명","description":"테마 설명","searchKeyword":"네이버 검색 키워드"}]}\n` +
          `테마는 3~5개로 구성하세요.`,
      },
    ],
    { maxTokens: 1000 }
  );

  const themes = [];
  for (const t of (themeRes.themes || []).slice(0, 5)) {
    let products = [];
    try {
      const items = await searchShop(t.searchKeyword || t.theme, { display: 4 });
      products = items.map((it) => ({ ...it, pkey: productKey(it) }));
      await cacheProducts(products);
    } catch (_) {}
    themes.push({ theme: t.theme, description: t.description, products });
  }

  return { type: context.type, title: themeRes.title || "", intro: themeRes.intro || "", themes };
}

function seasonContext() {
  const m = new Date().getMonth() + 1;
  const season = m === 12 || m <= 2 ? "겨울" : m <= 5 ? "봄" : m <= 8 ? "여름" : "가을";
  return { type: "season", detail: `${season} 시즌에 어울리는 쇼핑 추천` };
}

// 홈 계절 큐레이션 — 월 단위 키로 24h 캐시(쿼터·비용 보호)
export async function getSeasonalCuration() {
  const ctx = seasonContext();
  const key = `curation:season:${new Date().toISOString().slice(0, 7)}`;
  let db = null;
  try {
    db = await getDb();
  } catch (_) {}
  if (db) {
    const doc = await db.collection("listings").findOne({ key }).catch(() => null);
    if (doc?.data && Date.now() - new Date(doc.at).getTime() < 24 * 60 * 60 * 1000) return doc.data;
  }
  const data = await runCuration(ctx).catch(() => null);
  if (db && data) {
    db.collection("listings").updateOne({ key }, { $set: { key, data, at: new Date() } }, { upsert: true }).catch(() => {});
  }
  return data;
}
