"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

const faqs = [
  {
    q: "What is ExpenseLens?",
    a: "ExpenseLens is an AI-powered expense management platform designed for modern businesses and teams. It uses Google Gemini AI to automatically extract data from receipts, categorize expenses, and generate real-time analytics — so you spend less time on admin and more time on growth.",
  },
  {
    q: "How does AI receipt scanning work?",
    a: "When you upload a receipt image or PDF, Gemini Vision AI analyzes it and extracts key information: merchant name, total amount, date, tax, and individual line items. This data is automatically recorded in your expense ledger — no manual entry needed.",
  },
  {
    q: "What file formats does ExpenseLens support?",
    a: "We support JPG, PNG, and PDF receipt uploads. You can drag-and-drop files, upload directly, or use the mobile-friendly upload interface. The AI can handle both clear and slightly blurry receipt images.",
  },
  {
    q: "How does team/organization management work?",
    a: "After registering, you create or join an Organization. Each org has its own expense ledger, member roles, and analytics. You can invite teammates, assign spending limits, and review each member's expenses — making it ideal for teams of any size.",
  },
  {
    q: "Is my financial data secure?",
    a: "Absolutely. ExpenseLens is built on Supabase with row-level security, meaning your data is strictly isolated to your organization. All data is encrypted in transit and at rest. We never sell or share your financial data.",
  },
  {
    q: "What analytics does ExpenseLens provide?",
    a: "You get real-time spending dashboards, category breakdowns, budget vs. actual comparisons, monthly trends, and top merchants. You can filter by date range, category, or team member, and export any report as PDF or Excel.",
  },
  {
    q: "Is there a free tier?",
    a: "Yes! You can sign up for free and start tracking expenses immediately. Premium features for larger organizations with advanced analytics and AI capabilities are available on paid plans.",
  },
  {
    q: "How do I get started?",
    a: "Simply click 'Get Started Free', register with your email or Google account, create your organization, and upload your first receipt. The AI will handle extraction and categorization automatically — you'll be up and running in minutes.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from(".el-faq-item", {
        scrollTrigger: { trigger: sectionRef.current, start: "top 75%" },
        y: 20,
        opacity: 0,
        stagger: 0.06,
        duration: 0.5,
        ease: "power2.out",
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      id="faq"
      ref={sectionRef}
      style={{ backgroundColor: "var(--el-primary)", padding: "100px 0" }}
    >
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 24px" }}>
        {/* Label */}
        <p
          style={{
            color: "var(--el-accent)",
            fontWeight: 900,
            textTransform: "uppercase",
            letterSpacing: 2,
            fontSize: 13,
            marginBottom: 12,
          }}
        >
          Frequently asked questions
        </p>

        {/* Heading */}
        <h2
          style={{
            color: "var(--el-white)",
            fontSize: "clamp(26px, 3.5vw, 42px)",
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            marginBottom: 48,
          }}
        >
          Got questions? We&apos;ve got answers.
        </h2>

        {/* Accordion */}
        <div>
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="el-faq-item"
              style={{
                borderTop: "1px solid rgba(255,255,255,0.15)",
                ...(i === faqs.length - 1
                  ? { borderBottom: "1px solid rgba(255,255,255,0.15)" }
                  : {}),
              }}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "20px 0",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  gap: 16,
                }}
              >
                <span
                  style={{
                    color: open === i ? "var(--el-accent)" : "var(--el-white)",
                    fontSize: 17,
                    fontWeight: 600,
                    lineHeight: 1.3,
                    transition: "color 0.2s",
                  }}
                >
                  {faq.q}
                </span>
                {/* Toggle icon — lime box with + */}
                <span
                  style={{
                    flexShrink: 0,
                    width: 32,
                    height: 32,
                    backgroundColor: "var(--el-accent)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 22,
                    fontWeight: 300,
                    color: "var(--el-primary)",
                    lineHeight: 1,
                    transition: "transform 0.2s",
                    transform: open === i ? "rotate(45deg)" : "rotate(0deg)",
                  }}
                >
                  +
                </span>
              </button>

              {open === i && (
                <div
                  style={{
                    color: "rgba(255,255,255,0.7)",
                    fontSize: 16,
                    lineHeight: 1.65,
                    paddingBottom: 20,
                    maxWidth: 720,
                  }}
                >
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
