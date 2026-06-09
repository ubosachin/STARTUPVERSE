import { redirect } from "next/navigation";
import { createSupabaseServiceClient, getCurrentDbUser } from "@/lib/supabase/server";
import SettingsClient from "./settings-client";

export const revalidate = 0; // Settings page needs fresh data on load

export default async function SettingsPage() {
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

  // Fetch current user's profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", dbUser.id)
    .single();

  return <SettingsClient initialProfile={profile} initialUser={dbUser} />;
}
