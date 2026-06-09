import { redirect } from "next/navigation";
import { createSupabaseServiceClient, getCurrentDbUser } from "@/lib/supabase/server";
import StartupsClient from "./startups-client";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const revalidate = 0; // Dynamic startups directory

export default async function PlatformStartupsPage() {
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

  // Fetch all startups
  const { data: startups } = await supabase
    .from("startups")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink font-sans">Discover Startups</h1>
          <p className="mt-1 text-sm text-muted">{(startups || []).length} verified companies raising, hiring, and building</p>
        </div>
        <Link href="/startup/create">
          <Button size="sm" className="gap-2">
            <Building2 size={15} />
            Add your startup
          </Button>
        </Link>
      </div>

      <StartupsClient initialStartups={startups || []} />
    </div>
  );
}
