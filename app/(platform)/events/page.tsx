import { redirect } from "next/navigation";
import { createSupabaseServiceClient, getCurrentDbUser } from "@/lib/supabase/server";
import EventsClient from "@/components/events/events-client";

export const revalidate = 0; // Fresh events data

export default async function PlatformEventsPage() {
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

  // 1. Fetch all events
  const { data: events } = await supabase
    .from("events")
    .select("*")
    .order("start_date", { ascending: true });

  // 2. Fetch current user's RSVP IDs
  const { data: rsvps } = await supabase
    .from("event_rsvps")
    .select("event_id")
    .eq("user_id", dbUser.id);

  const rsvpIds = (rsvps || []).map((r) => r.event_id as string);

  return <EventsClient initialEvents={events || []} userRsvpIds={rsvpIds} />;
}
