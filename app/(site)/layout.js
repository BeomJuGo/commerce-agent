import Link from "next/link";
import SiteNav from "@/components/SiteNav";
import { TOOLS } from "@/lib/tools";

function SiteFooter() {
  return (
    <footer style={{ borderTop: "1px solid rgba(255,255,255,0.07)", background: "#0c0c0c" }}>
      <div className="ca-footer-grid" style={{ maxWidth: 1180, margin: "0 auto", padding: "64px 48px 40px" }}>
        <div>
          <div style={{ fontSize: 19, letterSpacing: "-0.01em" }}>
            <span style={{ fontWeight: 800, color: "#fafafa" }}>COMMERCE</span>
            <span style={{ fontWeight: 400, color: "#7d7d80" }}> AGENT</span>
          </div>
          <p style={{ margin: "16px 0 0", maxWidth: 320, fontSize: 14, lineHeight: 1.7, color: "#86868a" }}>
            네이버 쇼핑과 OpenAI를 결합한 AI 커머스 에이전트. 탐색부터 판단, 응대, 데이터 구조화까지 한곳에서.
          </p>
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#fafafa", letterSpacing: "0.02em" }}>도구</div>
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 11 }}>
            {TOOLS.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                className="ca-link-muted"
                style={{ fontSize: 14, color: "#909093", textDecoration: "none" }}
              >
                {t.title}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#fafafa", letterSpacing: "0.02em" }}>기술 스택</div>
          <div
            className="ca-mono"
            style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 12, fontSize: 13, color: "#86868a" }}
          >
            {[
              ["SOURCE", "네이버 쇼핑 API", "#c8c8cc"],
              ["MODEL", "gpt-4o-mini", "#c8c8cc"],
              ["STACK", "Next.js", "#c8c8cc"],
            ].map(([k, v, c]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#5e5e62" }}>{k}</span>
                <span style={{ color: c }}>{v}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#5e5e62" }}>STATUS</span>
              <span style={{ color: "#5fbf8a", display: "flex", alignItems: "center", gap: 7 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#5fbf8a" }} />
                ONLINE
              </span>
            </div>
          </div>
        </div>
      </div>
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <div
          style={{
            maxWidth: 1180,
            margin: "0 auto",
            padding: "22px 48px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 12.5,
            color: "#6f6f72",
          }}
        >
          <span>© 2026 COMMERCE AGENT · Internal Demo</span>
          <span className="ca-mono">v1.0</span>
        </div>
      </div>
    </footer>
  );
}

export default function SiteLayout({ children }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#0a0a0a", overflowX: "hidden" }}>
      <SiteNav />
      <main style={{ flex: 1 }}>{children}</main>
      <SiteFooter />
    </div>
  );
}
