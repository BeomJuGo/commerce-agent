"use client";
import Link from "next/link";
import { useState } from "react";
import { TOOLS } from "@/lib/tools";

export default function SiteNav({ authed = false }) {
  const [open, setOpen] = useState(false);

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "18px 48px",
        background: "rgba(10,10,10,0.72)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <Link href="/" style={{ textDecoration: "none", fontSize: 19, letterSpacing: "-0.01em", color: "#fafafa" }}>
        <span style={{ fontWeight: 800 }}>COMMERCE</span>
        <span style={{ fontWeight: 400, color: "#7d7d80" }}> AGENT</span>
      </Link>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          padding: 5,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 999,
        }}
      >
        <div style={{ position: "relative" }} onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
          <button
            type="button"
            className="ca-pill"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              border: "none",
              cursor: "pointer",
              padding: "9px 18px",
              borderRadius: 999,
              whiteSpace: "nowrap",
              fontSize: 14,
              fontWeight: 600,
              fontFamily: "inherit",
              color: "#fafafa",
              background: "rgba(255,255,255,0.10)",
            }}
          >
            도구 <span style={{ fontSize: 9, opacity: 0.7 }}>▼</span>
          </button>
          {open && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: "50%",
                transform: "translateX(-50%)",
                paddingTop: 12,
                zIndex: 60,
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  gap: 8,
                  width: "max-content",
                  background: "#141414",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 16,
                  padding: 10,
                  boxShadow: "0 26px 60px -22px rgba(0,0,0,0.85)",
                  animation: "caDrop .18s ease both",
                }}
              >
                {TOOLS.map((t) => {
                  const locked = t.href === "/dashboard" && !authed;
                  if (locked) {
                    return (
                      <div
                        key={t.href}
                        title="관리자 로그인 후 이용 가능"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                          padding: "14px 18px",
                          border: "1px dashed rgba(255,255,255,0.12)",
                          borderRadius: 12,
                          background: "#121212",
                          cursor: "not-allowed",
                        }}
                      >
                        <span style={{ fontSize: 13.5, fontWeight: 600, color: "#5e5e62", whiteSpace: "nowrap" }}>
                          {t.title}
                        </span>
                        <span
                          className="ca-mono"
                          style={{
                            fontSize: 9,
                            fontWeight: 700,
                            letterSpacing: "0.08em",
                            color: "#ff7a3d",
                            border: "1px solid rgba(255,92,26,0.4)",
                            borderRadius: 5,
                            padding: "2px 5px",
                          }}
                        >
                          ADMIN
                        </span>
                      </div>
                    );
                  }
                  return (
                    <Link
                      key={t.href}
                      href={t.href}
                      className="ca-dd-item"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        textDecoration: "none",
                        padding: "14px 18px",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 12,
                        background: "#1a1a1a",
                      }}
                    >
                      <span style={{ fontSize: 13.5, fontWeight: 600, color: "#eaeaea", whiteSpace: "nowrap" }}>
                        {t.title}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <Link
          href="/#strength"
          className="ca-link-muted"
          style={{
            textDecoration: "none",
            padding: "9px 18px",
            borderRadius: 999,
            whiteSpace: "nowrap",
            fontSize: 14,
            fontWeight: 500,
            color: "#9a9a9d",
          }}
        >
          강점
        </Link>
      </div>

      <Link
        href={authed ? "/dashboard" : "/login"}
        className="ca-btn-primary"
        style={{
          textDecoration: "none",
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          background: "#ff5c1a",
          color: "#0a0a0a",
          padding: "11px 22px",
          borderRadius: 999,
          whiteSpace: "nowrap",
          fontSize: 14,
          fontWeight: 700,
        }}
      >
        {authed ? "대시보드" : "관리자 로그인"}
      </Link>
    </nav>
  );
}
