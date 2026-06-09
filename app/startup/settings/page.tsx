import { redirect } from "next/navigation";
import { createSupabaseServiceClient, getCurrentDbUser } from "@/lib/supabase/server";
import StartupSettingsClient from "./settings-client";

export const revalidate = 0; // Fresh startup data

export default async function StartupSettingsPage() {
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

  // Fetch startup where user is founder
  const { data: startup } = await supabase
    .from("startups")
    .select("*")
    .eq("founder_id", dbUser.id)
    .maybeSingle();

  if (!startup) {
    redirect("/startup/create");
  }

  return <StartupSettingsClient startup={startup} />;
}
