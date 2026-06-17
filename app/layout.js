import "./globals.css";

export const metadata = {
  title: "AI 커머스 에이전트",
  description: "자연어 기반 상품 추천·비교·분석·응대 AI 커머스 에이전트",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        {/* React 19가 stylesheet link를 head로 hoist */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.css"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap"
        />
        {children}
      </body>
    </html>
  );
}
