"use client";
// components/ui.js — 공용 클라이언트 UI 프리미티브 + fetch 헬퍼
import Link from "next/link";

export function formatPrice(n) {
  if (n == null || Number.isNaN(Number(n))) return "가격정보 없음";
  return `${Number(n).toLocaleString("ko-KR")}원`;
}

export async function postJSON(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || data?.detail || `요청 실패 (${res.status})`);
  return data;
}

export function PageHeader({ title, description, emoji }) {
  return (
    <header className="mb-8">
      <Link href="/" className="text-sm text-indigo-600 hover:underline">
        ← 전체 도구
      </Link>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
        {emoji ? `${emoji} ` : ""}
        {title}
      </h1>
      {description && <p className="mt-2 text-gray-600">{description}</p>}
    </header>
  );
}

export function Card({ children, className = "" }) {
  return (
    <div className={`rounded-2xl border border-gray-200 bg-white p-5 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function Button({ children, loading, className = "", ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
      )}
      {children}
    </button>
  );
}

export function ErrorBox({ message }) {
  if (!message) return null;
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      ⚠️ {message}
    </div>
  );
}

export function ProductCard({ product }) {
  if (!product) return null;
  return (
    <a
      href={product.link || "#"}
      target="_blank"
      rel="noopener noreferrer"
      className="flex gap-3 rounded-xl border border-gray-200 bg-white p-3 transition hover:border-indigo-300 hover:shadow-md"
    >
      {product.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={product.image}
          alt={product.title || ""}
          className="h-20 w-20 flex-shrink-0 rounded-lg object-cover"
        />
      ) : (
        <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
          📦
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm font-medium text-gray-900">{product.title}</p>
        <p className="mt-1 font-semibold text-indigo-600">{formatPrice(product.lprice ?? product.price)}</p>
        {product.mallName && <p className="mt-0.5 text-xs text-gray-500">{product.mallName}</p>}
        {product.reason && <p className="mt-1 text-xs text-gray-600">💡 {product.reason}</p>}
      </div>
    </a>
  );
}

export function Field({ label, children, hint }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-gray-700">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-gray-400">{hint}</span>}
    </label>
  );
}

export const inputClass =
  "w-full rounded-xl border border-gray-300 px-4 py-2.5 text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";
