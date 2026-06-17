// lib/rateLimit.js — 경량 IP 기반 고정 윈도우 레이트리밋
// 공유 OpenAI/네이버 키 할당량을 캐주얼 남용으로부터 보호하기 위한 1차 방어선.
// 주의: 서버리스에서는 인스턴스별 인메모리라 best-effort다. 하드 제한이 필요하면
// Vercel WAF rate rules를 함께 사용할 것.
import { NextResponse } from "next/server";

const buckets = new Map(); // key -> { count, resetAt }

export function getClientIp(req) {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

// 초과 시 NextResponse(429) 반환, 아니면 null
export function rateLimit(req, { name, max = 20, windowMs = 60000 } = {}) {
  const ip = getClientIp(req);
  const key = `${name}:${ip}`;
  const now = Date.now();

  // 맵이 너무 커지면 만료 항목 정리
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) if (v.resetAt <= now) buckets.delete(k);
  }

  let b = buckets.get(key);
  if (!b || b.resetAt <= now) {
    b = { count: 0, resetAt: now + windowMs };
    buckets.set(key, b);
  }
  b.count++;

  if (b.count > max) {
    const retry = Math.ceil((b.resetAt - now) / 1000);
    return NextResponse.json(
      { error: "Too Many Requests", message: `요청이 많습니다. ${retry}초 후 다시 시도해주세요.` },
      { status: 429, headers: { "Retry-After": String(retry) } }
    );
  }
  return null;
}
