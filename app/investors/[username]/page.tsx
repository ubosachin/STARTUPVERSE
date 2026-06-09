import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  BadgeDollarSign, TrendingUp, Building2, ChevronRight, Star
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { createSupabaseServiceClient, getCurrentDbUser } from "@/lib/supabase/server";
import { InvestorDetailActions } from "./investor-detail-actions";

interface Props { params: Promise<{ username: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const supabase = createSupabaseServiceClient();
  if (!supabase) return { title: "Investor Profile" };

  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  if (!user) return { title: "Investor Profile" };

  const { data: investor } = await supabase
    .from("investors")
    .select("firm_name")
    .eq("user_id", user.id)
    .maybeSingle();

  return {
    title: investor?.firm_name || `${username} | Investor Profile`,
    description: `Investor profile on StartupVerse`
  };
}

export default async function InvestorProfilePage({ params }: Props) {
  const { username } = await params;
  const supabase = createSupabaseServiceClient();
  if (!supabase) notFound();

  // 1. Fetch user record
  const { data: user } = await supabase
    .from("users")
    .select("id, username, role")
    .eq("username", username)
    .maybeSingle();

  if (!user) notFound();

  // 2. Fetch investor details
  const { data: investor } = await supabase
    .from("investors")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!investor) notFound();

  // 3. Fetch user profile (to display avatar & name)
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("user_id", user.id)
    .maybeSingle();

  const dbUser = await getCurrentDbUser();

  const displayName = investor.firm_name || profile?.full_name || username;
  const portfolio = investor.portfolio_companies || [];
  const thesis = investor.investment_thesis || "No investment thesis provided.";

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-6">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-dark h-32 sm:h-44">
        <div className="gradient-mesh absolute inset-0 opacity-40" />
      </div>

      {/* Header */}
      <div className="rounded-3xl border border-border bg-white p-6 -mt-12 relative">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
          <div className="flex items-end gap-5">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={displayName}
                className="w-24 h-24 rounded-full border-4 border-white shadow-soft object-cover bg-white -mt-10"
              />
            ) : (
              <Avatar name={displayName} size="xl" className="border-4 border-white shadow-soft -mt-10 bg-white" />
            )}
            <div className="pb-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold tracking-tight text-ink">{displayName}</h1>
                <Badge className="bg-emerald-50 border-emerald-100 text-emerald-700 font-bold text-xs">● Active investor</Badge>
              </div>
              <p className="mt-2 text-sm text-muted max-w-xl leading-relaxed line-clamp-2">{thesis}</p>
              <div className="mt-2 flex items-center gap-4 text-xs font-semibold text-muted flex-wrap">
                {investor.check_size_min && (
                  <span className="flex items-center gap-1">
                    <BadgeDollarSign size={12} />
                    {investor.check_size_min}–{investor.check_size_max || "No Max"}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Building2 size={12} />
                  {portfolio.length} portfolio companies
                </span>
                {investor.preferred_stages && investor.preferred_stages.length > 0 && (
                  <span className="flex items-center gap-1">
                    <TrendingUp size={12} />
                    <span className="capitalize">{investor.preferred_stages.join(", ")}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <InvestorDetailActions
              investorId={investor.id}
              investorUserId={investor.user_id}
              firmName={displayName}
              currentUserId={dbUser?.id}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left */}
        <div className="lg:col-span-2 space-y-6">
          {/* Thesis */}
          <div className="rounded-3xl border border-border bg-white p-6">
            <h2 className="font-bold text-ink mb-3">Investment Thesis</h2>
            <p className="text-sm text-muted leading-relaxed whitespace-pre-wrap">{thesis}</p>
          </div>

          {/* Focus areas */}
          {investor.focus_areas && investor.focus_areas.length > 0 && (
            <div className="rounded-3xl border border-border bg-white p-6">
              <h2 className="font-bold text-ink mb-4">Focus Areas</h2>
              <div className="flex flex-wrap gap-2">
                {investor.focus_areas.map((area: string) => (
                  <Badge key={area} className="text-sm bg-surface border-border text-ink font-bold">{area}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Portfolio */}
          {portfolio.length > 0 && (
            <div className="rounded-3xl border border-border bg-white p-6">
              <h2 className="font-bold text-ink mb-4">Portfolio Companies</h2>
              <div className="space-y-3">
                {portfolio.map((company: string) => (
                  <div key={company} className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-4">
                    <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-blue text-white font-bold text-sm">
                      {company.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-ink">{company}</p>
                      <p className="text-xs text-muted">Portfolio company</p>
                    </div>
                    <ChevronRight size={16} className="ml-auto text-muted" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: quick facts */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-border bg-white p-6 space-y-4">
            <h2 className="font-bold text-ink">Quick Facts</h2>
            {[
              { label: "Check size", value: `${investor.check_size_min || "Undisclosed"}–${investor.check_size_max || "Undisclosed"}` },
              { label: "Preferred stages", value: investor.preferred_stages?.join(", ") || "Early-stage" },
              { label: "Portfolio size", value: `${portfolio.length} companies` },
              ...(investor.lead_investor ? [{ label: "Lead investor", value: "Yes" }] : []),
              ...(investor.board_member ? [{ label: "Takes board seat", value: "Yes" }] : [])
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between text-sm">
                <span className="text-muted">{item.label}</span>
                <span className="font-semibold text-ink text-right capitalize">{item.value}</span>
              </div>
            ))}
          </div>

          <div className="rounded-3xl border border-border bg-primary/5 p-6 text-center">
            <Star className="mx-auto mb-3 text-primary" size={28} />
            <p className="font-bold text-ink mb-2">Ready to pitch?</p>
            <p className="text-xs text-muted mb-4">Send your pitch deck directly through StartupVerse.</p>
            <Button className="w-full">Send pitch</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
