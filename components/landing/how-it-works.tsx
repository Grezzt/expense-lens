"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    num: "01",
    title: "Sign Up & Create Your Org",
    desc: "Register for free, then create or join your organization. Invite teammates and set spending roles — all in under 2 minutes.",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8">
        <circle cx="16" cy="10" r="5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M6 26 C6 20 26 20 26 26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M24 6 L26 8 L30 4" stroke="#bfd852" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    num: "02",
    title: "Upload or Scan Receipts",
    desc: "Drag-and-drop receipt images or PDFs, or snap a photo. Supports JPG, PNG, and PDF formats — ExpenseLens handles the rest.",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8">
        <rect x="7" y="4" width="18" height="24" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 16 L16 12 L20 16" stroke="#bfd852" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="16" y1="12" x2="16" y2="22" stroke="#bfd852" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    num: "03",
    title: "AI Extracts & Categorizes",
    desc: "Gemini AI reads your receipt — merchant, amount, date, taxes — and automatically assigns the correct expense category.",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8">
        <path d="M16 5 L18 13 L26 15 L18 17 L16 25 L14 17 L6 15 L14 13 Z" stroke="currentColor" strokeWidth="1.2" fill="rgba(191,216,82,0.2)" />
        <circle cx="25" cy="7" r="2" stroke="#bfd852" strokeWidth="1.2" />
      </svg>
    ),
  },
  {
    num: "04",
    title: "Review, Analyze & Export",
    desc: "View real-time dashboards, filter by category or date, set budgets, then export reports as PDF or Excel for your records.",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8">
        <rect x="4" y="18" width="5" height="10" rx="0.5" stroke="currentColor" strokeWidth="1.2" />
        <rect x="11" y="12" width="5" height="16" rx="0.5" fill="#bfd852" fillOpacity="0.5" stroke="#bfd852" strokeWidth="1.2" />
        <rect x="18" y="8" width="5" height="20" rx="0.5" stroke="currentColor" strokeWidth="1.2" />
        <line x1="4" y1="29" x2="28" y2="29" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4" />
        <path d="M23 4 L25 6 L27 4" stroke="#bfd852" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="25" y1="4" x2="25" y2="8" stroke="#bfd852" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function HowItWorks() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from(".hiw-heading", {
        scrollTrigger: { trigger: ref.current, start: "top 75%" },
        y: 30,
        opacity: 0,
        duration: 0.8,
      });
      gsap.from(".hiw-step", {
        scrollTrigger: { trigger: ".hiw-steps", start: "top 80%" },
        y: 30,
        opacity: 0,
        stagger: 0.12,
        duration: 0.6,
        ease: "power2.out",
      });

    },
    { scope: ref }
  );

  return (
    <section
      ref={ref}
      style={{
        backgroundColor: "var(--el-primary)",
        padding: "100px 0",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        {/* Label */}
        <p
          style={{
            color: "var(--el-accent)",
            fontWeight: 900,
            textTransform: "uppercase",
            letterSpacing: "2px",
            fontSize: 13,
            marginBottom: 12,
          }}
        >
          Simple from day one
        </p>

        {/* Heading */}
        <h2
          className="hiw-heading"
          style={{
            color: "var(--el-white)",
            fontSize: "clamp(28px, 4vw, 48px)",
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            maxWidth: 600,
            marginBottom: 64,
          }}
        >
          From receipt to report — in four easy steps.
        </h2>

        {/* Steps grid */}
        <div
          className="hiw-steps"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "0",
          }}
        >
          {steps.map((step, i) => (
            <div
              key={step.num}
              className="hiw-step"
              style={{
                borderLeft: i === 0 ? "none" : "1px solid rgba(191,216,82,0.15)",
                padding: "0 32px 0 32px",
                marginBottom: 0,
                ...(i === 0 ? { paddingLeft: 0 } : {}),
              }}
            >
              {/* Step number */}
              <div
                style={{
                  color: "var(--el-accent)",
                  fontWeight: 900,
                  fontSize: 40,
                  lineHeight: 1,
                  marginBottom: 20,
                  fontVariantNumeric: "tabular-nums",
                  letterSpacing: "-0.03em",
                  opacity: 0.5,
                }}
              >
                {step.num}
              </div>

              {/* Icon */}
              <div
                style={{
                  color: "var(--el-white)",
                  marginBottom: 16,
                  width: 48,
                  height: 48,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid rgba(191,216,82,0.3)",
                  backgroundColor: "rgba(191,216,82,0.05)",
                }}
              >
                {step.icon}
              </div>

              {/* Text */}
              <h3
                style={{
                  color: "var(--el-white)",
                  fontWeight: 700,
                  fontSize: 18,
                  marginBottom: 10,
                  lineHeight: 1.3,
                }}
              >
                {step.title}
              </h3>
              <p
                style={{
                  color: "rgba(255,255,255,0.55)",
                  fontSize: 15,
                  lineHeight: 1.6,
                }}
              >
                {step.desc}
              </p>
            </div>
          ))}
        </div>


      </div>
    </section>
  );
}
