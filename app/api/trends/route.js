// 입력 전 "지금 뜨는 검색 트렌드" 보드 — 인기 키워드 추세(데이터랩), 24h 캐시
export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { trendBoard } from "@/lib/datalab";
import { getDb } from "@/lib/mongodb";
import { rateLimit } from "@/lib/rateLimit";
import { requireAdmin } from "@/lib/auth";

const SEED_KEYWORDS = [
  "무선이어폰", "캠핑용품", "골프용품", "홈카페", "반려동물용품",
  "등산화", "러닝화", "공기청정기", "가습기", "전기장판",
  "노트북", "향수", "선크림", "비타민", "요가매트",
];

export async function GET(req) {
  const limited = rateLimit(req, { name: "trends", max: 30, windowMs: 60000 });
  if (limited) return limited;
  const denied = requireAdmin(req);
  if (denied) return denied;

  const key = "trends:board:v1";
  let db = null;
  try {
    db = await getDb();
  } catch (_) {}
  if (db) {
    const doc = await db.collection("listings").findOne({ key }).catch(() => null);
    if (doc?.board && Date.now() - new Date(doc.at).getTime() < 24 * 60 * 60 * 1000) {
      return NextResponse.json({ board: doc.board, cached: true });
    }
  }

  const board = await trendBoard(SEED_KEYWORDS, { months: 12 }).catch(() => []);
  if (db && board.length) {
    db.collection("listings").updateOne({ key }, { $set: { key, board, at: new Date() } }, { upsert: true }).catch(() => {});
  }
  return NextResponse.json({ board, cached: false });
}
