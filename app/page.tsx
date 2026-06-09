import Link from "next/link";
import {
  ArrowRight, Sparkles, Users, Handshake, BadgeDollarSign, MessageSquare,
  Rocket, TrendingUp, Building2, Award, ChevronRight, Star,
  Zap, Globe, Shield, BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/footer";

const features = [
  {
    icon: Users,
    title: "Professional Networking",
    text: "Profiles, followers, connections, posts, reactions, comments, and saved content — the LinkedIn-style graph for startups.",
    color: "text-blue-600",
    bg: "bg-blue-50"
  },
  {
    icon: Handshake,
    title: "Founder Matchmaking",
    text: "AI-powered compatibility scoring across industry, skills, location, startup stage, commitment level, and goals.",
    color: "text-violet-600",
    bg: "bg-violet-50"
  },
  {
    icon: BadgeDollarSign,
    title: "Fundraising CRM",
    text: "Funding rounds, investor pipeline, deal room flows, watchlists, meeting notes, and stage tracking — all in one place.",
    color: "text-emerald-600",
    bg: "bg-emerald-50"
  },
  {
    icon: MessageSquare,
    title: "Realtime Messaging",
    text: "Supabase Realtime-powered chat with typing indicators, seen status, emoji reactions, and file uploads.",
    color: "text-sky-600",
    bg: "bg-sky-50"
  },
  {
    icon: Rocket,
    title: "Startup Profiles",
    text: "Rich company pages with team, funding history, open jobs, posts, and metrics — verifiable and discoverable.",
    color: "text-orange-600",
    bg: "bg-orange-50"
  },
  {
    icon: BarChart3,
    title: "Investor Dashboard",
    text: "Portfolio management, deal flow kanban, watchlist, and meeting history — purpose-built for capital allocators.",
    color: "text-rose-600",
    bg: "bg-rose-50"
  },
  {
    icon: Globe,
    title: "Events & Communities",
    text: "Virtual and in-person events with RSVP, community groups by industry, stage, and geography.",
    color: "text-teal-600",
    bg: "bg-teal-50"
  },
  {
    icon: Zap,
    title: "Jobs & Hiring",
    text: "Equity-first job board natively integrated with startup profiles. Apply, track, and hire within the ecosystem.",
    color: "text-amber-600",
    bg: "bg-amber-50"
  }
];

const stats = [
  { value: "12,400+", label: "Founders" },
  { value: "$2.8B", label: "Raised via Platform" },
  { value: "480+", label: "Active Investors" },
  { value: "94%", label: "Match Satisfaction" }
];

const startups = [
  { name: "OrbitLedger", tagline: "Programmable payroll for global teams", stage: "Seed", industry: "Fintech", color: "bg-blue-600" },
  { name: "CarbonArc", tagline: "Industrial energy decarbonization", stage: "Series A", industry: "Climate", color: "bg-emerald-600" },
  { name: "NeuralSync", tagline: "AI co-pilot for enterprise workflows", stage: "Pre-seed", industry: "AI / SaaS", color: "bg-violet-600" },
  { name: "Gridwave", tagline: "Smart grid management infrastructure", stage: "Seed", industry: "Energy", color: "bg-amber-600" }
];

const investors = [
  { name: "Sofia Alvarez", firm: "Northstar Ventures", focus: "B2B AI & Fintech", checks: "$500K–$2M", avatar: "SA" },
  { name: "Daniel Brooks", firm: "Apex Capital", focus: "Workflow Automation", checks: "$250K–$1M", avatar: "DB" },
  { name: "Priya Shah", firm: "Elevation Partners", focus: "Climate & Sustainability", checks: "$1M–$5M", avatar: "PS" }
];

const testimonials = [
  {
    quote: "StartupVerse connected me with my co-founder in 3 weeks. The compatibility score was eerily accurate — we're now building together full-time.",
    author: "Maya Chen",
    role: "Founder, LatticePay",
    avatar: "MC"
  },
  {
    quote: "The fundraising CRM has completely replaced my spreadsheets. I can track every investor conversation, pipeline stage, and meeting note in one place.",
    author: "Arjun Mehta",
    role: "CEO, CarbonArc",
    avatar: "AM"
  },
  {
    quote: "As an investor, the deal flow and startup discovery tools are genuinely impressive. I've sourced 4 portfolio companies directly from the platform.",
    author: "Daniel Brooks",
    role: "Partner, Apex Capital",
    avatar: "DB"
  }
];

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for exploring the ecosystem",
    features: ["Full profile", "Feed & discovery", "5 connections/month", "Basic messaging"],
    cta: "Get started",
    href: "/signup",
    highlight: false
  },
  {
    name: "Founder Pro",
    price: "$29",
    period: "per month",
    description: "For active founders building and raising",
    features: ["Unlimited connections", "Match AI scoring", "Fundraising CRM", "Investor outreach", "Priority search ranking", "Startup profile page"],
    cta: "Start building",
    href: "/signup",
    highlight: true
  },
  {
    name: "Investor Pro",
    price: "$49",
    period: "per month",
    description: "For active investors deploying capital",
    features: ["Deal flow dashboard", "Startup watchlist", "Pipeline Kanban", "Meeting notes", "Portfolio tracking", "Founder introductions"],
    cta: "Start investing",
    href: "/signup",
    highlight: false
  },
  {
    name: "Startup Pro",
    price: "$99",
    period: "per month",
    description: "For teams raising and hiring at scale",
    features: ["Everything in Founder Pro", "Team management", "Unlimited job posts", "Verified badge", "Featured placement", "Analytics dashboard"],
    cta: "Scale your startup",
    href: "/signup",
    highlight: false
  }
];

