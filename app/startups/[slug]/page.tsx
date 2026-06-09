import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Globe, Linkedin, Twitter, MapPin, Users, TrendingUp,
  Building2, CalendarDays, BadgeDollarSign
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { createSupabaseServiceClient, getCurrentDbUser } from "@/lib/supabase/server";
import { StartupDetailActions } from "./startup-detail-actions";

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createSupabaseServiceClient();
  if (!supabase) return { title: "Startup Not Found" };

  const { data: startup } = await supabase
    .from("startups")
    .select("name, tagline")
    .eq("slug", slug)
    .maybeSingle();

  if (!startup) return { title: "Startup Not Found" };

  return {
    title: startup.name,
    description: startup.tagline
  };
}

export default async function StartupProfilePage({ params }: Props) {
  const { slug } = await params;
  const supabase = createSupabaseServiceClient();
  if (!supabase) notFound();

  // 1. Fetch startup details
  const { data: startup } = await supabase
    .from("startups")
    .select(`
      *,
      founder:founder_id (
        id,
        username,
        profiles (
          full_name
        )
      )
    `)
    .eq("slug", slug)
    .maybeSingle();

  if (!startup) notFound();

  // 2. Fetch jobs
  const { data: jobs } = await supabase
    .from("jobs")
    .select("*")
    .eq("startup_id", startup.id);

  // 3. Fetch active rounds
  const { data: rounds } = await supabase
    .from("funding_rounds")
    .select("*")
    .eq("startup_id", startup.id)
    .eq("status", "active");

  const dbUser = await getCurrentDbUser();

  // 4. Fetch follow status
  let isFollowing = false;
  if (dbUser) {
    const { data: follow } = await supabase
      .from("startup_follows")
      .select("id")
      .eq("user_id", dbUser.id)
      .eq("startup_id", startup.id)
      .maybeSingle();
    isFollowing = !!follow;
  }

  const founderName = startup.founder?.profiles?.full_name || startup.founder?.username || "Founder";
  const activeJobs = jobs || [];
  const activeRounds = rounds || [];

  const round = activeRounds[0];
  const fundingProgress = round
    ? (round.amount_raised / round.target_amount) * 100
    : 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-6">
      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-dark h-36 sm:h-48">
        {startup.banner_url ? (
          <img
            src={startup.banner_url}
            alt={`${startup.name} Banner`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="gradient-mesh absolute inset-0 opacity-50" />
        )}
      </div>

      {/* Profile header card */}
      <div className="rounded-3xl border border-border bg-white p-6 -mt-14 relative">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
          <div className="flex items-end gap-5">
            {/* Logo */}
            {startup.logo_url ? (
              <img
                src={startup.logo_url}
                alt={`${startup.name} Logo`}
                className="w-24 h-24 rounded-3xl border-4 border-white shadow-soft object-cover -mt-12 bg-white shrink-0"
              />
            ) : (
              <div className="grid size-24 shrink-0 place-items-center rounded-3xl bg-gradient-blue text-white font-bold text-4xl shadow-glow border-4 border-white -mt-12 bg-white">
                {startup.name.charAt(0)}
              </div>
            )}
            <div className="pb-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold tracking-tight text-ink">{startup.name}</h1>
                {startup.is_verified && (
                  <Badge className="bg-primary/10 border-primary/20 text-primary font-bold text-xs">✓ Verified</Badge>
                )}
                {startup.is_hiring && (
                  <Badge className="bg-success/10 border-success/20 text-success font-bold text-xs">● Hiring</Badge>
                )}
              </div>
              <p className="mt-1 text-muted">{startup.tagline}</p>
              <div className="mt-2 flex items-center gap-3 text-xs text-muted flex-wrap">
                <span className="flex items-center gap-1"><Building2 size={12} />{startup.industry}</span>
                <span className="flex items-center gap-1"><TrendingUp size={12} />{startup.stage}</span>
                {startup.location && <span className="flex items-center gap-1"><MapPin size={12} />{startup.location}</span>}
                <span className="flex items-center gap-1"><Users size={12} />{startup.team_size} team members</span>
                {startup.founded_year && <span className="flex items-center gap-1"><CalendarDays size={12} />Founded {startup.founded_year}</span>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:flex-col sm:items-end">
            <StartupDetailActions
              startupId={startup.id}
              founderId={startup.founder_id}
              founderUsername={startup.founder?.username || "founder"}
              hasActiveRound={activeRounds.length > 0}
              roundId={round?.id}
              isFollowingInitial={isFollowing}
              currentUserId={dbUser?.id}
            />
          </div>
        </div>

        {/* Social links */}
        <div className="mt-5 flex items-center gap-3">
          {startup.website && (
            <a href={startup.website} target="_blank" rel="noopener noreferrer" className="grid size-9 place-items-center rounded-xl border border-border bg-surface text-muted transition hover:border-primary hover:text-primary">
              <Globe size={15} />
            </a>
          )}
          {startup.linkedin_url && (
            <a href={startup.linkedin_url} target="_blank" rel="noopener noreferrer" className="grid size-9 place-items-center rounded-xl border border-border bg-surface text-muted transition hover:border-primary hover:text-primary">
              <Linkedin size={15} />
            </a>
          )}
          {startup.twitter_url && (
            <a href={startup.twitter_url} target="_blank" rel="noopener noreferrer" className="grid size-9 place-items-center rounded-xl border border-border bg-surface text-muted transition hover:border-primary hover:text-primary">
              <Twitter size={15} />
            </a>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* About */}
          <div className="rounded-3xl border border-border bg-white p-6">
            <h2 className="font-bold text-ink mb-3">About {startup.name}</h2>
            <p className="text-sm text-muted leading-relaxed whitespace-pre-wrap">{startup.description}</p>
          </div>

          {/* Tech stack */}
          {startup.tech_stack && startup.tech_stack.length > 0 && (
            <div className="rounded-3xl border border-border bg-white p-6">
              <h2 className="font-bold text-ink mb-3">Tech Stack</h2>
              <div className="flex flex-wrap gap-2">
                {startup.tech_stack.map((tech: string) => (
                  <Badge key={tech} className="bg-surface border-border text-muted font-bold">{tech}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Open jobs */}
          {activeJobs.length > 0 && (
            <div className="rounded-3xl border border-border bg-white p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-ink">Open Positions</h2>
                <Link href="/jobs" className="text-xs font-bold text-primary hover:underline">View all →</Link>
              </div>
              <div className="space-y-3">
                {activeJobs.slice(0, 4).map((job) => (
                  <div key={job.id} className="flex items-center justify-between rounded-2xl border border-border bg-surface p-4">
                    <div>
                      <p className="font-bold text-sm text-ink">{job.title}</p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <Badge className="text-[10px] bg-white border-border text-muted font-bold">{job.type}</Badge>
                        <Badge className="text-[10px] bg-white border-border text-muted font-bold">{job.location_type}</Badge>
                        {job.equity_min && (
                          <Badge className="text-[10px] bg-emerald-50 border-emerald-100 text-emerald-700 font-bold">{job.equity_min}–{job.equity_max}% equity</Badge>
                        )}
                      </div>
                    </div>
                    <Link href={`/jobs?jobId=${job.id}`}>
                      <Button size="sm" variant="secondary">View</Button>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          {/* Funding progress */}
          {round && (
            <div className="rounded-3xl border border-border bg-white p-6">
              <h2 className="font-bold text-ink mb-4 flex items-center gap-2">
                <BadgeDollarSign size={18} className="text-primary" />
                Active Round
              </h2>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-bold text-ink capitalize">{round.round_type}</span>
                  <span className="text-sm font-bold text-success">{Math.round(fundingProgress)}%</span>
                </div>
                <Progress value={fundingProgress} />
                <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl bg-surface p-3">
                    <p className="text-muted font-bold">Target</p>
                    <p className="font-bold text-ink mt-1">${(round.target_amount / 1e6).toFixed(1)}M</p>
                  </div>
                  <div className="rounded-xl bg-surface p-3">
                    <p className="text-muted font-bold">Raised</p>
                    <p className="font-bold text-success mt-1">${(round.amount_raised / 1e6).toFixed(1)}M</p>
                  </div>
                </div>
                {round.valuation && (
                  <div className="mt-3 rounded-xl bg-surface p-3 text-xs">
                    <p className="text-muted font-bold">Valuation</p>
                    <p className="font-bold text-ink mt-1">${(round.valuation / 1e6).toFixed(0)}M</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Company info */}
          <div className="rounded-3xl border border-border bg-white p-6 space-y-3">
            <h2 className="font-bold text-ink">Company Info</h2>
            {[
              { label: "Stage", value: startup.stage },
              { label: "Industry", value: startup.industry },
              { label: "Team size", value: `${startup.team_size} people` },
              ...(startup.founded_year ? [{ label: "Founded", value: String(startup.founded_year) }] : []),
              ...(startup.location ? [{ label: "HQ", value: startup.location }] : []),
              ...(startup.business_model ? [{ label: "Business model", value: startup.business_model }] : [])
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between text-sm">
                <span className="text-muted">{item.label}</span>
                <span className="font-semibold text-ink capitalize">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
