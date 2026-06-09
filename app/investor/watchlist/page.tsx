import { redirect } from "next/navigation";
import { createSupabaseServiceClient, getCurrentDbUser } from "@/lib/supabase/server";
import WatchlistClient from "./watchlist-client";

export const revalidate = 0; // Disable caching for dynamic data

export default async function InvestorWatchlistPage() {
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

  // 1. Fetch followed startups
  const { data: followedRecords } = await supabase
    .from("startup_follows")
    .select(`
      startup:startup_id (
        id,
        name,
        slug,
        tagline,
        stage,
        industry,
        is_hiring
      )
    `)
    .eq("user_id", dbUser.id);

  const watchlist = (followedRecords || [])
    .map((r: any) => r.startup)
    .filter(Boolean);

  // 2. Fetch investor deals (to extract notes)
  const { data: deals } = await supabase
    .from("deals")
    .select("startup_id, notes")
    .eq("investor_id", dbUser.id);

  const notesMap: Record<string, string> = {};
  if (deals) {
    deals.forEach((d: any) => {
      if (d.notes) {
        notesMap[d.startup_id] = d.notes;
      }
    });
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">Watchlist</h1>
        <p className="mt-1 text-sm text-muted">{watchlist.length} startups you&apos;re tracking</p>
      </div>

      <WatchlistClient initialWatchlist={watchlist} initialNotes={notesMap} />
    </div>
  );
}
