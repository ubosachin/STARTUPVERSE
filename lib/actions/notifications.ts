"use server";

import { createSupabaseServiceClient, getCurrentDbUser } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Fetch all notifications for the logged in user.
 */
export async function getNotificationsAction() {
  const dbUser = await getCurrentDbUser();
  if (!dbUser) return [];

  const supabase = createSupabaseServiceClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", dbUser.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch notifications:", error);
    return [];
  }

  return data || [];
}

/**
 * Mark a specific notification as read.
 */
export async function markNotificationReadAction(notificationId: string) {
  const dbUser = await getCurrentDbUser();
  if (!dbUser) return { success: false, error: "Not authenticated" };

  const supabase = createSupabaseServiceClient();
  if (!supabase) return { success: false, error: "Database not configured" };

  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", notificationId)
    .eq("user_id", dbUser.id);

  if (error) {
    console.error("Failed to mark notification read:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/notifications");
  return { success: true };
}

/**
 * Mark all notifications as read.
 */
export async function markAllNotificationsReadAction() {
  const dbUser = await getCurrentDbUser();
  if (!dbUser) return { success: false, error: "Not authenticated" };

  const supabase = createSupabaseServiceClient();
  if (!supabase) return { success: false, error: "Database not configured" };

  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", dbUser.id)
    .eq("read", false);

  if (error) {
    console.error("Failed to mark all notifications read:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/notifications");
  return { success: true };
}
