"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Link from "next/link";

gsap.registerPlugin(ScrollTrigger);

const aiFeatures = [
  "AI reads receipts in any format (JPG, PNG, PDF)",
  "Extracts merchant name, amount, date, tax, and line items",
  "Maps expenses to standard categories automatically",
  "Learns from your corrections for better accuracy over time",
  "Generates spending summaries and anomaly alerts",
];

const notFor = [
  "Manual data entry — AI does that for you",
  "Spreadsheet juggling — dashboards replace them",
  "Missed receipts — scan and forget",
];

export default function AIFeature() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from(".ai-heading", {
        scrollTrigger: { trigger: ref.current, start: "top 75%" },
        y: 30,
        opacity: 0,
        duration: 0.8,
      });
      gsap.from(".ai-item", {
        scrollTrigger: { trigger: ".ai-lists", start: "top 80%" },
        y: 20,
        opacity: 0,
        stagger: 0.07,
        duration: 0.5,
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
        borderTop: "1px solid rgba(191,216,82,0.15)",
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
          Is ExpenseLens right for you?
        </p>

        {/* Heading */}
        <h2
          className="ai-heading"
          style={{
            color: "var(--el-white)",
            fontSize: "clamp(28px, 4vw, 48px)",
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            maxWidth: 640,
            marginBottom: 48,
          }}
        >
          ExpenseLens works best for teams ready to ditch manual expense tracking.
        </h2>

        {/* Two column layout */}
        <div
          className="ai-lists"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0 48px",
          }}
        >
          {/* Left: What AI does */}
          <div>
            <h3
              style={{
                color: "var(--el-accent)",
                fontWeight: 700,
                fontSize: 15,
                textTransform: "uppercase",
                letterSpacing: 1.5,
                marginBottom: 20,
              }}
            >
              ExpenseLens is for you if you...
            </h3>
            {aiFeatures.map((item) => (
              <div
                key={item}
                className="ai-item"
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  marginBottom: 16,
                }}
              >
                <span
                  style={{
                    width: 22,
                    height: 22,
                    flexShrink: 0,
                    backgroundColor: "var(--el-accent)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
                    <path d="M2 6L5 9L10 3" stroke="#022c22" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </span>
                <span style={{ color: "var(--el-white)", fontSize: 16, lineHeight: 1.5 }}>
                  {item}
                </span>
              </div>
            ))}
          </div>

          {/* Right: What it replaces */}
          <div>
            <h3
              style={{
                color: "rgba(255,255,255,0.45)",
                fontWeight: 700,
                fontSize: 15,
                textTransform: "uppercase",
                letterSpacing: 1.5,
                marginBottom: 20,
              }}
            >
              Say goodbye to...
            </h3>
            {notFor.map((item) => (
              <div
                key={item}
                className="ai-item"
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  marginBottom: 16,
                }}
              >
                <span
                  style={{
                    width: 22,
                    height: 22,
                    flexShrink: 0,
                    border: "1px solid rgba(255,255,255,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
                    <path d="M3 3L9 9M9 3L3 9" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </span>
                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 16, lineHeight: 1.5 }}>
                  {item}
                </span>
              </div>
            ))}


          </div>
        </div>

        {/* CTA */}
        <div style={{ marginTop: 56 }}>
          <Link href="/login" className="btn-el-white">
            Start Free Today
          </Link>
        </div>
      </div>
    </section>
  );
}
