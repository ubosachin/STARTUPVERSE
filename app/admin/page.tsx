import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Users as UsersIcon, Building2, FileText, BadgeDollarSign, TrendingUp,
  AlertTriangle, ChevronRight, Shield, Activity
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createSupabaseServiceClient, getCurrentDbUser } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "StartupVerse admin panel"
};

export const revalidate = 0; // Fresh metrics

export default async function AdminDashboardPage() {
  const dbUser = await getCurrentDbUser();

  const supabase = createSupabaseServiceClient();
  if (!supabase) {
    return (
      <div className="flex h-96 items-center justify-center text-muted">
        Database connection not available.
      </div>
    );
  }

  // 1. Fetch overview metrics
  const { count: usersCount } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true });

  const { count: startupsCount } = await supabase
    .from("startups")
    .select("*", { count: "exact", head: true });

  const { count: postsCount } = await supabase
    .from("posts")
    .select("*", { count: "exact", head: true });

  const { count: investorsCount } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq("role", "investor");

  const { data: roundsData } = await supabase
    .from("funding_rounds")
    .select("amount_raised");

  const { count: reportsCount } = await supabase
    .from("reports")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  const totalRaised = (roundsData || []).reduce((acc, curr) => acc + Number(curr.amount_raised || 0), 0);

  const stats = [
    { label: "Total users", value: usersCount || 0, change: "Registered accounts", icon: UsersIcon, color: "text-blue-600", bg: "bg-blue-50", href: "/admin/users" },
    { label: "Startups listed", value: startupsCount || 0, change: "Startup profiles", icon: Building2, color: "text-violet-600", bg: "bg-violet-50", href: "/admin/startups" },
    { label: "Posts created", value: postsCount || 0, change: "Ecosystem posts", icon: FileText, color: "text-emerald-600", bg: "bg-emerald-50", href: "/admin/posts" },
    { label: "Active investors", value: investorsCount || 0, change: "Investor profiles", icon: BadgeDollarSign, color: "text-amber-600", bg: "bg-amber-50", href: "/admin/users" },
    { label: "Total raised", value: `$${(totalRaised / 1e6).toFixed(1)}M`, change: "Ecosystem funding", icon: TrendingUp, color: "text-rose-600", bg: "bg-rose-50", href: "/admin/startups" },
    { label: "Reports queued", value: reportsCount || 0, change: "Moderation queue", icon: AlertTriangle, color: "text-orange-600", bg: "bg-orange-50", href: "/admin/reports" }
  ];

  // 2. Fetch recent postings
  const { data: recentPosts } = await supabase
    .from("posts")
    .select(`
      id,
      content,
      created_at,
      user:user_id (
        username
      )
    `)
    .order("created_at", { ascending: false })
    .limit(6);

  const recentActivity = (recentPosts || [])
    .filter((p) => p.user)
    .map((p: any) => ({
      id: p.id,
      name: p.user.username,
      action: `posted: "${p.content.substring(0, 50)}..."`,
      time: new Date(p.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
    }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 font-sans">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield size={18} className="text-primary" />
            <span className="text-xs font-bold text-primary uppercase tracking-widest">Admin Panel</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Platform Overview</h1>
        </div>
        <Badge className="bg-danger/10 border-danger/20 text-danger font-bold">Admin access</Badge>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <div className="rounded-3xl border border-border bg-white p-5 shadow-card hover-lift cursor-pointer group">
              <div className="flex items-center justify-between mb-4">
                <div className={`grid size-10 place-items-center rounded-2xl ${s.bg} ${s.color}`}>
                  <s.icon size={18} />
                </div>
                <ChevronRight size={16} className="text-muted group-hover:text-primary transition-colors" />
              </div>
              <p className="text-3xl font-bold text-ink">{s.value.toLocaleString()}</p>
              <p className="text-xs font-semibold text-muted mt-1">{s.label}</p>
              <p className="text-[10px] text-success font-bold mt-1">{s.change}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent activity */}
        <div className="lg:col-span-2 rounded-3xl border border-border bg-white p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-ink flex items-center gap-2">
              <Activity size={17} className="text-primary" />
              Recent Activity
            </h2>
          </div>
          {recentActivity.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted">No recent platform activity found.</div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((item) => (
                <div key={item.id} className="flex items-center gap-3 rounded-2xl bg-surface p-3">
                  <div className="grid size-8 place-items-center rounded-xl bg-gradient-blue text-white font-bold text-xs shrink-0">
                    {item.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-ink">
                      <span className="font-bold">{item.name}</span>{" "}
                      <span className="text-muted truncate">{item.action}</span>
                    </p>
                  </div>
                  <span className="text-[10px] text-muted shrink-0">{item.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="space-y-4">
          <div className="rounded-3xl border border-border bg-white p-6">
            <h2 className="font-bold text-ink mb-4">Admin Actions</h2>
            {[
              { label: "Manage users", href: "/admin/users", icon: UsersIcon },
              { label: "Moderate posts", href: "/admin/posts", icon: FileText },
              { label: "Review startups", href: "/admin/startups", icon: Building2 },
              { label: "Content reports", href: "/admin/reports", icon: AlertTriangle }
            ].map((action) => (
              <Link key={action.label} href={action.href}>
                <div className="flex items-center gap-3 rounded-xl p-3 hover:bg-surface transition cursor-pointer mb-1">
                  <action.icon size={16} className="text-primary shrink-0" />
                  <span className="text-sm font-semibold text-ink">{action.label}</span>
                  <ChevronRight size={14} className="ml-auto text-muted" />
                </div>
              </Link>
            ))}
          </div>

          <div className="rounded-3xl border border-danger/20 bg-danger/5 p-5">
            <h3 className="font-bold text-danger mb-2 flex items-center gap-2">
              <AlertTriangle size={15} />
              Pending reviews
            </h3>
            <p className="text-sm text-muted mb-3">{reportsCount || 0} content reports require review.</p>
            <Link href="/admin/reports">
              <Button size="sm" className="bg-danger text-white hover:bg-danger/90 w-full">
                Review reports
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
