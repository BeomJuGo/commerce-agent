// lib/format.js — 서버/클라이언트 공용 포맷터
export function formatPrice(n) {
  if (n == null || Number.isNaN(Number(n))) return "가격정보 없음";
  return `${Number(n).toLocaleString("ko-KR")}원`;
}
