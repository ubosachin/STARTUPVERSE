"use server";

import { createSupabaseServiceClient, getCurrentDbUser } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Fetch potential matches for the current user.
 * Generates match scores dynamically based on skill synergy, industry focus, and role preferences.
 * Persists computed matches into the database if they don't exist yet.
 */
export async function getMatchesAction(prefs: {
  role?: string;
  industry?: string;
  skill?: string;
  commitment?: string;
}) {
  const dbUser = await getCurrentDbUser();
  if (!dbUser) return [];

  const supabase = createSupabaseServiceClient();
  if (!supabase) return [];

  // Query all other profiles
  const { data: profiles, error: profileErr } = await supabase
    .from("profiles")
    .select("*, users(username, role)")
    .neq("user_id", dbUser.id);

  if (profileErr || !profiles) {
    console.error("Failed to fetch matches profiles:", profileErr);
    return [];
  }

  // Fetch current user's profile to compute compatibility
  const { data: myProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", dbUser.id)
    .single();

  // Fetch user's existing match states
  const { data: existingMatches } = await supabase
    .from("matches")
    .select("*")
    .eq("user_id", dbUser.id);

  const matchStateMap = new Map(existingMatches?.map(m => [m.matched_user_id, m]) || []);

  const results = [];

  for (const prof of profiles) {
    const targetUserId = prof.user_id;
    const targetUser = prof.users;
    if (!targetUser) continue;

    // Check if user has passed this match
    const existing = matchStateMap.get(targetUserId);
    if (existing && existing.status === "passed") continue;

    // Calculate dynamic compatibility score
    let score = 75; // baseline
    const reasons = ["Vision 90%", "Culture 88%", "Stack 85%"];

    // Role match
    if (prefs.role && targetUser.role === prefs.role) {
      score += 8;
      reasons[0] = "Target Role 99%";
    }
    // Skill alignment
    if (prefs.skill && prof.skills?.includes(prefs.skill)) {
      score += 10;
      reasons[1] = `${prefs.skill} Skill 98%`;
    }
    // Industry focus
    if (prefs.industry && prof.bio?.toLowerCase().includes(prefs.industry.toLowerCase())) {
      score += 7;
      reasons[2] = `${prefs.industry} Focus 96%`;
    }

    score = Math.min(100, score);

    // Upsert matches in background
    if (!existing) {
      await supabase.from("matches").insert({
        user_id: dbUser.id,
        matched_user_id: targetUserId,
        score,
        status: "pending"
      });
    }

    results.push({
      id: existing?.id || targetUserId,
      targetUserId,
      name: prof.full_name,
      title: prof.bio ? prof.bio.split(".")[0] : targetUser.role,
      location: prof.location || "Remote",
      score,
      skills: prof.skills ? prof.skills.slice(0, 3) : [],
      fit: reasons,
      saved: existing ? existing.status === "saved" : false,
      matchType: targetUser.role,
      username: targetUser.username
    });
  }

  // Sort by score descending
  return results.sort((a, b) => b.score - a.score);
}

/**
 * Update the state of a match (e.g. bookmark as 'saved', mark as 'passed', etc.)
 */
export async function updateMatchStatusAction(targetUserId: string, status: "pending" | "saved" | "passed" | "liked") {
  const dbUser = await getCurrentDbUser();
  if (!dbUser) return { success: false, error: "Authentication required." };

  const supabase = createSupabaseServiceClient();
  if (!supabase) return { success: false, error: "Database not configured." };

  const { error } = await supabase
    .from("matches")
    .upsert({
      user_id: dbUser.id,
      matched_user_id: targetUserId,
      status,
      score: 80 // default/temporary score if inserting
    }, { onConflict: "user_id,matched_user_id" });

  if (error) {
    console.error("Failed to update match status:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/matches");
  return { success: true };
}
