"use server";

import { createSupabaseServiceClient, getCurrentDbUser } from "@/lib/supabase/server";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export interface ProfileUpdateData {
  full_name?: string;
  headline?: string;
  bio?: string;
  location?: string;
  website?: string;
  linkedin_url?: string;
  twitter_url?: string;
  github_url?: string;
  skills?: string[];
  avatar_url?: string;
  banner_url?: string;
}

/**
 * Server action to update the user's personal/professional profile.
 */
export async function updateProfileAction(data: ProfileUpdateData) {
  const dbUser = await getCurrentDbUser();
  if (!dbUser) return { success: false, error: "You must be signed in to modify your profile." };

  const supabase = createSupabaseServiceClient();
  if (!supabase) return { success: false, error: "Database service not configured." };

  const { error } = await supabase
    .from("profiles")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("user_id", dbUser.id);

  if (error) {
    console.error("Failed to update profile:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/settings");
  revalidatePath(`/users/${dbUser.username}`);
  return { success: true };
}

/**
 * Get profile values of a user.
 */
export async function getProfileAction(userId: string) {
  const supabase = createSupabaseServiceClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error(`Failed to get profile for user ${userId}:`, error);
    return null;
  }

  return data ?? null;
}

/**
 * Update the user's role on StartupVerse.
 */
export async function updateUserRoleAction(role: string) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { success: false, error: "Authentication required." };

  const supabase = createSupabaseServiceClient();
  if (!supabase) return { success: false, error: "Database service not configured." };

  const validRoles = ["founder", "investor", "cofounder", "builder", "advisor", "admin"];
  const safeRole = role.toLowerCase();
  
  if (!validRoles.includes(safeRole)) {
    return { success: false, error: `Invalid role: ${role}. Valid roles are: ${validRoles.join(", ")}` };
  }

  const { error } = await supabase
    .from("users")
    .update({ role: safeRole, updated_at: new Date().toISOString() })
    .eq("clerk_id", clerkId);

  if (error) {
    console.error("Failed to update role:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/settings");
  return { success: true };
}

/**
 * Fetch both the current database user and their profile.
 */
export async function getCurrentUserAndProfile() {
  const dbUser = await getCurrentDbUser();
  if (!dbUser) return null;

  const supabase = createSupabaseServiceClient();
  if (!supabase) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", dbUser.id)
    .maybeSingle();

  return {
    user: dbUser,
    profile
  };
}

/**
 * Update the user's subscription tier and role in the database.
 */
export async function subscribeUserAction(tier: string, role: string) {
  const dbUser = await getCurrentDbUser();
  if (!dbUser) return { success: false, error: "Authentication required." };

  const supabase = createSupabaseServiceClient();
  if (!supabase) return { success: false, error: "Database not configured." };

  const safeTier = tier.toLowerCase().replace(" ", "_");
  const safeRole = role.toLowerCase();

  const { error } = await supabase
    .from("users")
    .update({
      subscription_tier: safeTier,
      role: safeRole,
      updated_at: new Date().toISOString()
    })
    .eq("id", dbUser.id);

  if (error) {
    console.error("Failed to subscribe user:", error);
    return { success: false, error: error.message };
  }

  // Log active subscription record
  await supabase.from("subscriptions").insert({
    user_id: dbUser.id,
    plan: safeTier,
    status: "active"
  });

  revalidatePath("/settings");
  revalidatePath("/pricing");
  return { success: true };
}


