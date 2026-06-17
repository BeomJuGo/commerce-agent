import Link from "next/link";
import { TOOLS, STRENGTHS, TECH_TOKENS } from "@/lib/tools";
import { isLoggedIn } from "@/lib/auth-server";

const TAG = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  background: "rgba(255,92,26,0.12)",
  color: "#ff7a3d",
  fontSize: 13,
  fontWeight: 600,
  padding: "7px 14px",
  borderRadius: 999,
  whiteSpace: "nowrap",
};

const BTN_PRIMARY = {
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  background: "#ff5c1a",
  color: "#0a0a0a",
  padding: "14px 26px",
  borderRadius: 999,
  whiteSpace: "nowrap",
  fontSize: 15,
  fontWeight: 700,
};

const BTN_GHOST = {
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  border: "1px solid rgba(255,255,255,0.18)",
  color: "#eaeaea",
  padding: "14px 26px",
  borderRadius: 999,
  whiteSpace: "nowrap",
  fontSize: 15,
  fontWeight: 600,
};

export default async function Home() {
  const authed = await isLoggedIn();
  const techLoop = [...TECH_TOKENS, ...TECH_TOKENS];

  return (
    <div>
      {/* ===== HERO ===== */}
      <header id="top" style={{ maxWidth: 1180, margin: "0 auto", padding: "96px 48px 0" }}>
        <div className="ca-reveal-load">
          <span style={TAG}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#ff5c1a" }} />
            AI COMMERCE AGENT
          </span>
          <h1
            style={{
              margin: "26px 0 0",
              fontSize: 62,
              fontWeight: 800,
              lineHeight: 1.12,
              letterSpacing: "-0.035em",
              color: "#fafafa",
            }}
          >
            상품을 찾고, 비교하고, 판단하는 일.
            <br />
            이제 에이전트가 합니다.
          </h1>
          <p style={{ margin: "24px 0 0", maxWidth: 600, fontSize: 17, lineHeight: 1.7, color: "#9a9a9d" }}>
            자연어 한 줄이면 충분합니다. 네이버 쇼핑과 OpenAI를 결합한 8개의 커머스 도구로 탐색부터 추천·비교·구매 판단·고객
            응대·데이터 구조화까지 한곳에서.
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 36 }}>
            <Link href="/recommend" className="ca-btn-primary" style={BTN_PRIMARY}>
              데모 시작 →
            </Link>
            <Link href="#tools" className="ca-btn-ghost" style={BTN_GHOST}>
              도구 둘러보기
            </Link>
          </div>
        </div>

        {/* hero visual card */}
        <div
          className="ca-reveal-load"
          style={{
            position: "relative",
            marginTop: 56,
            height: 440,
            borderRadius: 24,
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.08)",
            background:
              "radial-gradient(130% 120% at 50% 130%, rgba(255,92,26,0.28), transparent 58%), linear-gradient(180deg,#101010,#0c0c0c)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: "radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)",
              backgroundSize: "26px 26px",
              opacity: 0.5,
            }}
          />
          <div
            style={{
              position: "absolute",
              width: 680,
              height: 680,
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "50%",
              animation: "ca-spin 60s linear infinite",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: 440,
              height: 440,
              border: "1px solid rgba(255,92,26,0.18)",
              borderRadius: "50%",
              animation: "ca-spin 40s linear infinite reverse",
            }}
          />
          <div style={{ position: "relative", textAlign: "center" }}>
            <div style={{ fontSize: 58, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1, color: "#fafafa" }}>
              COMMERCE
            </div>
            <div style={{ fontSize: 58, fontWeight: 300, letterSpacing: "0.04em", lineHeight: 1.05, color: "#ff5c1a" }}>
              AGENT
            </div>
            <div
              className="ca-mono"
              style={{ marginTop: 22, fontSize: 12, letterSpacing: "0.22em", color: "#7d7d80" }}
            >
              AI · NAVER SHOPPING · OPENAI
            </div>
          </div>
        </div>
      </header>

      {/* ===== TECH MARQUEE ===== */}
      <div style={{ maxWidth: 1180, margin: "40px auto 0", padding: "0 48px" }}>
        <div
          style={{
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 14,
            background: "#0e0e0e",
            padding: "16px 0",
            WebkitMaskImage: "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)",
            maskImage: "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)",
          }}
        >
          <div
            className="ca-mono"
            style={{
              display: "flex",
              width: "max-content",
              animation: "ca-marquee 26s linear infinite",
              fontSize: 13,
              letterSpacing: "0.06em",
              color: "#86868a",
            }}
          >
            {techLoop.map((tok, i) => (
              <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 16, padding: "0 24px" }}>
                {tok}
                <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#ff5c1a" }} />
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ===== TOOLS ===== */}
      <section id="tools" style={{ maxWidth: 1180, margin: "0 auto", padding: "120px 48px 0" }}>
        <div className="ca-reveal">
          <span style={TAG}>에이전트 도구</span>
          <h2 style={{ margin: "22px 0 0", fontSize: 46, fontWeight: 800, letterSpacing: "-0.03em", color: "#fafafa" }}>
            What It Does<span style={{ color: "#ff5c1a" }}>.</span>
          </h2>
          <p style={{ margin: "16px 0 0", maxWidth: 560, fontSize: 16, lineHeight: 1.7, color: "#9a9a9d" }}>
            단순히 검색만 하지 않습니다. 맥락을 이해하고, 비교하고, 판단까지 돕는 8개의 커머스 도구.
          </p>
        </div>

        <div
          className="ca-reveal ca-tools-grid"
          style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18, marginTop: 44 }}
        >
          {TOOLS.map((t) => {
            const locked = t.href === "/dashboard" && !authed;
            const Wrapper = locked ? "div" : Link;
            return (
            <Wrapper
              key={t.href}
              {...(locked ? { title: "관리자 로그인 후 이용 가능" } : { href: t.href, className: "ca-card" })}
              style={{
                textDecoration: "none",
                display: "flex",
                flexDirection: "column",
                background: "#141414",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 18,
                padding: 28,
                minHeight: 236,
                ...(locked ? { opacity: 0.45, cursor: "not-allowed" } : {}),
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <span className="ca-mono" style={{ fontSize: 13, color: "#6f6f72", paddingTop: 6 }}>
                  {t.en}
                </span>
                <span
                  className="ca-mono"
                  style={{
                    flex: "0 0 auto",
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: "#ff5c1a",
                    color: "#0a0a0a",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    fontWeight: 800,
                  }}
                >
                  {t.idx}
                </span>
              </div>
              <h3 style={{ margin: "22px 0 0", fontSize: 20, fontWeight: 700, letterSpacing: "-0.01em", color: "#fafafa" }}>
                {t.title}
              </h3>
              <p style={{ margin: "9px 0 0", fontSize: 14, lineHeight: 1.6, color: "#909093", flex: 1 }}>{t.desc}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 18 }}>
                {t.chips.map((c) => (
                  <span
                    key={c}
                    style={{
                      fontSize: 12,
                      color: "#a6a6a9",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 7,
                      padding: "5px 10px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {c}
                  </span>
                ))}
              </div>
            </Wrapper>
            );
          })}
        </div>
      </section>

      {/* ===== STRENGTH ===== */}
      <section id="strength" style={{ maxWidth: 1180, margin: "0 auto", padding: "130px 48px 0" }}>
        <div
          className="ca-reveal ca-strength-grid"
          style={{ display: "grid", gridTemplateColumns: "0.85fr 1fr", gap: 56, alignItems: "center" }}
        >
          <div
            style={{
              position: "relative",
              height: 420,
              borderRadius: 22,
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.08)",
              background: "radial-gradient(120% 100% at 20% 110%, rgba(255,92,26,0.22), transparent 60%), #101010",
              display: "flex",
              alignItems: "flex-end",
              padding: 32,
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: "radial-gradient(rgba(255,255,255,0.045) 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />
            <div style={{ position: "absolute", top: 30, right: 30, width: 54, height: 54, borderRadius: "50%", background: "#ff5c1a" }} />
            <div style={{ position: "relative" }}>
              <div className="ca-mono" style={{ fontSize: 12, letterSpacing: "0.18em", color: "#7d7d80" }}>
                WHY AGENT
              </div>
              <div style={{ marginTop: 10, fontSize: 30, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.25, color: "#fafafa" }}>
                검색을 넘어
                <br />
                판단까지.
              </div>
            </div>
          </div>

          <div>
            <span style={TAG}>강점</span>
            <h2 style={{ margin: "20px 0 4px", fontSize: 44, fontWeight: 800, letterSpacing: "-0.03em", color: "#fafafa" }}>
              Our Strength<span style={{ color: "#ff5c1a" }}>.</span>
            </h2>
            <div style={{ marginTop: 18 }}>
              {STRENGTHS.map((s) => (
                <div
                  key={s.idx}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "44px 1fr",
                    gap: 18,
                    padding: "22px 0",
                    borderTop: "1px solid rgba(255,255,255,0.09)",
                  }}
                >
                  <span className="ca-mono" style={{ fontSize: 13, fontWeight: 600, color: "#ff5c1a" }}>
                    {s.idx}
                  </span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#fafafa" }}>{s.title}</h3>
                    <p style={{ margin: "7px 0 0", fontSize: 14, lineHeight: 1.6, color: "#909093" }}>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA BAND ===== */}
      <section id="start" style={{ marginTop: 140, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="ca-reveal" style={{ maxWidth: 1180, margin: "0 auto", padding: "120px 48px", textAlign: "center", position: "relative" }}>
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: 30,
              transform: "translateX(-50%)",
              width: 520,
              height: 280,
              background: "radial-gradient(circle, rgba(255,92,26,0.16), transparent 70%)",
              filter: "blur(20px)",
              pointerEvents: "none",
            }}
          />
          <div style={{ position: "relative" }}>
            <span style={TAG}>GET STARTED</span>
            <h2 style={{ margin: "24px 0 0", fontSize: 52, fontWeight: 800, letterSpacing: "-0.035em", lineHeight: 1.15, color: "#fafafa" }}>
              지금, 커머스 에이전트를
              <br />
              직접 사용해 보세요.
            </h2>
            <p style={{ margin: "18px auto 0", maxWidth: 520, fontSize: 16, lineHeight: 1.7, color: "#9a9a9d" }}>
              8개 도구 모두 자연어 한 줄로 작동합니다. 설치 없이 데모에서 바로 확인하세요.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 38 }}>
              <Link href="/recommend" className="ca-btn-primary" style={{ ...BTN_PRIMARY, padding: "15px 30px", fontSize: 16 }}>
                데모 시작 →
              </Link>
              <Link href="#tools" className="ca-btn-ghost" style={{ ...BTN_GHOST, padding: "15px 30px", fontSize: 16 }}>
                도구 다시 보기
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
