import { redirect } from "next/navigation";
import {
  Building2, TrendingUp, Eye, BadgeDollarSign,
  ChevronRight, Star, Calendar
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { createSupabaseServiceClient, getCurrentDbUser } from "@/lib/supabase/server";

export const revalidate = 0; // Disable caching for dashboard data

export default async function InvestorDashboardPage() {
  const dbUser = await getCurrentDbUser();
  if (!dbUser) {
    redirect("/login");
  }

  const supabase = createSupabaseServiceClient();
  if (!supabase) {
    return (
      <div className="flex h-96 items-center justify-center text-muted">
        Database connection not available.
      </div>
    );
  }

  // 1. Fetch investor profile details
  const { data: investor } = await supabase
    .from("investors")
    .select("*")
    .eq("user_id", dbUser.id)
    .maybeSingle();

  // 2. Fetch active deals pipeline count
  const { count: activeDealsCount } = await supabase
    .from("deals")
    .select("*", { count: "exact", head: true })
    .eq("investor_id", dbUser.id);

  // 3. Fetch watchlist (followed startups)
  const { data: followedRecords } = await supabase
    .from("startup_follows")
    .select(`
      startup:startup_id (
        id,
        name,
        slug,
        stage,
        industry,
        is_hiring
      )
    `)
    .eq("user_id", dbUser.id)
    .limit(5);

  const watchlist = (followedRecords || [])
    .map((r: any) => r.startup)
    .filter(Boolean);

  // 4. Fetch active funding rounds
  const { data: roundsData } = await supabase
    .from("funding_rounds")
    .select(`
      id,
      round_type,
      target_amount,
      amount_raised,
      status,
      startup:startup_id (
        id,
        name,
        tagline,
        slug
      )
    `)
    .eq("status", "active")
    .limit(4);

  const activeRounds = (roundsData || []).filter((r: any) => r.startup);

  // Stats calculation
  const portfolio = investor?.portfolio_companies ?? [];
  const totalDeployed = portfolio.length > 0 ? `$${(portfolio.length * 0.5).toFixed(1)}M` : "$0.0M";

  const stats = [
    { 
      label: "Portfolio companies", 
      value: String(portfolio.length), 
      trend: "+1 this quarter", 
      icon: Building2, 
      color: "text-blue-600", 
      bg: "bg-blue-50" 
    },
    { 
      label: "Active deals", 
      value: String(activeDealsCount || 0), 
      trend: "In pipeline", 
      icon: TrendingUp, 
      color: "text-violet-600", 
      bg: "bg-violet-50" 
    },
    { 
      label: "Startups watched", 
      value: String(watchlist.length), 
      trend: "Watchlist size", 
      icon: Eye, 
      color: "text-emerald-600", 
      bg: "bg-emerald-50" 
    },
    { 
      label: "Total deployed", 
      value: totalDeployed, 
      trend: "Est. deployed capital", 
      icon: BadgeDollarSign, 
      color: "text-amber-600", 
      bg: "bg-amber-50" 
    }
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-muted">Investor Dashboard</p>
          <h1 className="text-2xl font-bold tracking-tight text-ink">
            {investor?.firm_name || "Your Fund"}
          </h1>
        </div>
        <Link href="/investor/dealflow">
          <Button size="sm" className="gap-1.5">
            <TrendingUp size={15} />
            Deal Flow
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-3xl border border-border bg-white p-5 shadow-card hover-lift">
            <div className="flex items-center justify-between mb-4">
              <div className={`grid size-10 place-items-center rounded-2xl ${s.bg} ${s.color}`}>
                <s.icon size={18} />
              </div>
            </div>
            <p className="text-2xl font-bold text-ink">{s.value}</p>
            <p className="text-xs text-muted font-semibold mt-0.5">{s.label}</p>
            <p className="text-[10px] text-success font-bold mt-1">{s.trend}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active rounds in pipeline */}
          <div className="rounded-3xl border border-border bg-white p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-ink">Active Rounds to Review</h2>
              <Link href="/investor/dealflow">
                <Button variant="secondary" size="sm">Full pipeline →</Button>
              </Link>
            </div>
            {activeRounds.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted">
                No active funding rounds available to review right now.
              </div>
            ) : (
              <div className="space-y-3">
                {activeRounds.map((round: any) => {
                  const pct = round.target_amount > 0 
                    ? Math.round((Number(round.amount_raised) / Number(round.target_amount)) * 100)
                    : 0;
                  return (
                    <div key={round.id} className="rounded-2xl border border-border bg-surface p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="grid size-10 place-items-center rounded-xl bg-gradient-blue text-white font-bold text-sm shrink-0">
                          {round.startup.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-bold text-sm text-ink truncate">{round.startup.name}</p>
                            <Badge className="text-[10px] bg-white border-border text-muted font-bold shrink-0 uppercase">
                              {round.round_type}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted truncate">{round.startup.tagline}</p>
                        </div>
                      </div>
                      <Progress value={pct} size="sm" />
                      <div className="mt-2 flex justify-between text-[10px] font-bold text-muted">
                        <span>${(Number(round.amount_raised) / 1e6).toFixed(1)}M raised of ${(Number(round.target_amount) / 1e6).toFixed(1)}M</span>
                        <span className="text-success">{pct}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Watchlist */}
          <div className="rounded-3xl border border-border bg-white p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-ink">Watchlist</h2>
              <Link href="/investor/watchlist">
                <Button variant="secondary" size="sm">View all →</Button>
              </Link>
            </div>
            {watchlist.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted">
                Your watchlist is empty. Go to deal flow or network to track startups.
              </div>
            ) : (
              <div className="space-y-3">
                {watchlist.map((startup: any) => (
                  <Link key={startup.id} href={`/startups/${startup.slug}`}>
                    <div className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-3 hover:border-primary/40 transition">
                      <div className="grid size-10 place-items-center rounded-xl bg-gradient-dark text-white font-bold text-sm shrink-0">
                        {startup.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-ink truncate">{startup.name}</p>
                        <p className="text-[10px] text-muted">{startup.stage} · {startup.industry}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge className={`text-[10px] font-bold ${startup.is_hiring ? "bg-success/10 text-success border-success/20" : "bg-surface border-border text-muted"}`}>
                          {startup.is_hiring ? "Hiring" : "Stealth"}
                        </Badge>
                        <ChevronRight size={14} className="text-muted" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          {/* Investment thesis */}
          {investor && (
            <div className="rounded-3xl border border-border bg-white p-6">
              <h2 className="font-bold text-ink mb-3">Your Thesis</h2>
              <p className="text-sm text-muted leading-relaxed line-clamp-4">{investor.investment_thesis || "No thesis set."}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {investor.focus_areas?.slice(0, 4).map((a: string) => (
                  <Badge key={a} className="text-[10px] bg-surface border-border text-muted font-bold">{a}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Quick actions */}
          <div className="rounded-3xl border border-border bg-white p-6 space-y-3">
            <h2 className="font-bold text-ink mb-2">Quick Actions</h2>
            {[
              { label: "Browse startups", href: "/startups", icon: Building2 },
              { label: "View deal flow", href: "/investor/dealflow", icon: TrendingUp },
              { label: "Update watchlist", href: "/investor/watchlist", icon: Star },
              { label: "Schedule meetings", href: "/messages", icon: Calendar }
            ].map((action) => (
              <Link key={action.label} href={action.href}>
                <div className="flex items-center gap-3 rounded-2xl p-3 hover:bg-surface transition cursor-pointer">
                  <action.icon size={16} className="text-primary shrink-0" />
                  <span className="text-sm font-semibold text-ink">{action.label}</span>
                  <ChevronRight size={14} className="ml-auto text-muted" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
