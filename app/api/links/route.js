// 네이버 상품 링크 관리 도우미 (links 컬렉션 CRUD)
export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { parseBody, parseQuery, handleError } from "@/lib/validate";
import { linksPostSchema, linksQuerySchema, linksDeleteQuerySchema } from "@/lib/schemas";
import { searchShop } from "@/lib/naver";
import { getDb } from "@/lib/mongodb";
import { rateLimit } from "@/lib/rateLimit";
import logger from "@/lib/logger";

async function getDatabase() {
  try {
    return await getDb();
  } catch (_) {
    return null;
  }
}

const NO_DB = () => NextResponse.json({ error: "MongoDB 미설정", message: "링크 저장소가 없습니다." }, { status: 503 });

export async function POST(req) {
  const limited = rateLimit(req, { name: "links-write", max: 30, windowMs: 60000 });
  if (limited) return limited;
  const { data, response } = await parseBody(linksPostSchema, req);
  if (response) return response;
  const db = await getDatabase();
  if (!db) return NO_DB();
  try {
    // query가 있으면 네이버 검색으로 제목·가격·이미지 보강
    let enriched = {};
    if (data.query) {
      const items = await searchShop(data.query, { display: 1 });
      const top = items[0];
      if (top) {
        enriched = {
          title: top.title,
          image: top.image,
          lprice: top.lprice,
          naverLink: top.link,
          mallName: top.mallName,
        };
      }
    }
    const doc = {
      url: data.url || enriched.naverLink || null,
      query: data.query || null,
      memo: data.memo || null,
      tags: data.tags || [],
      ...enriched,
      createdAt: new Date(),
    };
    const r = await db.collection("links").insertOne(doc);
    return NextResponse.json({ id: r.insertedId, ...doc }, { status: 201 });
  } catch (e) {
    logger.error(`links POST 실패: ${e.message}`);
    return handleError(e, "링크 저장에 실패했습니다.");
  }
}

export async function GET(req) {
  const limited = rateLimit(req, { name: "links-read", max: 60, windowMs: 60000 });
  if (limited) return limited;
  const { searchParams } = new URL(req.url);
  const { data, response } = parseQuery(linksQuerySchema, searchParams);
  if (response) return response;
  const db = await getDatabase();
  if (!db) return NO_DB();
  try {
    const filter = {};
    if (data.tag) filter.tags = data.tag;
    if (data.q) {
      filter.$or = [
        { title: { $regex: data.q, $options: "i" } },
        { memo: { $regex: data.q, $options: "i" } },
        { query: { $regex: data.q, $options: "i" } },
      ];
    }
    const links = await db.collection("links").find(filter).sort({ createdAt: -1 }).limit(100).toArray();
    return NextResponse.json({
      count: links.length,
      links: links.map(({ _id, ...rest }) => ({ id: _id, ...rest })),
    });
  } catch (e) {
    return handleError(e, "링크 조회에 실패했습니다.");
  }
}

export async function DELETE(req) {
  const limited = rateLimit(req, { name: "links-write", max: 30, windowMs: 60000 });
  if (limited) return limited;
  const { searchParams } = new URL(req.url);
  const { data, response } = parseQuery(linksDeleteQuerySchema, searchParams);
  if (response) return response;
  const db = await getDatabase();
  if (!db) return NO_DB();
  try {
    let _id;
    try {
      _id = new ObjectId(data.id);
    } catch {
      return NextResponse.json({ error: "잘못된 id 형식입니다." }, { status: 400 });
    }
    const r = await db.collection("links").deleteOne({ _id });
    return NextResponse.json({ deleted: r.deletedCount });
  } catch (e) {
    return handleError(e, "링크 삭제에 실패했습니다.");
  }
}
