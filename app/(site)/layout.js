import Link from "next/link";

const NAV = [
  ["/recommend", "상황 추천"],
  ["/compare", "비교·판단"],
  ["/review", "리뷰 분석"],
  ["/curation", "큐레이션"],
  ["/sourcing", "소싱"],
  ["/links", "링크 관리"],
  ["/dashboard", "대시보드"],
  ["/widget-demo", "위젯"],
];

export default function SiteLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
          <Link href="/" className="text-lg font-bold text-gray-900">
            🛒 AI 커머스 에이전트
          </Link>
          <nav className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-gray-600">
            {NAV.map(([href, label]) => (
              <Link key={href} href={href} className="hover:text-indigo-600">
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
      <footer className="border-t border-gray-200 bg-white py-6 text-center text-xs text-gray-400">
        AI 커머스 에이전트 · 네이버 쇼핑 API + OpenAI · Vercel 배포
      </footer>
    </div>
  );
}