const faqs = [
  {
    q: "Can founders raise directly on StartupVerse?",
    a: "Yes. Founders can create funding rounds, set targets and valuations, and track investor interest through our pipeline CRM. Investors can express interest, schedule meetings, and move through deal stages."
  },
  {
    q: "How does the founder matchmaking algorithm work?",
    a: "Our AI analyzes industry alignment, skill complementarity, location, startup stage, commitment level, and stated goals to generate a compatibility score. You can customize preferences to recalibrate the results."
  },
  {
    q: "Does StartupVerse support communities and events?",
    a: "Yes — communities are organized by industry, stage, and geography. Events (virtual and in-person) support RSVP, reminders, and speaker profiles."
  },
  {
    q: "Is my data secure?",
    a: "Authentication is powered by Clerk with MFA support. Data is stored in Supabase PostgreSQL with Row Level Security enforced at the database layer."
  }
];

export default function LandingPage() {
  return (
    <>
      <SiteHeader />
      <main className="overflow-hidden">

        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="relative gradient-hero noise pt-32 pb-24 sm:pt-40 sm:pb-32">
          <div className="gradient-mesh absolute inset-0 pointer-events-none" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <Badge className="inline-flex gap-1.5 mb-6 bg-primary/10 text-primary border-primary/20 px-4 py-1.5 text-xs font-bold">
                <Sparkles size={12} />
                The Startup OS for 2026
              </Badge>

              <h1 className="mx-auto max-w-5xl text-5xl font-bold tracking-tight text-ink sm:text-6xl lg:text-7xl leading-[1.1]">
                Where <span className="gradient-text-blue">founders</span>,<br />
                investors, and builders<br />
                <span className="gradient-text-blue">meet & grow</span>
              </h1>

              <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-muted">
                StartupVerse is the professional ecosystem combining LinkedIn-style networking,
                AI founder matchmaking, fundraising CRM, real-time messaging, and a startup job board.
              </p>

              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <Link href="/signup">
                  <Button size="lg" className="gap-2 h-12 px-8 text-base shadow-glow">
                    Create free profile <ArrowRight size={18} />
                  </Button>
                </Link>
                <Link href="/feed">
                  <Button variant="secondary" size="lg" className="h-12 px-8 text-base">
                    Preview platform
                  </Button>
                </Link>
              </div>

              {/* Social proof strip */}
              <p className="mt-8 text-xs text-muted">
                <span className="font-semibold text-ink">12,400+ founders</span> already on the platform ·
                <span className="font-semibold text-ink"> No credit card required</span>
              </p>
            </div>

            {/* Hero visual cards */}
            <div className="mt-20 grid gap-4 sm:grid-cols-3 lg:grid-cols-3 max-w-4xl mx-auto">
              {/* Match Score Card */}
              <div className="rounded-3xl border border-border bg-white/90 backdrop-blur-xl p-6 shadow-soft animate-slide-up">
                <p className="text-xs font-bold text-muted uppercase tracking-widest">Founder Match</p>
                <p className="mt-2 text-6xl font-bold tracking-tight text-primary">92%</p>
                <p className="mt-1 text-sm text-muted">with Arjun Mehta · CarbonArc</p>
                <div className="mt-4 space-y-2">
                  {[{ label: "Skill synergy", val: 95 }, { label: "Vision alignment", val: 92 }, { label: "Investor relevance", val: 88 }].map((item) => (
                    <div key={item.label}>
                      <div className="mb-1 flex justify-between text-[10px] font-bold text-muted">
                        <span>{item.label}</span><span>{item.val}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-blue-100">
                        <div className="h-1.5 rounded-full bg-primary" style={{ width: `${item.val}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fundraising Card */}
              <div className="rounded-3xl border border-border bg-white/90 backdrop-blur-xl p-6 shadow-soft animate-slide-up delay-100">
                <p className="text-xs font-bold text-muted uppercase tracking-widest">Seed Round</p>
                <p className="mt-2 text-4xl font-bold tracking-tight text-ink">$1.8M</p>
                <p className="mt-1 text-sm text-success font-semibold">72% committed</p>
                <div className="mt-4 h-2.5 rounded-full bg-surface">
                  <div className="h-2.5 w-[72%] rounded-full bg-gradient-blue" />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {["Interested", "Meeting", "Due Diligence", "Committed"].map((s, i) => (
                    <div key={s} className="rounded-xl bg-surface border border-border/50 px-3 py-2 text-[10px] font-bold text-muted flex items-center gap-1.5">
                      <div className={`size-1.5 rounded-full ${i === 3 ? "bg-success" : i === 2 ? "bg-primary" : i === 1 ? "bg-warning" : "bg-muted"}`} />
                      {s}
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity Card */}
              <div className="rounded-3xl border border-border bg-white/90 backdrop-blur-xl p-6 shadow-soft animate-slide-up delay-200">
                <p className="text-xs font-bold text-muted uppercase tracking-widest">Live Activity</p>
                <div className="mt-4 space-y-3">
                  {[
                    { user: "Sofia A.", action: "expressed interest in LatticePay", time: "2m" },
                    { user: "Alex B.", action: "matched with Arjun M.", time: "8m" },
                    { user: "Maya C.", action: "posted a seed round update", time: "14m" }
                  ].map((item) => (
                    <div key={item.user} className="flex items-center gap-2.5">
                      <div className="size-7 rounded-xl bg-gradient-blue flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                        {item.user.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold text-ink truncate">
                          <span className="text-primary">{item.user}</span> {item.action}
                        </p>
                        <p className="text-[10px] text-muted">{item.time} ago</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats ────────────────────────────────────────────── */}
        <section className="border-y border-border bg-white py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-4xl font-bold tracking-tight text-ink">{stat.value}</p>
                  <p className="mt-2 text-sm font-semibold text-muted">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features ─────────────────────────────────────────── */}
        <section className="py-24 bg-surface">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">Platform features</Badge>
              <h2 className="text-4xl font-bold tracking-tight text-ink">
                Everything you need to build,<br />fund, and grow
              </h2>
              <p className="mt-4 text-lg text-muted max-w-2xl mx-auto">
                Eight integrated modules that replace 10+ separate tools — purpose-built for the startup ecosystem.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((f) => (
                <div key={f.title} className="rounded-3xl border border-border bg-white p-6 hover-lift shadow-card">
                  <div className={`grid size-12 place-items-center rounded-2xl ${f.bg} ${f.color} mb-5`}>
                    <f.icon size={22} />
                  </div>
                  <h3 className="font-bold text-ink">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{f.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Startup Showcase ──────────────────────────────────── */}
        <section className="py-24 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between gap-6 mb-12">
              <div>
                <Badge className="mb-3 bg-orange-50 text-orange-600 border-orange-100">Startup showcase</Badge>
                <h2 className="text-4xl font-bold tracking-tight text-ink">
                  Verified companies raising,<br />hiring, and launching
                </h2>
              </div>
              <Link href="/startups">
                <Button variant="secondary" className="gap-1.5 hidden sm:flex">
                  Browse all <ChevronRight size={16} />
                </Button>
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {startups.map((s) => (
                <Link key={s.name} href={`/startups/${s.name.toLowerCase()}`}>
                  <div className="rounded-3xl border border-border bg-white p-6 hover-lift shadow-card cursor-pointer group">
                    <div className={`grid size-12 place-items-center rounded-2xl ${s.color} text-white font-bold text-lg mb-4`}>
                      {s.name.charAt(0)}
                    </div>
                    <h3 className="font-bold text-ink group-hover:text-primary transition-colors">{s.name}</h3>
                    <p className="mt-1.5 text-sm text-muted leading-relaxed">{s.tagline}</p>
                    <div className="mt-4 flex items-center gap-2">
                      <Badge className="text-[10px] bg-surface border-border text-muted font-bold">{s.stage}</Badge>
                      <Badge className="text-[10px] bg-surface border-border text-muted font-bold">{s.industry}</Badge>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── Investor Showcase ─────────────────────────────────── */}
        <section className="py-24 bg-surface">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
              <Badge className="mb-3 bg-emerald-50 text-emerald-600 border-emerald-100">Investor showcase</Badge>
              <h2 className="text-4xl font-bold tracking-tight text-ink">
                Capital partners with live thesis<br />and check-size filters
              </h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-3">
              {investors.map((inv) => (
                <div key={inv.name} className="rounded-3xl border border-border bg-white p-6 hover-lift shadow-card">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-dark text-white font-bold">
                      {inv.avatar}
                    </div>
                    <div>
                      <h3 className="font-bold text-ink">{inv.name}</h3>
                      <p className="text-xs text-muted">{inv.firm}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted">Focus</span>
                      <span className="font-semibold text-ink text-right">{inv.focus}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Check size</span>
                      <span className="font-semibold text-ink">{inv.checks}</span>
                    </div>
                  </div>
                  <Link href={`/investors/${inv.name.toLowerCase().replace(" ", "")}`}>
                    <Button variant="secondary" size="sm" className="mt-4 w-full gap-1.5">
                      View profile <ChevronRight size={14} />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Testimonials ─────────────────────────────────────── */}
        <section className="py-24 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-yellow-50 text-yellow-600 border-yellow-100">
                <Star size={12} className="fill-current" /> Testimonials
              </Badge>
              <h2 className="text-4xl font-bold tracking-tight text-ink">
                Loved by founders and investors
              </h2>
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
              {testimonials.map((t) => (
                <div key={t.author} className="rounded-3xl border border-border bg-surface p-8 hover-lift shadow-card">
                  <div className="flex gap-0.5 mb-5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <blockquote className="text-ink leading-relaxed font-medium">
                    "{t.quote}"
                  </blockquote>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="grid size-10 place-items-center rounded-xl bg-gradient-dark text-white font-bold text-xs">
                      {t.avatar}
                    </div>
                    <div>
                      <p className="font-bold text-ink text-sm">{t.author}</p>
                      <p className="text-xs text-muted">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Pricing ──────────────────────────────────────────── */}
        <section className="py-24 bg-surface" id="pricing">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">Pricing</Badge>
              <h2 className="text-4xl font-bold tracking-tight text-ink">
                Simple, transparent pricing
              </h2>
              <p className="mt-4 text-lg text-muted">Start free. Upgrade as you grow.</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`rounded-3xl border p-6 flex flex-col shadow-card ${
                    plan.highlight
                      ? "border-primary bg-primary text-white shadow-glow"
                      : "border-border bg-white"
                  }`}
                >
                  <div>
                    <h3 className={`font-bold text-lg ${plan.highlight ? "text-white" : "text-ink"}`}>{plan.name}</h3>
                    <div className="mt-3 flex items-baseline gap-1">
                      <span className={`text-4xl font-bold ${plan.highlight ? "text-white" : "text-ink"}`}>{plan.price}</span>
                      <span className={`text-sm ${plan.highlight ? "text-white/70" : "text-muted"}`}>/{plan.period}</span>
                    </div>
                    <p className={`mt-2 text-sm ${plan.highlight ? "text-white/80" : "text-muted"}`}>{plan.description}</p>
                  </div>
                  <ul className="mt-6 space-y-2.5 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <span className={`text-lg leading-none ${plan.highlight ? "text-white" : "text-success"}`}>✓</span>
                        <span className={plan.highlight ? "text-white/90" : "text-ink/80"}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href={plan.href} className="mt-6 block">
                    <Button
                      className="w-full"
                      variant={plan.highlight ? "secondary" : "primary"}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────── */}
        <section className="py-24 bg-white">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge className="mb-4">FAQ</Badge>
              <h2 className="text-4xl font-bold tracking-tight text-ink">
                Frequently asked questions
              </h2>
            </div>
            <div className="space-y-4">
              {faqs.map((faq) => (
                <div key={faq.q} className="rounded-2xl border border-border bg-surface p-6">
                  <h3 className="font-bold text-ink">{faq.q}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA Banner ───────────────────────────────────────── */}
        <section className="py-24 bg-gradient-dark">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <Sparkles className="mx-auto mb-6 text-blue-400" size={36} />
            <h2 className="text-4xl font-bold tracking-tight text-white">
              Ready to build your startup future?
            </h2>
            <p className="mt-6 text-lg text-white/70 max-w-xl mx-auto">
              Join 12,400+ founders, investors, and builders already networking, matching, and funding on StartupVerse.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link href="/signup">
                <Button size="lg" className="h-12 px-8 text-base bg-white text-ink hover:bg-surface gap-2">
                  Create free profile <ArrowRight size={18} />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="secondary" className="h-12 px-8 text-base border-white/20 text-white hover:bg-white/10">
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
