// 모의 주문 — orders 컬렉션에 기록(있으면), 주문번호 반환. 실결제 없음.
export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/mongodb";
import { rateLimit } from "@/lib/rateLimit";
import { requireAdmin } from "@/lib/auth";
import logger from "@/lib/logger";

const orderSchema = z.object({
  items: z
    .array(
      z.object({
        pkey: z.string().min(1),
        title: z.string().min(1),
        lprice: z.coerce.number().nonnegative(),
        qty: z.coerce.number().int().positive(),
        image: z.string().nullable().optional(),
        link: z.string().nullable().optional(),
        mallName: z.string().nullable().optional(),
      })
    )
    .min(1, "장바구니가 비어 있습니다.")
    .max(50),
  total: z.coerce.number().nonnegative().optional(),
});

function genOrderNo() {
  return `ORD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

// 관리자 주문 내역 조회 — 최근 주문 목록 + 매출 요약
export async function GET(req) {
  const limited = rateLimit(req, { name: "orders-read", max: 60, windowMs: 60000 });
  if (limited) return limited;
  const denied = requireAdmin(req);
  if (denied) return denied;

  let db = null;
  try {
    db = await getDb();
  } catch (_) {}
  if (!db) {
    return NextResponse.json({ error: "MongoDB 미설정", message: "주문 저장소가 없습니다." }, { status: 503 });
  }
  try {
    const orders = await db.collection("orders").find({}).sort({ createdAt: -1 }).limit(100).toArray();
    const summary = orders.reduce(
      (acc, o) => {
        acc.revenue += o.total || 0;
        acc.itemCount += o.itemCount || 0;
        return acc;
      },
      { count: orders.length, revenue: 0, itemCount: 0 }
    );
    return NextResponse.json({
      summary,
      orders: orders.map(({ _id, ...rest }) => ({ id: String(_id), ...rest })),
    });
  } catch (e) {
    logger.error(`orders GET 실패: ${e.message}`);
    return NextResponse.json({ error: "주문 조회에 실패했습니다." }, { status: 500 });
  }
}

export async function POST(req) {
  const limited = rateLimit(req, { name: "orders", max: 20, windowMs: 60000 });
  if (limited) return limited;

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "요청 본문이 올바르지 않습니다." }, { status: 400 });
  }
  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "주문 정보가 올바르지 않습니다." }, { status: 400 });
  }

  const { items } = parsed.data;
  const total = items.reduce((n, i) => n + i.lprice * i.qty, 0);
  const itemCount = items.reduce((n, i) => n + i.qty, 0);
  const orderNo = genOrderNo();

  let db = null;
  try {
    db = await getDb();
  } catch (_) {}
  if (db) {
    db.collection("orders")
      .insertOne({ orderNo, items, total, itemCount, status: "mock_paid", createdAt: new Date() })
      .catch((e) => logger.error(`order 저장 실패: ${e.message}`));
  }

  return NextResponse.json({ ok: true, orderNo, total, itemCount });
}
