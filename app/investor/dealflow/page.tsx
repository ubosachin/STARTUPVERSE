import { redirect } from "next/navigation";
import { createSupabaseServiceClient, getCurrentDbUser } from "@/lib/supabase/server";
import DealflowClient from "./dealflow-client";

export const revalidate = 0; // Disable caching for active marketplace dealflow

export default async function DealflowPage() {
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

  // 1. Fetch all startups with active funding rounds or general active startups
  const { data: startupsData } = await supabase
    .from("startups")
    .select(`
      id,
      name,
      slug,
      tagline,
      industry,
      stage,
      founder_id,
      team_size,
      funding_rounds (
        id,
        round_type,
        target_amount,
        amount_raised,
        valuation,
        status
      )
    `);

  const deals = (startupsData || []).map((s: any) => {
    // Find active round
    const activeRound = (s.funding_rounds || []).find((r: any) => r.status === "active") 
      || (s.funding_rounds || []).find((r: any) => r.status === "planning")
      || s.funding_rounds?.[0];

    return {
      id: s.id,
      name: s.name,
      slug: s.slug,
      tagline: s.tagline,
      industry: s.industry,
      stage: s.stage,
      founder_id: s.founder_id,
      team_size: s.team_size,
      round: activeRound ? {
        id: activeRound.id,
        round_type: activeRound.round_type,
        target_amount: activeRound.target_amount,
        amount_raised: activeRound.amount_raised,
        valuation: activeRound.valuation,
        status: activeRound.status
      } : null
    };
  });

  // 2. Fetch user followed startups
  const { data: followedRecords } = await supabase
    .from("startup_follows")
    .select("startup_id")
    .eq("user_id", dbUser.id);

  const followedIds = (followedRecords || []).map((r: any) => r.startup_id);

  // 3. Fetch user interest rounds
  const { data: expressedDeals } = await supabase
    .from("deals")
    .select("round_id")
    .eq("investor_id", dbUser.id)
    .not("round_id", "is", null);

  const expressedRoundIds = (expressedDeals || []).map((d: any) => d.round_id as string);

  return (
    <DealflowClient
      initialDeals={deals}
      initialFollows={followedIds}
      initialExpressedRounds={expressedRoundIds}
    />
  );
}
