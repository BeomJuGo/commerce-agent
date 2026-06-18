"use client";
import { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader, Card, Button, ErrorBox, formatPrice } from "@/components/ui";

function fmtDate(s) {
  if (!s) return "-";
  try {
    return new Date(s).toLocaleString("ko-KR", { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return String(s);
  }
}

export default function AdminOrdersPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);
  const [open, setOpen] = useState(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/orders");
      const json = await res.json().catch(() => ({}));
      if (res.status === 401) {
        window.location.href = "/login?from=/admin/orders";
        return;
      }
      if (!res.ok) throw new Error(json.message || json.error || "조회 실패");
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const summary = data?.summary;
  const orders = data?.orders || [];

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex items-start justify-between">
        <PageHeader
          eyebrow="ORDERS"
          title="주문 내역"
          description="모의 결제로 생성된 주문을 최신순으로 확인합니다(최근 100건)."
        />
        <Link href="/admin" className="ca-mono mt-1 whitespace-nowrap text-xs text-[#a1a1aa] hover:text-[#e0480f]">
          ← ADMIN
        </Link>
      </div>

      <div className="mb-6 flex items-center gap-3">
        <Button onClick={load} loading={loading}>
          새로고침
        </Button>
      </div>

      <ErrorBox message={error} />

      {summary && (
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          {[
            ["주문 건수", `${summary.count}건`],
            ["총 매출(모의)", formatPrice(summary.revenue)],
            ["판매 수량", `${summary.itemCount}개`],
          ].map(([label, val]) => (
            <Card key={label}>
              <p className="ca-mono text-xs tracking-wider text-[#a1a1aa]">{label}</p>
              <p className="mt-1 text-2xl font-bold text-[#18181b]">{val}</p>
            </Card>
          ))}
        </div>
      )}

      {data && orders.length === 0 && (
        <p className="text-sm text-[#9a9aa2]">아직 주문이 없습니다. 스토어에서 모의 주문이 생성되면 표시됩니다.</p>
      )}

      {orders.length > 0 && (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/[0.07] text-left text-[#71717a]">
                  <th className="px-4 py-3 font-medium">주문번호</th>
                  <th className="px-4 py-3 font-medium">일시</th>
                  <th className="px-4 py-3 font-medium">상품</th>
                  <th className="px-4 py-3 text-right font-medium">수량</th>
                  <th className="px-4 py-3 text-right font-medium">금액</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => {
                  const first = o.items?.[0];
                  const more = (o.items?.length || 0) - 1;
                  const isOpen = open === o.id;
                  return (
                    <Fragment key={o.id}>
                      <tr
                        onClick={() => setOpen(isOpen ? null : o.id)}
                        className="cursor-pointer border-b border-black/[0.05] hover:bg-black/[0.02]"
                      >
                        <td className="px-4 py-3">
                          <span className="ca-mono text-xs text-[#52525b]">{o.orderNo}</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-[#71717a]">{fmtDate(o.createdAt)}</td>
                        <td className="px-4 py-3 text-[#27272a]">
                          <span className="line-clamp-1">{first?.title || "-"}</span>
                          {more > 0 && <span className="text-[#a1a1aa]"> 외 {more}건</span>}
                        </td>
                        <td className="px-4 py-3 text-right text-[#52525b]">{o.itemCount}</td>
                        <td className="px-4 py-3 text-right font-semibold text-[#e0480f]">{formatPrice(o.total)}</td>
                      </tr>
                      {isOpen && (
                        <tr key={`${o.id}-detail`} className="border-b border-black/[0.05] bg-black/[0.015]">
                          <td colSpan={5} className="px-4 py-3">
                            <ul className="space-y-1.5">
                              {o.items?.map((it, i) => (
                                <li key={i} className="flex items-center justify-between gap-3 text-[#52525b]">
                                  <span className="line-clamp-1">
                                    {it.title}
                                    {it.mallName && <span className="text-[#a1a1aa]"> · {it.mallName}</span>}
                                  </span>
                                  <span className="ca-mono whitespace-nowrap text-xs">
                                    {formatPrice(it.lprice)} × {it.qty}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
