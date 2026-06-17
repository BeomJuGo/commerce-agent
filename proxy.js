// Next.js Proxy(구 middleware) — 관리자 전용 경로 보호. 세션 미보유 시 /login 으로 리다이렉트.
import { NextResponse } from "next/server";
import { verifySession, COOKIE_NAME } from "@/lib/auth";

export function proxy(request) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!verifySession(token)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("from", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/dashboard", "/sourcing", "/links"],
};
