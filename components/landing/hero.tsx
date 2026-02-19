"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Link from "next/link";

export default function Hero() {
  const containerRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Interactive grid cells (cloned from Visify.au mousemove grid)
  useEffect(() => {
    const hero = containerRef.current;
    const container = gridRef.current;
    if (!hero || !container) return;

    const CELL = 60;

    const buildGrid = () => {
      container.innerHTML = "";
      const rect = hero.getBoundingClientRect();
      const cols = Math.ceil(rect.width / CELL);
      const rows = Math.ceil(rect.height / CELL);
      container.style.gridTemplateColumns = `repeat(${cols}, ${CELL}px)`;
      container.style.gridTemplateRows = `repeat(${rows}, ${CELL}px)`;

      const frag = document.createDocumentFragment();
      for (let i = 0; i < rows * cols; i++) {
        const cell = document.createElement("div");
        cell.className = "el-grid-cell";
        frag.appendChild(cell);
      }
      container.appendChild(frag);
    };

    buildGrid();
    const ro = new ResizeObserver(buildGrid);
    ro.observe(hero);

    const onMouseMove = (e: MouseEvent) => {
      const rect = hero.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const cols = Math.ceil(rect.width / CELL);
      const row = Math.floor(mouseY / CELL);
      const col = Math.floor(mouseX / CELL);
      const index = row * cols + col;
      const cells = container.querySelectorAll<HTMLDivElement>(".el-grid-cell");
      if (index < 0 || index >= cells.length) return;
      const cell = cells[index] as HTMLDivElement & { fadeTimeout?: ReturnType<typeof setTimeout> };
      clearTimeout(cell.fadeTimeout);
      cell.style.backgroundColor = "rgba(191,216,82,0.12)";
      cell.fadeTimeout = setTimeout(() => {
        cell.style.backgroundColor = "transparent";
      }, 300);
    };

    hero.addEventListener("mousemove", onMouseMove);
    return () => {
      ro.disconnect();
      hero.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  // GSAP text animations
  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
      tl.fromTo(
        ".hero-heading",
        { y: "110%", opacity: 0 },
        { y: "0%", opacity: 1, duration: 1.1 }
      )
        .fromTo(
          ".hero-sub",
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.7 },
          "-=0.5"
        )
        .fromTo(
          ".hero-btn",
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.5 },
          "-=0.4"
        )
        .fromTo(
          ".hero-visual",
          { opacity: 0, x: 30 },
          { opacity: 1, x: 0, duration: 1.0 },
          "<"
        );
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden"
      style={{
        backgroundColor: "var(--el-primary)",
        paddingTop: 60,
        minHeight: "88vh",
      }}
    >
      {/* Mousemove grid overlay */}
      <div
        ref={gridRef}
        className="absolute inset-0 pointer-events-none z-0"
        style={{ display: "grid" }}
      />

      {/* Content */}
      <div
        className="relative z-10 mx-auto px-5 lg:px-14 py-14 flex flex-col lg:flex-row items-end gap-8"
        style={{ maxWidth: 1300 }}
      >
        {/* Left: Bordered text box */}
        <div
          className="hero-text-box flex-1 flex flex-col justify-between"
          style={{
            border: "1px solid rgba(191,216,82,0.3)",
            padding: 30,
            minHeight: 380,
            backgroundColor: "var(--el-primary)",
          }}
        >
          {/* AI badge */}
          <div
            className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 self-start"
            style={{
              border: "1px solid rgba(191,216,82,0.4)",
              backgroundColor: "rgba(191,216,82,0.08)",
            }}
          >
            <span style={{ color: "var(--el-accent)", fontSize: 11, fontWeight: 900, letterSpacing: 2, textTransform: "uppercase" }}>
              ✦ Powered by Gemini AI
            </span>
          </div>

          {/* Headline */}
          <div className="overflow-hidden mb-8">
            <h1
              className="hero-heading font-bold leading-tight"
              style={{
                fontSize: "clamp(36px, 6vw, 72px)",
                letterSpacing: "-0.02em",
                color: "var(--el-white)",
                lineHeight: 1.08,
              }}
            >
              ExpenseLens brings{" "}
              <span style={{ color: "var(--el-accent)" }}>financial clarity</span>{" "}
              through AI.
            </h1>
          </div>

          {/* Bottom of text box: subheading + CTAs */}
          <div className="flex flex-col lg:flex-row items-start lg:items-end gap-6">
            <p
              className="hero-sub flex-1"
              style={{
                fontSize: "clamp(16px, 1.8vw, 20px)",
                color: "var(--el-white)",
                opacity: 0.85,
                lineHeight: 1.4,
                maxWidth: 420,
              }}
            >
              Stop flying blind — scan receipts, auto-categorize expenses, and get
              data-backed insights to grow with confidence.
            </p>

            <div className="hero-btn flex gap-3 flex-wrap">
              <Link href="/login" className="btn-el-white whitespace-nowrap">
                Get Started Free
              </Link>
              <Link href="/how-it-works" className="btn-el-outline whitespace-nowrap">
                See How It Works
              </Link>
            </div>
          </div>
        </div>

        {/* Right: Hero illustration */}
        <div
          className="hero-visual flex-1 flex items-center justify-center"
          style={{ minHeight: 360 }}
        >
          <img
            src="/hero.png"
            alt="ExpenseLens Dashboard Preview"
            className="w-full h-auto object-contain"
            style={{
              maxWidth: 580,
              filter: "drop-shadow(0 24px 48px rgba(0,0,0,0.35))",
            }}
          />
        </div>
      </div>

      {/* Stats bar */}
      <div
        className="relative z-10"
        style={{
          borderTop: "1px solid rgba(191,216,82,0.2)",
          backgroundColor: "rgba(0,0,0,0.2)",
        }}
      >
        <div
          className="mx-auto px-5 lg:px-14 py-4 flex flex-wrap items-center gap-8 lg:gap-16"
          style={{ maxWidth: 1300 }}
        >
          {[
            { value: "AI Powered", label: "Gemini-based OCR" },
            { value: "Realtime", label: "Analytics dashboard" },
            { value: "Multi-org", label: "Team management" },
            { value: "Secure", label: "Supabase backend" },
          ].map((stat) => (
            <div key={stat.label} className="flex items-center gap-3">
              <span
                style={{
                  color: "var(--el-accent)",
                  fontWeight: 800,
                  fontSize: 15,
                  letterSpacing: "-0.01em",
                }}
              >
                {stat.value}
              </span>
              <span
                style={{
                  color: "rgba(255,255,255,0.45)",
                  fontSize: 13,
                  lineHeight: 1.3,
                }}
              >
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
