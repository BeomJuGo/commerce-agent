// 쿠팡/자사몰 링크 관리 도우미 (links 컬렉션 CRUD, OG 메타 보강)
export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { parseBody, parseQuery, handleError } from "@/lib/validate";
import { linksPostSchema, linksQuerySchema, linksDeleteQuerySchema, linksPatchSchema } from "@/lib/schemas";
import { fetchOg, detectSource } from "@/lib/og";
import { getDb } from "@/lib/mongodb";
import { rateLimit } from "@/lib/rateLimit";
import { requireAdmin } from "@/lib/auth";
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
  const denied = requireAdmin(req);
  if (denied) return denied;
  const { data, response } = await parseBody(linksPostSchema, req);
  if (response) return response;
  const db = await getDatabase();
  if (!db) return NO_DB();
  try {
    // OG 메타(제목·이미지·가격) 자동 보강 (쿠팡 등 차단 시 graceful). 수동 가격이 우선.
    const og = await fetchOg(data.url);
    const source = detectSource(data.url);
    const now = new Date();
    const price = data.price ?? og.price ?? null;
    const doc = {
      url: data.url,
      source,
      title: data.title || og.title || data.url,
      image: og.image || null,
      price,
      priceHistory: price != null ? [{ price, at: now }] : [],
      memo: data.memo || null,
      tags: data.tags || [],
      enriched: !!(og.title || og.image),
      createdAt: now,
      updatedAt: now,
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
  const denied = requireAdmin(req);
  if (denied) return denied;
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
        { source: { $regex: data.q, $options: "i" } },
        { url: { $regex: data.q, $options: "i" } },
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

// 가격 갱신 — price 주면 수동 기록, 없으면 OG 재조회. priceHistory에 누적(최근 20개).
export async function PATCH(req) {
  const limited = rateLimit(req, { name: "links-write", max: 30, windowMs: 60000 });
  if (limited) return limited;
  const denied = requireAdmin(req);
  if (denied) return denied;
  const { data, response } = await parseBody(linksPatchSchema, req);
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
    const link = await db.collection("links").findOne({ _id });
    if (!link) return NextResponse.json({ error: "링크를 찾을 수 없습니다." }, { status: 404 });

    let newPrice = data.price ?? null;
    if (newPrice == null) {
      const og = await fetchOg(link.url);
      newPrice = og.price ?? null;
    }
    if (newPrice == null) {
      return NextResponse.json({
        ok: false,
        message: "자동 가격 수집에 실패했습니다(쿠팡 등 봇 차단). 가격을 직접 입력해 주세요.",
      });
    }

    const now = new Date();
    await db.collection("links").updateOne(
      { _id },
      {
        $set: { price: newPrice, updatedAt: now },
        $push: { priceHistory: { $each: [{ price: newPrice, at: now }], $slice: -20 } },
      }
    );
    const updated = await db.collection("links").findOne({ _id });
    const { _id: oid, ...rest } = updated;
    return NextResponse.json({ ok: true, id: oid, ...rest });
  } catch (e) {
    logger.error(`links PATCH 실패: ${e.message}`);
    return handleError(e, "가격 갱신에 실패했습니다.");
  }
}

export async function DELETE(req) {
  const limited = rateLimit(req, { name: "links-write", max: 30, windowMs: 60000 });
  if (limited) return limited;
  const denied = requireAdmin(req);
  if (denied) return denied;
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
