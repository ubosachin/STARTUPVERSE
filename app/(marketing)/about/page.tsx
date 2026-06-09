import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Star, Sparkles, Heart, Globe, Users, Rocket, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "About StartupVerse",
  description: "Learn about our mission, team, and the story behind StartupVerse — the professional ecosystem for founders and investors."
};

const values = [
  { icon: Rocket, title: "Builders first", desc: "Everything we build is for founders, co-founders, and builders who are changing the world." },
  { icon: Heart, title: "Community over competition", desc: "We believe the startup ecosystem grows stronger when great people connect and help each other succeed." },
  { icon: Globe, title: "Global & inclusive", desc: "Great companies are being built everywhere. StartupVerse is designed for founders across all geographies and backgrounds." },
  { icon: Award, title: "Signal over noise", desc: "We curate connections, not collect them. Every feature is designed to drive meaningful relationships." }
];

const milestones = [
  { year: "2024", event: "StartupVerse founded by a team of former founders and VCs" },
  { year: "2025 Q1", event: "Beta launch with 500 invited founders" },
  { year: "2025 Q2", event: "Passed $500M in deals tracked on the platform" },
  { year: "2025 Q4", event: "10,000+ founders, 200+ investors — Series A announced" },
  { year: "2026", event: "Global launch: 12,400+ members, $2.8B raised via platform" }
];

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main className="pt-16 overflow-hidden">
        {/* Hero */}
        <section className="gradient-hero py-24 sm:py-32">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
              <Sparkles size={12} className="mr-1" />
              Our story
            </Badge>
            <h1 className="text-5xl font-bold tracking-tight text-ink sm:text-6xl">
              Built by founders,<br />for founders
            </h1>
            <p className="mt-8 text-xl text-muted max-w-2xl mx-auto leading-relaxed">
              StartupVerse was born from frustration. Our founding team spent years navigating fragmented tools, 
              cold LinkedIn DMs, and opaque fundraising processes. We built the platform we always wished existed.
            </p>
          </div>
        </section>

        {/* Stats */}
        <section className="bg-white py-16 border-y border-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
              {[
                { value: "12,400+", label: "Founders" },
                { value: "480+", label: "Investors" },
                { value: "$2.8B", label: "Raised on platform" },
                { value: "94%", label: "Match satisfaction" }
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-4xl font-bold tracking-tight gradient-text-blue">{s.value}</p>
                  <p className="mt-2 text-sm font-semibold text-muted">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission */}
        <section className="py-24 bg-surface">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold tracking-tight text-ink">Our mission</h2>
            <p className="mt-6 text-xl text-muted leading-relaxed">
              To accelerate the global startup ecosystem by making it dramatically easier for the right founders, 
              investors, co-founders, builders, and advisors to find each other — and build great companies together.
            </p>
          </div>
        </section>

        {/* Values */}
        <section className="py-24 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold tracking-tight text-ink text-center mb-16">What we believe</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {values.map((v) => (
                <div key={v.title} className="rounded-3xl border border-border bg-surface p-6 hover-lift shadow-card">
                  <div className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary mb-5">
                    <v.icon size={22} />
                  </div>
                  <h3 className="font-bold text-ink">{v.title}</h3>
                  <p className="mt-2 text-sm text-muted leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-24 bg-surface">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold tracking-tight text-ink text-center mb-16">Our milestones</h2>
            <div className="relative space-y-6">
              <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-border" />
              {milestones.map((m, i) => (
                <div key={m.year} className="flex gap-6 pl-10 relative">
                  <div className={`absolute left-0 top-1 grid size-8 place-items-center rounded-full border-2 text-xs font-bold ${i === milestones.length - 1 ? "border-primary bg-primary text-white" : "border-border bg-white text-muted"}`}>
                    ✓
                  </div>
                  <div className="rounded-2xl border border-border bg-white p-4 flex-1 shadow-card">
                    <p className="text-xs font-bold text-primary mb-1">{m.year}</p>
                    <p className="text-sm font-semibold text-ink">{m.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 bg-gradient-dark">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold text-white">Join us in building the future</h2>
            <p className="mt-6 text-lg text-white/70">We're just getting started. 12,400+ founders have already found their co-founder, investor, or first hire on StartupVerse.</p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link href="/signup">
                <Button size="lg" className="h-12 px-8 bg-white text-ink hover:bg-surface gap-2">
                  Create free profile <ArrowRight size={18} />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="secondary" className="h-12 px-8 border-white/20 text-white hover:bg-white/10">
                  View pricing
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
