"use client";
// components/ui.js — 공용 클라이언트 UI 프리미티브 (다크 테마) + fetch 헬퍼
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

export function PageHeader({ title, description, emoji, eyebrow }) {
  return (
    <header className="mb-8">
      <Link href="/" className="ca-mono text-xs text-[#ff7a3d] hover:underline">
        ← HOME
      </Link>
      {eyebrow && (
        <span className="ca-mono mt-3 block text-xs tracking-widest text-[#6f6f72]">{eyebrow}</span>
      )}
      <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[#fafafa]">{title}</h1>
      {description && <p className="mt-2 text-[#9a9a9d]">{description}</p>}
    </header>
  );
}

export function Card({ children, className = "" }) {
  return (
    <div className={`rounded-2xl border border-white/[0.07] bg-[#141414] p-5 ${className}`}>{children}</div>
  );
}

export function Button({ children, loading, className = "", ...props }) {
  return (
    <button
      className={`ca-btn-primary inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[#ff5c1a] px-5 py-2.5 font-semibold text-[#0a0a0a] disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#0a0a0a] border-t-transparent" />
      )}
      {children}
    </button>
  );
}

export function ErrorBox({ message }) {
  if (!message) return null;
  return (
    <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
      {message}
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
      className="ca-card flex gap-3 rounded-xl border border-white/[0.07] bg-[#141414] p-3"
    >
      {product.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={product.image}
          alt={product.title || ""}
          className="h-20 w-20 flex-shrink-0 rounded-lg object-cover"
        />
      ) : (
        <div className="ca-mono flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-xs text-[#6f6f72]">
          NO IMG
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm font-medium text-[#eaeaea]">{product.title}</p>
        <p className="mt-1 font-semibold text-[#ff7a3d]">{formatPrice(product.lprice ?? product.price)}</p>
        {product.mallName && <p className="mt-0.5 text-xs text-[#86868a]">{product.mallName}</p>}
        {product.reason && <p className="mt-1 text-xs text-[#909093]">{product.reason}</p>}
      </div>
    </a>
  );
}

export function Field({ label, children, hint }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-[#c8c8cc]">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-[#6f6f72]">{hint}</span>}
    </label>
  );
}

export const inputClass =
  "w-full rounded-xl border border-white/10 bg-[#141414] px-4 py-2.5 text-[#f4f4f3] placeholder:text-[#6f6f72] outline-none focus:border-[#ff5c1a] focus:ring-2 focus:ring-[#ff5c1a]/20";
