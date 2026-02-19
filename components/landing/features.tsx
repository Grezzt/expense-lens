"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Link from "next/link";

gsap.registerPlugin(ScrollTrigger);

const cards = [
  {
    id: "ocr",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8">
        <rect x="7" y="4" width="18" height="24" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <line x1="10" y1="10" x2="22" y2="10" stroke="currentColor" strokeWidth="1" />
        <line x1="10" y1="14" x2="22" y2="14" stroke="currentColor" strokeWidth="1" />
        <line x1="10" y1="18" x2="16" y2="18" stroke="currentColor" strokeWidth="1" />
        <circle cx="21" cy="19" r="3" stroke="#bfd852" strokeWidth="1.5" />
        <path d="M19.5 19L21 20.5L23 18" stroke="#bfd852" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
    period: "Smart OCR",
    tagline: "Scan receipts instantly.",
    blurb: "AI reads your receipts — amounts, merchants, dates — extracted in seconds with Gemini Vision.",
    cta: "Learn about OCR",
    href: "/features#ocr",
    borderRight: false,
  },
  {
    id: "categorize",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8">
        <rect x="4" y="4" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="18" y="4" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="4" y="18" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M23 18 L23 22 M21 20 L25 20" stroke="#bfd852" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="23" cy="23" r="4" stroke="#bfd852" strokeWidth="1.2" />
      </svg>
    ),
    period: "Auto-Categorize",
    tagline: "Know where money goes.",
    blurb: "AI assigns spending categories automatically. Teach it once, it learns your patterns forever.",
    cta: "See categorization",
    href: "/features#categorize",
    borderRight: false,
  },
  {
    id: "analytics",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8">
        <rect x="4" y="18" width="5" height="10" rx="0.5" stroke="currentColor" strokeWidth="1.2" />
        <rect x="11" y="12" width="5" height="16" rx="0.5" fill="#bfd852" fillOpacity="0.5" stroke="#bfd852" strokeWidth="1.2" />
        <rect x="18" y="8" width="5" height="20" rx="0.5" stroke="currentColor" strokeWidth="1.2" />
        <rect x="25" y="14" width="3" height="14" rx="0.5" fill="#bfd852" fillOpacity="0.3" stroke="#bfd852" strokeWidth="1" />
        <line x1="4" y1="29" x2="28" y2="29" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4" />
      </svg>
    ),
    period: "Analytics",
    tagline: "Data-driven decisions.",
    blurb: "Real-time dashboards, budget tracking, monthly trends, and exportable reports — all in one place.",
    cta: "Explore analytics",
    href: "/features#analytics",
    borderRight: true,
  },
];

export default function Features() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from(".feat-label", {
        scrollTrigger: { trigger: sectionRef.current, start: "top 80%" },
        y: 20,
        opacity: 0,
        duration: 0.6,
      });
      gsap.from(".feat-heading", {
        scrollTrigger: { trigger: sectionRef.current, start: "top 75%" },
        y: 30,
        opacity: 0,
        duration: 0.8,
      });
      gsap.from(".feat-hc-wrapper", {
        scrollTrigger: { trigger: ".feat-cards", start: "top 85%" },
        y: 40,
        opacity: 0,
        stagger: 0.12,
        duration: 0.7,
        ease: "power2.out",
      });
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="el-has-texture" style={{ padding: "100px 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        {/* Label */}
        <p className="feat-label el-callout-text mb-4">
          Built for modern finance teams
        </p>

        {/* Heading */}
        <div className="mb-14" style={{ maxWidth: 720 }}>
          <h2
            className="feat-heading font-bold"
            style={{
              color: "var(--el-primary)",
              fontSize: "clamp(28px, 4vw, 48px)",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}
          >
            Clarity today. Insight from AI. Growth with confidence.
          </h2>
          <p
            className="mt-4"
            style={{
              color: "var(--el-primary)",
              opacity: 0.7,
              fontSize: 17,
              lineHeight: 1.5,
              maxWidth: 600,
            }}
          >
            ExpenseLens makes expense management effortless. Our three-pillar system — Scan, Categorize, Analyze — gives
            your team complete financial visibility without the manual work.
          </p>
          <Link
            href="/features"
            className="mt-6 inline-flex items-center gap-2 font-semibold"
            style={{
              color: "var(--el-primary)",
              borderBottom: "2px solid var(--el-primary)",
              paddingBottom: 2,
              fontSize: 15,
              textDecoration: "none",
            }}
          >
            Explore all features <span>→</span>
          </Link>
        </div>

        {/* Cards grid */}
        <div
          className="feat-cards"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gridGap: 0,
          }}
        >
          {cards.map((card) => (
            <div
              key={card.id}
              className="feat-hc-wrapper el-hover-card-wrapper"
              style={
                card.borderRight
                  ? { borderRight: "1.5px solid var(--el-primary)" }
                  : { borderRight: "none" }
              }
            >
              <div className="el-hover-card">
                {/* Icon */}
                <div
                  className="mb-4 el-hover-card-icon"
                  style={{ color: "var(--el-primary)" }}
                >
                  {card.icon}
                </div>

                {/* Content */}
                <div style={{ rowGap: 6 }}>
                  <h2
                    className="el-hover-card-heading font-bold"
                    style={{ fontSize: 22 }}
                  >
                    {card.period}
                  </h2>
                  <div
                    className="el-hover-card-heading font-semibold"
                    style={{ fontSize: 16 }}
                  >
                    {card.tagline}
                  </div>
                  <div
                    className="el-hover-card-text"
                    style={{ fontSize: 14, color: "var(--el-primary)", opacity: 0.6, marginTop: 8 }}
                  >
                    {card.blurb}
                  </div>
                </div>

                {/* CTA */}
                <Link
                  href={card.href}
                  className="el-hover-card-btn font-semibold mt-6 inline-block"
                  style={{
                    fontSize: 14,
                    color: "var(--el-primary)",
                    borderBottom: "2px solid var(--el-primary)",
                    paddingBottom: 2,
                    textDecoration: "none",
                    transition: "all 0.2s",
                  }}
                >
                  {card.cta}
                </Link>
              </div>

              {/* Lime shadow offset on hover */}
              <div className="el-hover-card-shadow" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
