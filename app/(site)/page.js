import Link from "next/link";

const TOOLS = [
  ["/recommend", "🎯", "상황 기반 상품 추천", "자연어로 상황을 말하면 딱 맞는 상품을 골라 추천합니다."],
  ["/compare", "⚖️", "비교 · 구매 판단", "여러 상품을 비교하고 무엇을 살지 판단을 도와줍니다."],
  ["/review", "📝", "리뷰 요약 · 장단점", "상품의 장단점과 구매 추천 여부를 요약합니다."],
  ["/curation", "🧳", "라이프스타일 큐레이션", "여행·계절·라이프스타일 테마로 쇼핑을 큐레이션합니다."],
  ["/sourcing", "💡", "소싱 아이디어", "셀러를 위한 상품 소싱 아이디어와 시장 신호를 제안합니다."],
  ["/links", "🔗", "네이버 링크 관리", "상품 링크를 검색·보강해 저장하고 태그로 관리합니다."],
  ["/dashboard", "📊", "고객 니즈 대시보드", "대화 로그를 분석해 고객 니즈와 기회를 시각화합니다."],
  ["/widget-demo", "💬", "고객 응대 위젯", "한 줄 스크립트로 어떤 쇼핑몰에도 챗봇을 삽입합니다."],
];

export default function Hub() {
  return (
    <div>
      <section className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">AI 커머스 에이전트</h1>
        <p className="mx-auto mt-3 max-w-2xl text-gray-600">
          자연어 입력만으로 상품 탐색·추천·비교·구매 판단·고객 응대·데이터 구조화까지.
          네이버 쇼핑과 OpenAI를 결합한 8가지 커머스 도구를 한곳에서.
        </p>
      </section>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map(([href, emoji, title, desc]) => (
          <Link
            key={href}
            href={href}
            className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md"
          >
            <div className="text-3xl">{emoji}</div>
            <h2 className="mt-3 font-semibold text-gray-900 group-hover:text-indigo-600">{title}</h2>
            <p className="mt-1 text-sm text-gray-600">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
