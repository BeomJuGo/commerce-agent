// lib/auth-server.js — 서버 컴포넌트에서 로그인 여부 확인 (next/headers 사용)
// next/headers는 proxy/edge에서 못 쓰므로 lib/auth와 분리해 둔다.
import { cookies } from "next/headers";
import { verifySession, COOKIE_NAME } from "./auth";

export async function isLoggedIn() {
  const store = await cookies();
  return verifySession(store.get(COOKIE_NAME)?.value);
}
