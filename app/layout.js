import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://commerce-agent-ecru.vercel.app";
const SITE_NAME = "AI 커머스 에이전트";
const SITE_DESC = "자연어로 상황을 말하면 AI가 상품을 추천·비교·분석하고 응대까지 해주는 커머스 쇼핑몰";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} · AI 쇼핑몰`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESC,
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "ko_KR",
    url: SITE_URL,
    title: `${SITE_NAME} · AI 쇼핑몰`,
    description: SITE_DESC,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} · AI 쇼핑몰`,
    description: SITE_DESC,
  },
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
