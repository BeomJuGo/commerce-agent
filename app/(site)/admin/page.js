import Link from "next/link";
import AdminLogout from "@/components/AdminLogout";

const ADMIN_TOOLS = [
  { href: "/admin/orders", en: "ORDERS", title: "주문 내역", desc: "모의 결제로 생성된 주문과 매출 요약을 확인합니다." },
  { href: "/dashboard", en: "DASHBOARD", title: "고객 니즈 대시보드", desc: "상담 위젯 대화 로그를 분석해 니즈·기회를 시각화합니다." },
  { href: "/sourcing", en: "SOURCING", title: "소싱 아이디어", desc: "분야/키워드로 상품 소싱 아이디어와 시장 신호를 제안받습니다." },
  { href: "/links", en: "LINKS", title: "쿠팡/자사몰 링크 관리", desc: "상품 URL을 저장·보강해 태그로 관리합니다." },
];

export default function AdminHub() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex items-start justify-between">
        <div>
          <span className="ca-mono text-xs tracking-widest text-[#a1a1aa]">ADMIN</span>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#18181b]">관리자</h1>
          <p className="mt-2 text-[#71717a]">스토어 운영 도구입니다. 로그인한 관리자만 접근할 수 있습니다.</p>
        </div>
        <AdminLogout />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ADMIN_TOOLS.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="ca-card flex flex-col rounded-2xl border border-black/[0.07] bg-[#ffffff] p-5"
          >
            <span className="ca-mono text-xs text-[#a1a1aa]">{t.en}</span>
            <h2 className="mt-3 font-semibold text-[#18181b]">{t.title}</h2>
            <p className="mt-1 text-sm text-[#71717a]">{t.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
