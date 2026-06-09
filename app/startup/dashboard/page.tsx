import { redirect } from "next/navigation";
import {
  TrendingUp, Users, BriefcaseBusiness, MessageSquare, Plus,
  Rocket, Settings2, Eye, Heart, Share2
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { createSupabaseServiceClient, getCurrentDbUser } from "@/lib/supabase/server";

export const revalidate = 0; // Disable caching for dashboard

export default async function StartupDashboardPage() {
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

  // 1. Fetch user's startup
  const { data: myStartup } = await supabase
    .from("startups")
    .select("*")
    .eq("founder_id", dbUser.id)
    .maybeSingle();

  if (!myStartup) {
    // If user is founder but has not created a startup profile, redirect to startup creation
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center space-y-6">
        <Rocket size={48} className="mx-auto text-primary animate-bounce" />
        <h2 className="text-2xl font-bold tracking-tight text-ink">Launch your startup profile</h2>
        <p className="text-sm text-muted">
          You haven't registered a startup profile on StartupVerse yet. Create a profile to access team, jobs, funding rounds, and deck rooms.
        </p>
        <Link href="/startup/create" className="inline-block">
          <Button size="lg" className="rounded-xl font-bold">
            Create Startup Profile
          </Button>
        </Link>
      </div>
    );
  }

  // 2. Fetch funding rounds
  const { data: rounds } = await supabase
    .from("funding_rounds")
    .select("*")
    .eq("startup_id", myStartup.id);

  const activeRound = (rounds || []).find((r) => r.status === "active") || rounds?.[0];
  const fundingPct = activeRound && activeRound.target_amount > 0
    ? Math.round((Number(activeRound.amount_raised) / Number(activeRound.target_amount)) * 100)
    : 0;

  // 3. Fetch jobs count
  const { data: jobs } = await supabase
    .from("jobs")
    .select("*")
    .eq("startup_id", myStartup.id);

  const activeJobs = jobs || [];

  // 4. Fetch recent posts
  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .eq("startup_id", myStartup.id)
    .order("created_at", { ascending: false })
    .limit(3);

  const activePosts = posts || [];

  // 5. Fetch connection count for stats
  const { count: connectionsCount } = await supabase
    .from("connections")
    .select("*", { count: "exact", head: true })
    .or(`requester_id.eq.${dbUser.id},addressee_id.eq.${dbUser.id}`)
    .eq("status", "accepted");

  // Dynamic stats
  const stats = [
    { label: "Profile followers", value: String(myStartup.followers_count || 0), trend: "Interest metrics", icon: Eye, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Platform connections", value: String(connectionsCount || 0), trend: "Accepted network", icon: Users, color: "text-violet-600", bg: "bg-violet-50" },
    { label: "Recent posts", value: String(activePosts.length), trend: "Content metrics", icon: Heart, color: "text-rose-600", bg: "bg-rose-50" },
    { label: "Open positions", value: String(activeJobs.length), trend: `${activeJobs.length} active`, icon: BriefcaseBusiness, color: "text-emerald-600", bg: "bg-emerald-50" }
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-muted">Startup Dashboard</p>
          <h1 className="text-2xl font-bold tracking-tight text-ink">
            {myStartup.name}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/startup/settings">
            <Button variant="secondary" size="sm" className="gap-1.5">
              <Settings2 size={15} />
              Settings
            </Button>
          </Link>
          <Link href="/fundraising">
            <Button size="sm" className="gap-1.5">
              <TrendingUp size={15} />
              Fundraising
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-3xl border border-border bg-white p-5 shadow-card hover-lift">
            <div className="flex items-center justify-between mb-4">
              <div className={`grid size-10 place-items-center rounded-2xl ${s.bg} ${s.color}`}>
                <s.icon size={18} />
              </div>
              <span className="text-xs font-bold text-success">{s.trend}</span>
            </div>
            <p className="text-2xl font-bold text-ink">{s.value}</p>
            <p className="text-xs text-muted font-semibold mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: funding + posts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active funding round */}
          {activeRound ? (
            <div className="rounded-3xl border border-border bg-white p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-ink flex items-center gap-2">
                  <TrendingUp size={18} className="text-primary" />
                  Active Funding Round
                </h2>
                <Badge className="bg-success/10 border-success/20 text-success font-bold capitalize">
                  {activeRound.status}
                </Badge>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-bold text-ink uppercase">{activeRound.round_type} Round</span>
                <span className="text-sm font-bold text-success">{fundingPct}%</span>
              </div>
              <Progress value={fundingPct} size="lg" />
              <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
                {[
                  { label: "Target", value: `$${(Number(activeRound.target_amount) / 1e6).toFixed(1)}M` },
                  { label: "Raised", value: `$${(Number(activeRound.amount_raised) / 1e6).toFixed(1)}M` },
                  { label: "Valuation", value: activeRound.valuation ? `$${(Number(activeRound.valuation) / 1e6).toFixed(0)}M` : "TBD" }
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl bg-surface p-3 text-center">
                    <p className="text-muted font-bold">{item.label}</p>
                    <p className="font-bold text-ink mt-1">{item.value}</p>
                  </div>
                ))}
              </div>
              <Link href="/fundraising">
                <Button variant="secondary" size="sm" className="mt-4 gap-1.5">
                  View pipeline →
                </Button>
              </Link>
            </div>
          ) : (
            <div className="rounded-3xl border-2 border-dashed border-border bg-surface p-8 text-center">
              <TrendingUp size={32} className="mx-auto mb-3 text-muted opacity-40" />
              <h3 className="font-bold text-ink mb-1">No active funding round</h3>
              <p className="text-sm text-muted mb-4">Create a round to start tracking investor interest and progress.</p>
              <Link href="/fundraising">
                <Button size="sm" className="gap-2">
                  <Plus size={15} />
                  Create round
                </Button>
              </Link>
            </div>
          )}

          {/* Recent posts */}
          <div className="rounded-3xl border border-border bg-white p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-ink">Recent Posts</h2>
              <Link href="/feed">
                <Button variant="secondary" size="sm">View all</Button>
              </Link>
            </div>
            {activePosts.length === 0 ? (
              <div className="text-center py-6 text-sm text-muted">
                No recent updates posted by your startup.
              </div>
            ) : (
              <div className="space-y-4">
                {activePosts.map((post) => (
                  <div key={post.id} className="rounded-2xl border border-border bg-surface p-4">
                    <p className="text-sm text-muted leading-relaxed line-clamp-2">{post.content}</p>
                    <div className="mt-3 flex items-center gap-4 text-xs font-bold text-muted">
                      <span className="flex items-center gap-1"><Heart size={12} />{post.likes_count}</span>
                      <span className="flex items-center gap-1"><MessageSquare size={12} />{post.comments_count}</span>
                      <span className="flex items-center gap-1"><Share2 size={12} />{post.reposts_count}</span>
                      <span className="ml-auto text-[10px]">{new Date(post.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Link href="/feed" className="block mt-4">
              <Button variant="secondary" size="sm" className="w-full gap-2">
                <Plus size={15} />
                Create new post
              </Button>
            </Link>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          {/* Startup info */}
          <div className="rounded-3xl border border-border bg-white p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="grid size-12 place-items-center rounded-2xl bg-gradient-blue text-white font-bold text-lg">
                {myStartup.name.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-ink">{myStartup.name}</p>
                <p className="text-xs text-muted capitalize">{myStartup.stage} · {myStartup.industry}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Team size</span>
                <span className="font-semibold text-ink">{myStartup.team_size}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Status</span>
                <Badge className={myStartup.is_verified ? "bg-success/10 text-success border-success/20 font-bold text-xs" : "bg-surface border-border text-muted font-bold text-xs"}>
                  {myStartup.is_verified ? "Verified" : "Pending"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Hiring</span>
                <span className={`font-semibold text-sm ${myStartup.is_hiring ? "text-success" : "text-muted"}`}>
                  {myStartup.is_hiring ? "Yes" : "No"}
                </span>
              </div>
            </div>
            <Link href={`/startups/${myStartup.slug}`} className="block mt-4">
              <Button variant="secondary" size="sm" className="w-full gap-1.5">
                <Eye size={15} />
                View public profile
              </Button>
            </Link>
          </div>

          {/* Open jobs */}
          <div className="rounded-3xl border border-border bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-ink">Open Jobs</h2>
              <Link href="/jobs">
                <Button variant="secondary" size="sm">Manage</Button>
              </Link>
            </div>
            {activeJobs.length === 0 ? (
              <div className="text-center py-6 text-sm text-muted">
                No active jobs posted.
              </div>
            ) : (
              activeJobs.slice(0, 3).map((job) => (
                <div key={job.id} className="mb-3 rounded-xl border border-border bg-surface p-3">
                  <p className="font-bold text-sm text-ink">{job.title}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge className="text-[10px] bg-white border-border text-muted font-bold capitalize">{job.type}</Badge>
                    <span className="text-[10px] text-muted">{job.applications_count || 0} applicants</span>
                  </div>
                </div>
              ))
            )}
            <Link href="/jobs" className="block mt-4">
              <Button variant="secondary" size="sm" className="w-full gap-2">
                <Plus size={15} />
                Post new job
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
