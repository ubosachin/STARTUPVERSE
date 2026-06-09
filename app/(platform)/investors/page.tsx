import { redirect } from "next/navigation";
import { createSupabaseServiceClient, getCurrentDbUser } from "@/lib/supabase/server";
import InvestorsClient from "./investors-client";

export const revalidate = 0; // Dynamic investor listings

export default async function PlatformInvestorsPage() {
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

  // Fetch all investors joined with users and profiles
  const { data: investorsData } = await supabase
    .from("investors")
    .select(`
      id,
      firm_name,
      investment_thesis,
      focus_areas,
      preferred_stages,
      check_size_min,
      check_size_max,
      portfolio_companies,
      user:user_id (
        username,
        profiles (
          full_name,
          avatar_url,
          bio
        )
      )
    `);

  const investors = (investorsData || []).map((inv: any) => {
    const profile = inv.user?.profiles?.[0] || inv.user?.profiles;
    return {
      id: inv.id,
      username: inv.user?.username || "",
      firm_name: inv.firm_name || profile?.full_name || inv.user?.username || "Angel Investor",
      avatarUrl: profile?.avatar_url || "",
      check_size: `${inv.check_size_min || "$50K"}–${inv.check_size_max || "$250K"}`,
      investment_thesis: inv.investment_thesis || profile?.bio || "Active early-stage angel investor.",
      focus_areas: inv.focus_areas || [],
      portfolio_companies: inv.portfolio_companies || [],
      preferred_stages: inv.preferred_stages || ["Seed"]
    };
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink font-sans">Discover Investors</h1>
        <p className="mt-1 text-sm text-muted">{investors.length} active investors with live thesis and check sizes</p>
      </div>

      <InvestorsClient initialInvestors={investors} />
    </div>
  );
}
