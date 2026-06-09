"use client";

import Link from "next/link";
import { useState } from "react";
import { Sparkles, Menu, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { label: "Features", href: "/#pricing" },
  { label: "Startups", href: "/startups" },
  { label: "Investors", href: "/investors" },
  { label: "Events", href: "/events" },
  { label: "Pricing", href: "/pricing" }
];

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <span className="grid size-9 place-items-center rounded-xl bg-primary text-white shadow-glow">
            <Sparkles size={18} />
          </span>
          <span className="font-bold tracking-tight text-ink text-lg">StartupVerse</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-xl px-4 py-2 text-sm font-medium text-muted transition hover:bg-surface hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/login">
            <Button variant="secondary" size="sm">Sign in</Button>
          </Link>
          <Link href="/signup">
            <Button size="sm" className="gap-1.5">
              Get started <ArrowRight size={14} />
            </Button>
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="grid size-9 place-items-center rounded-xl border border-border md:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="glass border-t border-border/60 md:hidden animate-slide-down">
          <nav className="flex flex-col gap-1 p-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-xl px-4 py-3 text-sm font-medium text-ink hover:bg-surface"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-3 flex gap-3 border-t border-border pt-3">
              <Link href="/login" className="flex-1">
                <Button variant="secondary" className="w-full">Sign in</Button>
              </Link>
              <Link href="/signup" className="flex-1">
                <Button className="w-full">Get started</Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
