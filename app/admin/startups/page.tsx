import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createSupabaseServiceClient, getCurrentDbUser } from "@/lib/supabase/server";
import { StartupsClient } from "./startups-client";

export const metadata: Metadata = {
  title: "Startup Auditing | Admin",
  description: "Verify and manage startup profiles on StartupVerse"
};

export const revalidate = 0; // Dynamic data

export default async function AdminStartupsPage() {
  const dbUser = await getCurrentDbUser();

  const supabase = createSupabaseServiceClient();
  if (!supabase) {
    return (
      <div className="flex h-96 items-center justify-center text-muted">
        Database connection not available.
      </div>
    );
  }

  // Fetch all startups with founder details
  const { data: startups } = await supabase
    .from("startups")
    .select(`
      id,
      name,
      slug,
      tagline,
      website,
      stage,
      is_verified,
      founder:founder_id (
        username,
        profiles (
          full_name
        )
      )
    `)
    .order("created_at", { ascending: false });

  const formattedStartups = (startups || []).map((s: any) => {
    const founderName = s.founder?.profiles?.full_name || s.founder?.username || "Founder";
    return {
      id: s.id,
      name: s.name,
      slug: s.slug,
      tagline: s.tagline,
      website: s.website || "",
      stage: s.stage,
      is_verified: s.is_verified,
      founderName
    };
  });

  return <StartupsClient initialStartups={formattedStartups} />;
}
