// 관리자 로그인 — 비밀번호 검증 후 서명된 httpOnly 세션 쿠키 발급
export const runtime = "nodejs";
import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { parseBody, handleError } from "@/lib/validate";
import { rateLimit } from "@/lib/rateLimit";
import { loginSchema } from "@/lib/schemas";
import { createSession, getAdminPassword, COOKIE_NAME, cookieOptions } from "@/lib/auth";

function safeEqual(a, b) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

export async function POST(req) {
  // 무차별 대입 완화: 분당 5회
  const limited = rateLimit(req, { name: "login", max: 5, windowMs: 60000 });
  if (limited) return limited;

  const { data, response } = await parseBody(loginSchema, req);
  if (response) return response;

  try {
    const expected = getAdminPassword();
    if (!expected) {
      return NextResponse.json(
        { error: "Server Misconfiguration", message: "ADMIN_PASSWORD(또는 ADMIN_API_KEY)가 설정되지 않았습니다." },
        { status: 500 }
      );
    }
    if (!safeEqual(data.password, expected)) {
      return NextResponse.json({ error: "비밀번호가 올바르지 않습니다." }, { status: 401 });
    }
    const res = NextResponse.json({ ok: true });
    res.cookies.set(COOKIE_NAME, createSession(), cookieOptions);
    return res;
  } catch (e) {
    return handleError(e, "로그인 처리에 실패했습니다.");
  }
}
