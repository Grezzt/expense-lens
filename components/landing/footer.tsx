"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer>
      {/* ====== Top CTA Banner (dark green with grid background) ====== */}
      <div
        className="el-grid-bg relative overflow-hidden"
        style={{
          backgroundColor: "var(--el-primary)",
          padding: "80px 24px",
          textAlign: "center",
        }}
      >
        {/* Overlay tint */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundColor: "rgba(2,44,34,0.7)", zIndex: 1 }}
        />

        <div className="relative z-10">
          <p
            style={{
              color: "var(--el-accent)",
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: 2,
              fontSize: 13,
              marginBottom: 16,
            }}
          >
            Ready to simplify your expenses?
          </p>
          <h2
            style={{
              color: "var(--el-white)",
              fontSize: "clamp(28px, 5vw, 56px)",
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              maxWidth: 700,
              margin: "0 auto 32px",
            }}
          >
            Start tracking smarter with AI today.
          </h2>
          <p
            style={{
              color: "rgba(255,255,255,0.7)",
              fontSize: 17,
              lineHeight: 1.5,
              maxWidth: 520,
              margin: "0 auto 40px",
            }}
          >
            Join teams already using ExpenseLens to automate receipt scanning,
            categorize expenses, and make data-driven financial decisions.
          </p>
          <Link href="/login" className="btn-el-accent" style={{ fontSize: 14 }}>
            Get Started Free
          </Link>
        </div>
      </div>

      {/* ====== Bottom nav / links bar (dark navy) ====== */}
      <div style={{ backgroundColor: "#040f09", padding: "48px 24px 28px" }}>
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1fr repeat(3, auto)",
            gap: "32px 64px",
          }}
        >
          {/* Logo + tagline */}
          <div>
            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 16,
                textDecoration: "none",
              }}
            >
              <span
                style={{
                  color: "var(--el-white)",
                  fontWeight: 700,
                  fontSize: 22,
                  letterSpacing: "-0.02em",
                }}
              >
                Expense
              </span>
              <span
                style={{
                  backgroundColor: "var(--el-accent)",
                  color: "var(--el-primary)",
                  fontWeight: 900,
                  fontSize: 13,
                  padding: "2px 5px",
                  letterSpacing: 1,
                  textTransform: "uppercase",
                }}
              >
                Lens
              </span>
            </Link>
            <p
              style={{
                color: "rgba(255,255,255,0.4)",
                fontSize: 14,
                lineHeight: 1.6,
                maxWidth: 260,
              }}
            >
              AI-powered expense management for modern businesses and growing teams.
            </p>
          </div>

          {/* Features links */}
          <div>
            <h4
              style={{
                color: "var(--el-white)",
                fontWeight: 700,
                fontSize: 13,
                textTransform: "uppercase",
                letterSpacing: 1.5,
                marginBottom: 16,
              }}
            >
              Features
            </h4>
            {["Smart OCR", "Auto-Categorize", "Analytics", "Team Management"].map((s) => (
              <Link
                key={s}
                href="/features"
                style={{
                  display: "block",
                  color: "rgba(255,255,255,0.45)",
                  fontSize: 14,
                  marginBottom: 10,
                  textDecoration: "none",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) =>
                  ((e.target as HTMLElement).style.color = "#fff")
                }
                onMouseLeave={(e) =>
                  ((e.target as HTMLElement).style.color = "rgba(255,255,255,0.45)")
                }
              >
                {s}
              </Link>
            ))}
          </div>

          {/* Company links */}
          <div>
            <h4
              style={{
                color: "var(--el-white)",
                fontWeight: 700,
                fontSize: 13,
                textTransform: "uppercase",
                letterSpacing: 1.5,
                marginBottom: 16,
              }}
            >
              Product
            </h4>
            {[
              { label: "How It Works", href: "/how-it-works" },
              { label: "Sign In", href: "/login" },
              { label: "Register", href: "/register" },
              { label: "FAQ", href: "#faq" },
            ].map((s) => (
              <Link
                key={s.label}
                href={s.href}
                style={{
                  display: "block",
                  color: "rgba(255,255,255,0.45)",
                  fontSize: 14,
                  marginBottom: 10,
                  textDecoration: "none",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) =>
                  ((e.target as HTMLElement).style.color = "#fff")
                }
                onMouseLeave={(e) =>
                  ((e.target as HTMLElement).style.color = "rgba(255,255,255,0.45)")
                }
              >
                {s.label}
              </Link>
            ))}
          </div>

          {/* Tech */}
          <div>
            <h4
              style={{
                color: "var(--el-white)",
                fontWeight: 700,
                fontSize: 13,
                textTransform: "uppercase",
                letterSpacing: 1.5,
                marginBottom: 16,
              }}
            >
              Tech Stack
            </h4>
            {["Gemini AI", "Next.js", "Supabase", "TypeScript"].map((s) => (
              <p
                key={s}
                style={{
                  color: "rgba(255,255,255,0.35)",
                  fontSize: 14,
                  marginBottom: 10,
                }}
              >
                {s}
              </p>
            ))}
          </div>
        </div>

        {/* Copyright bar */}
        <div
          style={{
            maxWidth: 1200,
            margin: "40px auto 0",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            paddingTop: 24,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 13 }}>
            © {new Date().getFullYear()} ExpenseLens. All rights reserved.
          </p>
          <div style={{ display: "flex", gap: 20 }}>
            {["Privacy Policy", "Terms of Service"].map((s) => (
              <Link
                key={s}
                href="#"
                style={{
                  color: "rgba(255,255,255,0.25)",
                  fontSize: 13,
                  textDecoration: "none",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) =>
                  ((e.target as HTMLElement).style.color = "rgba(255,255,255,0.6)")
                }
                onMouseLeave={(e) =>
                  ((e.target as HTMLElement).style.color = "rgba(255,255,255,0.25)")
                }
              >
                {s}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
