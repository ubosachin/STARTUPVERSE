import { redirect } from "next/navigation";
import { createSupabaseServiceClient, getCurrentDbUser } from "@/lib/supabase/server";
import FundraisingClient from "./fundraising-client";

export const revalidate = 0; // Fresh CRM pipeline data

export default async function FundraisingPage() {
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

  // 1. Fetch founder's startup
  const { data: startup } = await supabase
    .from("startups")
    .select("id, name, slug")
    .eq("founder_id", dbUser.id)
    .maybeSingle();

  // If no startup registered, show redirect link
  if (!startup) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-ink">Register a startup first</h2>
        <p className="text-sm text-muted">
          Fundraising pipelines are tied directly to startup profiles. Create a profile to launch rounds and track investor deal stages.
        </p>
        <a href="/startup/create" className="inline-block">
          <button className="rounded-xl bg-primary text-white font-bold px-6 py-3 hover:opacity-90">
            Launch Startup Profile
          </button>
        </a>
      </div>
    );
  }

  // 2. Fetch all rounds for this startup
  const { data: rounds } = await supabase
    .from("funding_rounds")
    .select("*")
    .eq("startup_id", startup.id);

  const activeRound = (rounds || []).find((r) => r.status === "active") || rounds?.[0];

  // 3. Fetch deal flow pipeline for this round
  let pipeline: any[] = [];
  if (activeRound) {
    const { data: dealsData } = await supabase
      .from("deals")
      .select(`
        id,
        investor_id,
        stage,
        notes,
        amount_interest,
        investor:investor_id (
          id,
          email,
          username,
          profiles (
            full_name,
            bio,
            location
          )
        )
      `)
      .eq("startup_id", startup.id);

    if (dealsData) {
      pipeline = dealsData.map((d: any) => {
        const profile = d.investor?.profiles?.[0] || d.investor?.profiles;
        return {
          id: d.id,
          investor_id: d.investor_id,
          stage: d.stage,
          notes: d.notes,
          amount_interest: d.amount_interest,
          name: profile?.full_name || d.investor?.username || "Anonymous Investor",
          location: profile?.location || "Remote",
          title: profile?.bio || "Angel Investor"
        };
      });
    }
  }

  // 4. Fetch registered investors to display in the interaction logging dropdown
  const { data: investorsData } = await supabase
    .from("users")
    .select(`
      id,
      username,
      profiles (
        full_name
      )
    `)
    .eq("role", "investor")
    .neq("id", dbUser.id);

  const availableInvestors = (investorsData || []).map((inv: any) => {
    const profile = inv.profiles?.[0] || inv.profiles;
    return {
      id: inv.id,
      name: profile?.full_name || inv.username || "Investor"
    };
  });

  return (
    <FundraisingClient
      startup={startup}
      initialRounds={rounds || []}
      initialPipeline={pipeline}
      availableInvestors={availableInvestors}
    />
  );
}
