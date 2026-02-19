"use client";

import Link from "next/link";
import Navbar from "@/components/landing/navbar";
import Footer from "@/components/landing/footer";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    num: "01",
    title: "Create Your Account",
    time: "2 minutes",
    desc: "Sign up with your email or Google account. No credit card required. Your account is secured immediately with Supabase Auth.",
    detail: "ExpenseLens uses secure OAuth 2.0 and magic link authentication. Your credentials are never stored in plaintext and all sessions are automatically managed.",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
        <circle cx="24" cy="16" r="8" stroke="currentColor" strokeWidth="2" />
        <path d="M8 40 C8 30 16 24 24 24 C32 24 40 30 40 40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M36 8 L38 10 L43 5" stroke="#bfd852" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    num: "02",
    title: "Set Up Your Organization",
    time: "3 minutes",
    desc: "Create your organization and invite team members by email. Assign admin or member roles. Each org has its own isolated expense ledger.",
    detail: "Organizations in ExpenseLens function like workspaces. Admins have full visibility and control. Members can submit and view their own expenses. All data is strictly row-level isolated by org.",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
        <rect x="6" y="18" width="36" height="24" rx="2" stroke="currentColor" strokeWidth="2" />
        <path d="M16 18 L16 12 C16 8 32 8 32 12 L32 18" stroke="currentColor" strokeWidth="2" />
        <circle cx="24" cy="28" r="4" stroke="#bfd852" strokeWidth="2" />
        <path d="M21 31 L24 34 L27 31" stroke="#bfd852" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    num: "03",
    title: "Upload Your First Receipt",
    time: "30 seconds",
    desc: "Drag and drop a receipt image or click to upload. ExpenseLens accepts JPG, PNG, and PDF. The file is sent immediately to the AI pipeline.",
    detail: "Receipt files are securely stored in Supabase Storage with unique per-org bucket isolation. The AI extraction runs on Google Cloud via the Gemini API, returning structured data within seconds.",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
        <rect x="10" y="6" width="28" height="36" rx="2" stroke="currentColor" strokeWidth="2" />
        <path d="M18 24 L24 18 L30 24" stroke="#bfd852" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="24" y1="18" x2="24" y2="32" stroke="#bfd852" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    num: "04",
    title: "AI Extracts & Categorizes",
    time: "< 5 seconds",
    desc: "Gemini Vision reads your receipt and extracts: merchant name, date, total amount, line items by name and price, and applicable taxes.",
    detail: "The AI uses a structured output prompt that maps extracted fields to the ExpenseLens expense schema. Categories are determined by merchant type and transaction context. If the AI is unsure, it flags the expense for your review.",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
        <path d="M24 6 L27 18 L39 21 L27 24 L24 36 L21 24 L9 21 L21 18 Z" stroke="currentColor" strokeWidth="1.5" fill="rgba(191,216,82,0.15)" />
        <circle cx="38" cy="10" r="3" stroke="#bfd852" strokeWidth="1.5" />
        <circle cx="10" cy="36" r="2" stroke="white" strokeWidth="1" strokeOpacity="0.4" />
      </svg>
    ),
  },
  {
    num: "05",
    title: "Review & Approve",
    time: "1 click",
    desc: "Review the extracted data in a clean form view. Edit any field if needed, confirm the category, and submit. Admins can approve team submissions.",
    detail: "All expenses go through a review state before becoming final. This gives your team control over data quality while still eliminating 95% of manual work. Bulk-approve multiple expenses at once.",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
        <rect x="8" y="8" width="32" height="32" rx="2" stroke="currentColor" strokeWidth="2" />
        <path d="M16 24 L21 29 L32 18" stroke="#bfd852" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    num: "06",
    title: "Analyze & Export",
    time: "Ongoing",
    desc: "View real-time analytics, spending by category, monthly benchmarks, and team breakdowns. Export any report as PDF or Excel for accounting.",
    detail: "The analytics dashboard updates in real time as expenses are approved. Budget thresholds trigger alerts when you're approaching limits. All exports are formatted for standard accounting software compatibility.",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
        <rect x="6" y="28" width="8" height="14" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="16" y="18" width="8" height="24" rx="1" fill="#bfd852" fillOpacity="0.4" stroke="#bfd852" strokeWidth="1.5" />
        <rect x="26" y="10" width="8" height="32" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="36" y="20" width="6" height="22" rx="1" fill="#bfd852" fillOpacity="0.3" stroke="#bfd852" strokeWidth="1" />
        <line x1="6" y1="43" x2="42" y2="43" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.4" />
        <path d="M34 5 L36 7 L40 3" stroke="#bfd852" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="36" y1="5" x2="36" y2="10" stroke="#bfd852" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function HowItWorksPage() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from(".hiw-detail-step", {
        scrollTrigger: { trigger: ref.current, start: "top 70%" },
        y: 40,
        opacity: 0,
        stagger: 0.1,
        duration: 0.7,
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
          <div style={{ maxWidth: 860, margin: "0 auto" }}>
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
              User Flow
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
              From zero to automated expense tracking — in 10 minutes.
            </h1>
            <p
              style={{
                color: "rgba(255,255,255,0.65)",
                fontSize: 18,
                lineHeight: 1.6,
                maxWidth: 620,
                marginBottom: 40,
              }}
            >
              Here's exactly how ExpenseLens works — step by step — from signing up
              to having your first AI-categorized expense report.
            </p>
            <Link href="/login" className="btn-el-white">
              Start Now — It&apos;s Free
            </Link>
          </div>
        </section>

        {/* Steps */}
        <section ref={ref} style={{ backgroundColor: "#f7f7f5", padding: "80px 24px" }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            {steps.map((step, i) => (
              <div
                key={step.num}
                className="hiw-detail-step"
                style={{
                  display: "grid",
                  gridTemplateColumns: "80px 1fr",
                  gap: "0 32px",
                  paddingBottom: 56,
                  marginBottom: 0,
                  position: "relative",
                }}
              >
                {/* Left: number + connector line */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      backgroundColor: "var(--el-primary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      color: "var(--el-white)",
                    }}
                  >
                    {step.icon}
                  </div>
                  {i < steps.length - 1 && (
                    <div
                      style={{
                        width: 2,
                        flex: 1,
                        minHeight: 40,
                        backgroundColor: "rgba(191,216,82,0.3)",
                        margin: "8px 0",
                      }}
                    />
                  )}
                </div>

                {/* Right: content */}
                <div style={{ paddingBottom: 8 }}>
                  {/* Step header */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      marginBottom: 8,
                    }}
                  >
                    <span
                      style={{
                        color: "var(--el-accent)",
                        fontWeight: 900,
                        fontSize: 13,
                        letterSpacing: 1,
                        opacity: 0.7,
                      }}
                    >
                      STEP {step.num}
                    </span>
                    <span
                      style={{
                        backgroundColor: "rgba(191,216,82,0.15)",
                        color: "var(--el-primary)",
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "2px 8px",
                        textTransform: "uppercase",
                        letterSpacing: 1,
                        border: "1px solid rgba(191,216,82,0.4)",
                      }}
                    >
                      ⏱ {step.time}
                    </span>
                  </div>

                  <h2
                    style={{
                      color: "var(--el-primary)",
                      fontSize: 22,
                      fontWeight: 700,
                      marginBottom: 10,
                      lineHeight: 1.3,
                    }}
                  >
                    {step.title}
                  </h2>
                  <p
                    style={{
                      color: "rgba(2,44,34,0.75)",
                      fontSize: 16,
                      lineHeight: 1.65,
                      marginBottom: 12,
                    }}
                  >
                    {step.desc}
                  </p>

                  {/* Technical detail */}
                  <div
                    style={{
                      borderLeft: "3px solid var(--el-accent)",
                      paddingLeft: 16,
                      backgroundColor: "rgba(191,216,82,0.05)",
                      padding: "12px 16px",
                    }}
                  >
                    <p
                      style={{
                        color: "rgba(2,44,34,0.6)",
                        fontSize: 14,
                        lineHeight: 1.6,
                        fontStyle: "italic",
                      }}
                    >
                      {step.detail}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* AI Deep Dive */}
        <section
          style={{
            backgroundColor: "var(--el-primary)",
            padding: "80px 24px",
          }}
        >
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
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
              AI Implementation
            </p>
            <h2
              style={{
                color: "var(--el-white)",
                fontSize: "clamp(24px, 3.5vw, 40px)",
                fontWeight: 700,
                lineHeight: 1.2,
                letterSpacing: "-0.02em",
                marginBottom: 32,
              }}
            >
              How Gemini AI powers the expense pipeline
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: 1,
                border: "1px solid rgba(191,216,82,0.2)",
              }}
            >
              {[
                {
                  label: "Vision OCR",
                  desc: "Gemini 1.5 Pro Vision processes receipt images, identifying text regions and structured fields using multimodal understanding.",
                },
                {
                  label: "Structured Extraction",
                  desc: "AI output is constrained to a JSON schema — merchant, amount, date, items — ensuring clean data that maps directly to the database.",
                },
                {
                  label: "Category Inference",
                  desc: "Merchant name, description, and amount context are used to infer the most appropriate expense category from a predefined taxonomy.",
                },
                {
                  label: "Confidence Scoring",
                  desc: "Each extracted field carries a confidence score. Low-confidence fields are flagged for human review instead of silently failing.",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    padding: "28px 24px",
                    borderRight: "1px solid rgba(191,216,82,0.15)",
                    borderBottom: "1px solid rgba(191,216,82,0.15)",
                  }}
                >
                  <div
                    style={{
                      color: "var(--el-accent)",
                      fontWeight: 800,
                      fontSize: 13,
                      textTransform: "uppercase",
                      letterSpacing: 1.5,
                      marginBottom: 10,
                    }}
                  >
                    {item.label}
                  </div>
                  <p
                    style={{
                      color: "rgba(255,255,255,0.6)",
                      fontSize: 14,
                      lineHeight: 1.6,
                    }}
                  >
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 48 }}>
              <Link href="/login" className="btn-el-white">
                Try It Free
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
