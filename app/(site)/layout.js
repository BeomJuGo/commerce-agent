import Link from "next/link";
import StoreNav from "@/components/StoreNav";
import SupportChat from "@/components/SupportChat";
import { CATEGORIES } from "@/lib/store";
import { isLoggedIn } from "@/lib/auth-server";

function StoreFooter() {
  return (
    <footer style={{ borderTop: "1px solid rgba(0,0,0,0.07)", background: "#f6f6f7" }}>
      <div className="ca-footer-grid" style={{ maxWidth: 1180, margin: "0 auto", padding: "56px 48px 40px" }}>
        <div>
          <div style={{ fontSize: 18, letterSpacing: "-0.01em" }}>
            <span style={{ fontWeight: 800, color: "#18181b" }}>COMMERCE</span>
            <span style={{ fontWeight: 400, color: "#a1a1aa" }}> STORE</span>
          </div>
          <p style={{ margin: "14px 0 0", maxWidth: 320, fontSize: 14, lineHeight: 1.7, color: "#9a9aa2" }}>
            네이버 쇼핑 상품을 AI가 추천·비교·분석해 주는 커머스 스토어. 상품은 네이버 쇼핑에서 실시간으로 제공됩니다.
          </p>
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#18181b" }}>카테고리</div>
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 11 }}>
            {CATEGORIES.map((c) => (
              <Link key={c.slug} href={`/search?cat=${c.slug}`} className="ca-link-muted" style={{ fontSize: 14, color: "#71717a", textDecoration: "none" }}>
                {c.label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#18181b" }}>안내</div>
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 11 }}>
            <Link href="/cart" className="ca-link-muted" style={{ fontSize: 14, color: "#71717a", textDecoration: "none" }}>
              장바구니
            </Link>
            <Link href="/login" className="ca-link-muted" style={{ fontSize: 14, color: "#71717a", textDecoration: "none" }}>
              관리자 로그인
            </Link>
            <span className="ca-mono" style={{ fontSize: 12, color: "#b0b0b8", marginTop: 6 }}>
              결제는 데모(모의)로 동작합니다.
            </span>
          </div>
        </div>
      </div>
      <div style={{ borderTop: "1px solid rgba(0,0,0,0.07)" }}>
        <div
          style={{
            maxWidth: 1180,
            margin: "0 auto",
            padding: "22px 48px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 12.5,
            color: "#a1a1aa",
          }}
        >
          <span>© 2026 COMMERCE STORE · Demo</span>
          <span className="ca-mono">NAVER 쇼핑 · OpenAI</span>
        </div>
      </div>
    </footer>
  );
}

export default async function SiteLayout({ children }) {
  const authed = await isLoggedIn();
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f7f7f8", overflowX: "hidden" }}>
      <StoreNav authed={authed} />
      <main style={{ flex: 1 }}>{children}</main>
      <StoreFooter />
      <SupportChat />
    </div>
  );
}
