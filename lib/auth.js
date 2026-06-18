// lib/auth.js — 단일 관리자 비밀번호 로그인용 서명 세션(HMAC, 외부 의존성 없음)
import crypto from "node:crypto";
import { NextResponse } from "next/server";

export const COOKIE_NAME = "ca_admin";
const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000; // 24h

// 로그인 비밀번호: ADMIN_PASSWORD 우선, 없으면 ADMIN_API_KEY 재사용(무설정 즉시 동작)
export function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || process.env.ADMIN_API_KEY || "";
}

// 쿠키 서명 키: SESSION_SECRET 우선, 없으면 ADMIN_API_KEY/ADMIN_PASSWORD 재사용
function getSecret() {
  return process.env.SESSION_SECRET || process.env.ADMIN_API_KEY || process.env.ADMIN_PASSWORD || "";
}

function sign(data, secret) {
  return crypto.createHmac("sha256", secret).update(data).digest("base64url");
}

export function createSession(ttlMs = DEFAULT_TTL_MS) {
  const secret = getSecret();
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + ttlMs })).toString("base64url");
  return `${payload}.${sign(payload, secret)}`;
}

export function verifySession(token) {
  const secret = getSecret();
  if (!token || !secret) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  const expected = sign(payload, secret);
  if (sig.length !== expected.length) return false;
  try {
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false;
    const { exp } = JSON.parse(Buffer.from(payload, "base64url").toString());
    return typeof exp === "number" && exp > Date.now();
  } catch {
    return false;
  }
}

// 요청이 인증되었는가 — 세션 쿠키 또는 Bearer ADMIN_API_KEY(프로그램 접근용) 허용
export function isAuthed(req) {
  const token = req.cookies?.get?.(COOKIE_NAME)?.value;
  if (verifySession(token)) return true;
  const bearer = req.headers.get("authorization")?.replace("Bearer ", "");
  return !!(process.env.ADMIN_API_KEY && bearer === process.env.ADMIN_API_KEY);
}

// 관리자 API 보호: 미인증이면 401 응답 반환, 인증이면 null
export function requireAdmin(req) {
  if (isAuthed(req)) return null;
  return NextResponse.json({ error: "Unauthorized", message: "관리자 로그인이 필요합니다." }, { status: 401 });
}

export const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: DEFAULT_TTL_MS / 1000,
};
