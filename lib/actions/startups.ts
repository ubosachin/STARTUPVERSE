"use server";

import { createSupabaseServiceClient, getCurrentDbUser } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Server action to create a new startup listing.
 */
export async function createStartupAction(formData: FormData) {
  const dbUser = await getCurrentDbUser();
  if (!dbUser) return { success: false, error: "Authentication required." };

  const name = String(formData.get("name") ?? "").trim();
  const tagline = String(formData.get("tagline") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const industry = String(formData.get("industry") ?? "Software").trim();
  const stage = String(formData.get("stage") ?? "pre-seed").toLowerCase();

  if (!name) return { success: false, error: "Startup name is required." };
  if (!tagline) return { success: false, error: "Tagline is required." };

  const supabase = createSupabaseServiceClient();
  if (!supabase) return { success: false, error: "Database not configured." };

  const slug = slugify(name);

  // Insert startup listing
  const { data: startup, error } = await supabase
    .from("startups")
    .insert({
      founder_id: dbUser.id,
      name,
      slug,
      tagline,
      description,
      industry,
      stage
    })
    .select("id")
    .single();

  if (error) {
    console.error("Failed to create startup:", error);
    return { success: false, error: error.message };
  }

  // Add founder to startup roster automatically
  await supabase.from("startup_members").insert({
    startup_id: startup.id,
    user_id: dbUser.id,
    role: "Founder",
    is_founder: true
  });

  revalidatePath("/startups");
  revalidatePath("/startup/dashboard");
  return { success: true, slug };
}

/**
 * Server action to edit startup details.
 */
export async function updateStartupAction(startupId: string, data: any) {
  const dbUser = await getCurrentDbUser();
  if (!dbUser) return { success: false, error: "Authentication required." };

  const supabase = createSupabaseServiceClient();
  if (!supabase) return { success: false, error: "Database not configured." };

  // Verify authorship (only founder or manager can edit)
  const { data: membership } = await supabase
    .from("startup_members")
    .select("id, is_founder")
    .eq("startup_id", startupId)
    .eq("user_id", dbUser.id)
    .single();

  if (!membership) {
    return { success: false, error: "Unauthorized. You are not a member of this startup team." };
  }

  const { error } = await supabase
    .from("startups")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", startupId);

  if (error) {
    console.error("Failed to update startup:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/startup/dashboard");
  return { success: true };
}

/**
 * Add a team member to a startup.
 */
export async function addStartupMemberAction(startupId: string, userEmail: string, roleName: string) {
  const dbUser = await getCurrentDbUser();
  if (!dbUser) return { success: false, error: "Authentication required." };

  const supabase = createSupabaseServiceClient();
  if (!supabase) return { success: false, error: "Database not configured." };

  // Fetch the target user by email
  const { data: targetUser } = await supabase
    .from("users")
    .select("id")
    .eq("email", userEmail.trim())
    .single();

  if (!targetUser) {
    return { success: false, error: `No registered user found with email: ${userEmail}` };
  }

  const { error } = await supabase.from("startup_members").insert({
    startup_id: startupId,
    user_id: targetUser.id,
    role: roleName.trim(),
    is_founder: false
  });

  if (error) {
    if (error.code === "23505") return { success: false, error: "This user is already a member of your startup." };
    return { success: false, error: error.message };
  }

  revalidatePath("/startup/dashboard");
  return { success: true };
}

/**
 * Launch a new funding round for a startup.
 */
export async function createFundingRoundAction(startupId: string, data: { round_type: string; target_amount: number }) {
  const dbUser = await getCurrentDbUser();
  if (!dbUser) return { success: false, error: "Authentication required." };

  const supabase = createSupabaseServiceClient();
  if (!supabase) return { success: false, error: "Database not configured." };

  const { error } = await supabase.from("funding_rounds").insert({
    startup_id: startupId,
    round_type: data.round_type.toLowerCase(),
    target_amount: data.target_amount,
    amount_raised: 0,
    status: "active"
  });

  if (error) {
    console.error("Failed to create funding round:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/startup/dashboard");
  revalidatePath("/fundraising");
  return { success: true };
}

/**
 * Follow or unfollow a startup.
 */
export async function toggleFollowStartupAction(startupId: string) {
  const dbUser = await getCurrentDbUser();
  if (!dbUser) return { success: false, error: "Authentication required." };

  const supabase = createSupabaseServiceClient();
  if (!supabase) return { success: false, error: "Database not configured." };

  const { data: existingFollow } = await supabase
    .from("startup_follows")
    .select("id")
    .eq("user_id", dbUser.id)
    .eq("startup_id", startupId)
    .maybeSingle();

  if (existingFollow) {
    await supabase.from("startup_follows").delete().eq("id", existingFollow.id);
  } else {
    await supabase.from("startup_follows").insert({
      user_id: dbUser.id,
      startup_id: startupId
    });
  }

  // Re-calculate followers count and update startups table
  const { count } = await supabase
    .from("startup_follows")
    .select("*", { count: "exact", head: true })
    .eq("startup_id", startupId);

  await supabase
    .from("startups")
    .update({ followers_count: count || 0 })
    .eq("id", startupId);

  revalidatePath("/startups");
  return { success: true };
}
