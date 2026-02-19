"use client";

import Link from "next/link";
import Navbar from "@/components/landing/navbar";
import Footer from "@/components/landing/footer";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    id: "ocr",
    tag: "Smart OCR",
    title: "AI Receipt Scanning",
    desc: "Upload or snap a photo of any receipt. AI instantly reads merchant names, total amounts, line items, dates, and tax — all without you typing a single character.",
    highlights: [
      "Supports JPG, PNG, and PDF formats",
      "Handles handwritten and printed receipts",
      "Extracts line-by-line item breakdown",
      "Identifies tax amounts separately",
      "Works with blurry or low-light photos",
    ],
    icon: (
      <svg viewBox="0 0 64 64" fill="none" className="w-14 h-14">
        <rect x="14" y="8" width="36" height="48" rx="2" stroke="currentColor" strokeWidth="2" />
        <line x1="20" y1="20" x2="44" y2="20" stroke="currentColor" strokeWidth="1.5" />
        <line x1="20" y1="28" x2="44" y2="28" stroke="currentColor" strokeWidth="1.5" />
        <line x1="20" y1="36" x2="32" y2="36" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="42" cy="36" r="6" stroke="#bfd852" strokeWidth="2" />
        <path d="M39 36L42 39L46 33" stroke="#bfd852" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "categorize",
    tag: "Auto-Categorize",
    title: "Intelligent Expense Categorization",
    desc: "AI automatically assigns each expense to the right category — food, travel, supplies, utilities — based on the merchant and context. Correction is one click, and the model learns from it.",
    highlights: [
      "Pre-built standard expense categories",
      "Custom category creation per organization",
      "AI learns from your manual corrections",
      "Bulk re-categorization for existing expenses",
      "Category-level budget tracking",
    ],
    icon: (
      <svg viewBox="0 0 64 64" fill="none" className="w-14 h-14">
        <rect x="8" y="8" width="20" height="20" rx="3" stroke="currentColor" strokeWidth="2" />
        <rect x="36" y="8" width="20" height="20" rx="3" stroke="currentColor" strokeWidth="2" />
        <rect x="8" y="36" width="20" height="20" rx="3" stroke="currentColor" strokeWidth="2" />
        <rect x="36" y="36" width="20" height="20" rx="3" stroke="#bfd852" strokeWidth="2" />
        <path d="M46 42 L46 50 M42 46 L50 46" stroke="#bfd852" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "analytics",
    tag: "Analytics",
    title: "Real-Time Financial Dashboard",
    desc: "Visualize your spending in real time. Filter by team member, category, or date range. Set monthly budgets, track actuals, and export any report in seconds.",
    highlights: [
      "Interactive bar and pie charts",
      "Monthly trend comparison",
      "Budget vs. actual tracking",
      "Top merchants and categories",
      "Export to PDF or Excel",
    ],
    icon: (
      <svg viewBox="0 0 64 64" fill="none" className="w-14 h-14">
        <rect x="8" y="36" width="10" height="20" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="22" y="24" width="10" height="32" rx="1" fill="#bfd852" fillOpacity="0.4" stroke="#bfd852" strokeWidth="1.5" />
        <rect x="36" y="16" width="10" height="40" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="50" y="28" width="6" height="28" rx="1" fill="#bfd852" fillOpacity="0.3" stroke="#bfd852" strokeWidth="1" />
        <line x1="8" y1="57" x2="56" y2="57" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.4" />
      </svg>
    ),
  },
  {
    id: "team",
    tag: "Team Management",
    title: "Multi-User Organization Management",
    desc: "Create an organization, invite teammates, assign roles, and track expenses across your entire team. Every member gets their own expense view while admins see everything.",
    highlights: [
      "Unlimited team members per organization",
      "Admin and member role separation",
      "Per-member expense filtering",
      "Organization-level analytics",
      "Audit trail for all expense actions",
    ],
    icon: (
      <svg viewBox="0 0 64 64" fill="none" className="w-14 h-14">
        <circle cx="22" cy="20" r="8" stroke="currentColor" strokeWidth="2" />
        <circle cx="42" cy="20" r="8" stroke="currentColor" strokeWidth="2" />
        <path d="M4 52 C4 38 20 30 32 30 C44 30 60 38 60 52" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M38 35 L42 39 L50 31" stroke="#bfd852" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function FeaturesPage() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from(".feat-detail-item", {
        scrollTrigger: { trigger: ref.current, start: "top 75%" },
        y: 40,
        opacity: 0,
        stagger: 0.15,
        duration: 0.8,
        ease: "power2.out",
      });
    },
    { scope: ref }
  );

  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section
          style={{
            backgroundColor: "var(--el-primary)",
            paddingTop: 120,
            paddingBottom: 80,
            paddingLeft: 24,
            paddingRight: 24,
          }}
        >
          <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
            <p
              style={{
                color: "var(--el-accent)",
                fontWeight: 900,
                fontSize: 12,
                textTransform: "uppercase",
                letterSpacing: 3,
                marginBottom: 16,
              }}
            >
              Platform Features
            </p>
            <h1
              style={{
                color: "var(--el-white)",
                fontSize: "clamp(32px, 5vw, 60px)",
                fontWeight: 700,
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
                marginBottom: 20,
              }}
            >
              Everything your team needs to manage expenses.
            </h1>
            <p
              style={{
                color: "rgba(255,255,255,0.65)",
                fontSize: 18,
                lineHeight: 1.6,
                maxWidth: 600,
                margin: "0 auto 40px",
              }}
            >
              From AI receipt scanning to real-time dashboards, ExpenseLens gives your
              team complete financial visibility — automatically.
            </p>
            <Link href="/login" className="btn-el-white">
              Get Started Free
            </Link>
          </div>
        </section>

        {/* Feature Detail Sections */}
        <section
          ref={ref}
          style={{ backgroundColor: "#f7f7f5", padding: "80px 24px" }}
        >
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            {features.map((feat, i) => (
              <div
                id={feat.id}
                key={feat.id}
                className="feat-detail-item"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "48px 64px",
                  alignItems: "center",
                  padding: "64px 0",
                  borderTop: i === 0 ? "none" : "1px solid rgba(2,44,34,0.1)",
                  ...(i % 2 !== 0 ? { direction: "rtl" } : {}),
                }}
              >
                <div style={{ direction: "ltr" }}>
                  {/* Tag */}
                  <div
                    style={{
                      display: "inline-block",
                      backgroundColor: "var(--el-accent)",
                      color: "var(--el-primary)",
                      fontWeight: 900,
                      fontSize: 11,
                      textTransform: "uppercase",
                      letterSpacing: 2,
                      padding: "4px 10px",
                      marginBottom: 16,
                    }}
                  >
                    {feat.tag}
                  </div>
                  <h2
                    style={{
                      color: "var(--el-primary)",
                      fontSize: "clamp(24px, 3vw, 36px)",
                      fontWeight: 700,
                      lineHeight: 1.2,
                      letterSpacing: "-0.02em",
                      marginBottom: 16,
                    }}
                  >
                    {feat.title}
                  </h2>
                  <p
                    style={{
                      color: "rgba(2,44,34,0.7)",
                      fontSize: 17,
                      lineHeight: 1.65,
                      marginBottom: 24,
                    }}
                  >
                    {feat.desc}
                  </p>

                  {/* Highlights */}
                  <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {feat.highlights.map((h) => (
                      <li
                        key={h}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          marginBottom: 10,
                          color: "var(--el-primary)",
                          fontSize: 15,
                        }}
                      >
                        <span
                          style={{
                            width: 20,
                            height: 20,
                            backgroundColor: "var(--el-accent)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
                            <path d="M2 6L5 9L10 3" stroke="#022c22" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                        </span>
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Visual box */}
                <div style={{ direction: "ltr" }}>
                  <div
                    style={{
                      backgroundColor: "var(--el-primary)",
                      padding: 48,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minHeight: 280,
                      color: "var(--el-white)",
                      border: "1px solid rgba(191,216,82,0.2)",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    {/* Grid bg decoration */}
                    <div
                      className="el-grid-bg absolute inset-0 opacity-30"
                    />
                    <div className="relative z-10 flex flex-col items-center gap-4">
                      {feat.icon}
                      <span
                        style={{
                          color: "var(--el-accent)",
                          fontWeight: 900,
                          fontSize: 12,
                          textTransform: "uppercase",
                          letterSpacing: 2,
                        }}
                      >
                        {feat.tag}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section
          style={{
            backgroundColor: "var(--el-primary)",
            padding: "80px 24px",
            textAlign: "center",
          }}
        >
          <p style={{ color: "var(--el-accent)", fontWeight: 900, fontSize: 12, textTransform: "uppercase", letterSpacing: 3, marginBottom: 16 }}>
            Ready to get started?
          </p>
          <h2
            style={{
              color: "var(--el-white)",
              fontSize: "clamp(24px, 4vw, 48px)",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              marginBottom: 32,
            }}
          >
            Start using ExpenseLens for free.
          </h2>
          <Link href="/login" className="btn-el-white">
            Create Your Account
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
