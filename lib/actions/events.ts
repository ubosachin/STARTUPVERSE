"use server";

import { createSupabaseServiceClient, getCurrentDbUser } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * RSVP to an event (toggle join/leave state).
 */
export async function toggleRsvpAction(eventId: string) {
  const dbUser = await getCurrentDbUser();
  if (!dbUser) return { success: false, error: "Authentication required." };

  const supabase = createSupabaseServiceClient();
  if (!supabase) return { success: false, error: "Database not configured." };

  // Check if RSVP already exists
  const { data: existing } = await supabase
    .from("event_rsvps")
    .select("id")
    .eq("event_id", eventId)
    .eq("user_id", dbUser.id)
    .maybeSingle();

  if (existing) {
    // Delete RSVP
    const { error } = await supabase
      .from("event_rsvps")
      .delete()
      .eq("id", existing.id);

    if (error) return { success: false, error: error.message };
  } else {
    // Check if event is full
    const { data: event } = await supabase
      .from("events")
      .select("max_attendees")
      .eq("id", eventId)
      .single();

    if (event && event.max_attendees) {
      const { count } = await supabase
        .from("event_rsvps")
        .select("*", { count: "exact", head: true })
        .eq("event_id", eventId);

      if (count !== null && count >= event.max_attendees) {
        return { success: false, error: "Event is already at full capacity." };
      }
    }

    // Insert RSVP
    const { error } = await supabase
      .from("event_rsvps")
      .insert({
        event_id: eventId,
        user_id: dbUser.id
      });

    if (error) return { success: false, error: error.message };
  }

  // Update attendees count cached in the event table
  const { count } = await supabase
    .from("event_rsvps")
    .select("*", { count: "exact", head: true })
    .eq("event_id", eventId);

  await supabase
    .from("events")
    .update({ attendees_count: count || 0 })
    .eq("id", eventId);

  revalidatePath("/events");
  return { success: true };
}

/**
 * Create a new platform event.
 */
export async function createEventAction(formData: FormData) {
  const dbUser = await getCurrentDbUser();
  if (!dbUser) return { success: false, error: "Authentication required." };

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const event_type = String(formData.get("event_type") ?? "virtual").toLowerCase();
  const category = String(formData.get("category") ?? "networking").toLowerCase();
  const location = String(formData.get("location") ?? "").trim();
  const meeting_url = String(formData.get("meeting_url") ?? "").trim();
  const start_date = String(formData.get("start_date") ?? "");
  const max_attendees = Number(formData.get("max_attendees")) || null;

  if (!title) return { success: false, error: "Event title is required." };
  if (!start_date) return { success: false, error: "Start date/time is required." };

  const supabase = createSupabaseServiceClient();
  if (!supabase) return { success: false, error: "Database not configured." };

  // Fetch startup if user is a founder
  const { data: startup } = await supabase
    .from("startups")
    .select("id")
    .eq("founder_id", dbUser.id)
    .maybeSingle();

  const { error } = await supabase
    .from("events")
    .insert({
      organizer_id: dbUser.id,
      startup_id: startup?.id || null,
      title,
      description,
      event_type,
      category,
      location,
      meeting_url: event_type === "virtual" ? meeting_url : null,
      start_date: new Date(start_date).toISOString(),
      max_attendees,
      attendees_count: 0
    });

  if (error) {
    console.error("Failed to create event:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/events");
  return { success: true };
}
