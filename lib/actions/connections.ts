"use server";

import { createSupabaseServiceClient, getCurrentDbUser } from "@/lib/supabase/server";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

/**
 * Fetch profiles in the network, including connection statuses with the current user.
 */
export async function getNetworkProfilesAction() {
  const dbUser = await getCurrentDbUser();
  const supabase = createSupabaseServiceClient();
  if (!supabase) return [];

  let query = supabase.from("profiles").select(`
    *,
    users (
      username,
      role
    )
  `);

  if (dbUser) {
    query = query.neq("user_id", dbUser.id);
  }

  const { data: profiles, error } = await query;
  if (error || !profiles) {
    console.error("Failed to query network profiles:", error);
    return [];
  }

  if (!dbUser) {
    return profiles.map((p) => ({
      id: p.user_id,
      username: p.users?.username || "anonymous",
      role: p.users?.role || "builder",
      name: p.full_name || "Anonymous",
      bio: p.bio || "Ecosystem member",
      location: p.location || "Remote",
      skills: p.skills || [],
      connectionStatus: null,
      connectionSender: null,
      isFollowing: false,
      isFollowedBy: false
    }));
  }

  // Fetch all connections involving the current user
  const { data: conns } = await supabase
    .from("connections")
    .select("*")
    .or(`requester_id.eq.${dbUser.id},addressee_id.eq.${dbUser.id}`);

  // Fetch follower relationships involving the current user
  const { data: follows } = await supabase
    .from("follows")
    .select("*")
    .or(`follower_id.eq.${dbUser.id},following_id.eq.${dbUser.id}`);

  const connMap = new Map<string, any>();
  conns?.forEach((c) => {
    const partnerId = c.requester_id === dbUser.id ? c.addressee_id : c.requester_id;
    connMap.set(partnerId, c);
  });

  const followingSet = new Set(follows?.filter((f) => f.follower_id === dbUser.id).map((f) => f.following_id) || []);
  const followedBySet = new Set(follows?.filter((f) => f.following_id === dbUser.id).map((f) => f.follower_id) || []);

  return profiles.map((p) => {
    const conn = connMap.get(p.user_id);
    return {
      id: p.user_id,
      username: p.users?.username || "anonymous",
      role: p.users?.role || "builder",
      name: p.full_name || "Anonymous",
      bio: p.bio || "Ecosystem member",
      location: p.location || "Remote",
      skills: p.skills || [],
      connectionStatus: conn ? conn.status : null,
      connectionSender: conn ? conn.requester_id : null,
      isFollowing: followingSet.has(p.user_id),
      isFollowedBy: followedBySet.has(p.user_id)
    };
  });
}

/**
 * Send a connection request to another user.
 */
export async function sendConnectionAction(addresseeId: string, message?: string) {
  const dbUser = await getCurrentDbUser();
  if (!dbUser) return { success: false, error: "You must be signed in to connect." };

  const supabase = createSupabaseServiceClient();
  if (!supabase) return { success: false, error: "Database service not configured." };

  const { error } = await supabase.from("connections").insert({
    requester_id: dbUser.id,
    addressee_id: addresseeId,
    message: message || null,
    status: "pending"
  });

  if (error) {
    if (error.code === "23505") return { success: false, error: "Connection request already exists between you." };
    return { success: false, error: error.message };
  }

  // Create notifications entry
  await supabase.from("notifications").insert({
    user_id: addresseeId,
    type: "connection",
    title: "New connection request",
    message: `${dbUser.username || "A founder"} wants to connect with you on StartupVerse.`,
    action_url: "/network"
  });

  revalidatePath("/network");
  return { success: true };
}

/**
 * Accept a connection request from a requester.
 */
export async function acceptConnectionAction(requesterId: string) {
  const dbUser = await getCurrentDbUser();
  if (!dbUser) return { success: false, error: "Not authenticated" };

  const supabase = createSupabaseServiceClient();
  if (!supabase) return { success: false, error: "Database not configured" };

  const { error } = await supabase
    .from("connections")
    .update({ status: "accepted", updated_at: new Date().toISOString() })
    .eq("requester_id", requesterId)
    .eq("addressee_id", dbUser.id)
    .eq("status", "pending");

  if (error) return { success: false, error: error.message };

  await supabase.from("notifications").insert({
    user_id: requesterId,
    type: "connection",
    title: "Connection request accepted",
    message: `${dbUser.username} accepted your connection request!`,
    action_url: `/network`
  });

  revalidatePath("/network");
  return { success: true };
}

/**
 * Reject/Ignore a pending connection request.
 */
export async function rejectConnectionAction(requesterId: string) {
  const dbUser = await getCurrentDbUser();
  if (!dbUser) return { success: false, error: "Not authenticated" };

  const supabase = createSupabaseServiceClient();
  if (!supabase) return { success: false, error: "Database not configured" };

  const { error } = await supabase
    .from("connections")
    .update({ status: "rejected", updated_at: new Date().toISOString() })
    .eq("requester_id", requesterId)
    .eq("addressee_id", dbUser.id);

  if (error) return { success: false, error: error.message };
  revalidatePath("/network");
  return { success: true };
}

/**
 * Follow another member's profile for posts.
 */
export async function followUserAction(followingId: string) {
  const dbUser = await getCurrentDbUser();
  if (!dbUser) return { success: false, error: "Not authenticated" };

  const supabase = createSupabaseServiceClient();
  if (!supabase) return { success: false, error: "Database not configured" };

  const { error } = await supabase.from("follows").insert({
    follower_id: dbUser.id,
    following_id: followingId
  });

  if (error && error.code !== "23505") return { success: false, error: error.message };
  
  revalidatePath("/network");
  return { success: true };
}

/**
 * Unfollow a member's profile.
 */
export async function unfollowUserAction(followingId: string) {
  const dbUser = await getCurrentDbUser();
  if (!dbUser) return { success: false, error: "Not authenticated" };

  const supabase = createSupabaseServiceClient();
  if (!supabase) return { success: false, error: "Database not configured" };

  const { error } = await supabase.from("follows")
    .delete()
    .eq("follower_id", dbUser.id)
    .eq("following_id", followingId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/network");
  return { success: true };
}
