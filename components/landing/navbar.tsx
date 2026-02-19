"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const navLinks = [
  { label: "Features", href: "/features" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "FAQ", href: "#faq" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* =====================
          MOBILE HEADER (≤1023px) — Dark green bg, centered logo
          ===================== */}
      <header
        className="lg:hidden fixed top-0 inset-x-0 z-50 border-b"
        style={{
          backgroundColor: "var(--el-primary)",
          borderBottomColor: "rgba(255,255,255,0.15)",
        }}
      >
        <div className="flex items-center justify-between px-5 py-3">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span
              className="text-2xl font-bold tracking-tight"
              style={{ color: "var(--el-white)" }}
            >
              Expense
            </span>
            <span
              className="flex items-center justify-center px-1.5 py-0.5 text-xs font-black tracking-widest uppercase"
              style={{
                backgroundColor: "var(--el-accent)",
                color: "var(--el-primary)",
              }}
            >
              Lens
            </span>
          </Link>

          {/* CTA - Hidden on mobile header to prevent overflow */}
          {/* <Link href="/login" className="btn-el-accent text-xs py-2 px-4">
            Get Started
          </Link> */}

          {/* Hamburger */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="ml-3 flex flex-col gap-1.5 p-2"
          >
            <span className="block h-0.5 w-5 rounded" style={{ backgroundColor: "var(--el-accent)" }} />
            <span className="block h-0.5 w-5 rounded" style={{ backgroundColor: "var(--el-accent)" }} />
            <span className="block h-0.5 w-5 rounded" style={{ backgroundColor: "var(--el-accent)" }} />
          </button>
        </div>

        {/* Mobile offcanvas nav */}
        {mobileOpen && (
          <nav
            className="flex flex-col gap-4 px-5 py-6 border-t"
            style={{
              backgroundColor: "#010f0b",
              borderTopColor: "rgba(255,255,255,0.1)",
            }}
          >
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-2xl font-normal hover:opacity-70 transition-opacity"
                style={{ color: "var(--el-white)" }}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/login"
              className="text-2xl font-semibold"
              style={{ color: "var(--el-accent)" }}
              onClick={() => setMobileOpen(false)}
            >
              Sign In
            </Link>
            <Link
              href="/login"
              className="text-2xl font-bold mt-2"
              style={{ color: "var(--el-accent)" }}
              onClick={() => setMobileOpen(false)}
            >
              Get Started →
            </Link>
          </nav>
        )}
      </header>

      {/* =====================
          DESKTOP HEADER (≥1024px)
          White background panel with black UPPERCASE links
          ===================== */}
      <header
        className="hidden lg:block fixed top-0 inset-x-0 z-50 transition-shadow duration-300"
        style={{
          backgroundColor: "var(--el-white)",
          boxShadow: scrolled ? "0 2px 10px 0 rgba(0,0,0,0.10)" : "none",
        }}
      >
        <div
          className="flex items-center justify-between px-6"
          style={{ height: 60 }}
        >
          {/* Logo in its own dark green box */}
          <Link
            href="/"
            className="flex items-center justify-center gap-2 h-full px-5"
            style={{
              backgroundColor: "var(--el-primary)",
              minWidth: 160,
              height: "100%",
            }}
          >
            <span
              className="text-xl font-bold tracking-tight"
              style={{ color: "var(--el-white)" }}
            >
              Expense
            </span>
            <span
              className="flex items-center px-1.5 py-0.5 text-xs font-black tracking-widest uppercase"
              style={{
                backgroundColor: "var(--el-accent)",
                color: "var(--el-primary)",
              }}
            >
              Lens
            </span>
          </Link>

          {/* Nav links */}
          <nav className="flex items-center gap-8 px-8 flex-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-xs font-bold uppercase tracking-wider hover:underline transition-all"
                style={{
                  color: "var(--el-black)",
                  letterSpacing: "1px",
                  textDecorationColor: "var(--el-accent)",
                  textUnderlineOffset: "4px",
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA */}
          <Link href="/login" className="btn-el-accent h-full flex items-center px-6">
            Get Started Free
          </Link>
        </div>
      </header>
    </>
  );
}
