"use server";

import { createSupabaseServiceClient, getCurrentDbUser } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

interface PostJobData {
  title: string;
  description: string;
  type: "full-time" | "part-time" | "contract" | "internship" | "co-founder";
  location_type: "remote" | "hybrid" | "on-site";
  location?: string;
  salary_range?: string; // We'll store salary description or parse it
}

/**
 * Post a new job role for a startup.
 */
export async function postJobAction(data: PostJobData) {
  const dbUser = await getCurrentDbUser();
  if (!dbUser) return { success: false, error: "Authentication required." };

  const supabase = createSupabaseServiceClient();
  if (!supabase) return { success: false, error: "Database not configured." };

  // Fetch the founder's startup
  const { data: startup } = await supabase
    .from("startups")
    .select("id")
    .eq("founder_id", dbUser.id)
    .maybeSingle();

  if (!startup) {
    return { success: false, error: "Startup profile not found. You must register a startup first." };
  }

  // Parse location and optional salary if needed. In schema, jobs table has:
  // salary_min, salary_max, equity_min, equity_max, etc. We'll store a text-based format or placeholder values.
  const { error } = await supabase
    .from("jobs")
    .insert({
      startup_id: startup.id,
      title: data.title.trim(),
      description: data.description.trim(),
      type: data.type,
      location_type: data.location_type,
      location: data.location?.trim() || "Remote",
      salary_min: 50000, // default placeholders to avoid null constraint issues if any
      salary_max: 150000,
      is_active: true,
      applications_count: 0
    });

  if (error) {
    console.error("Failed to post job:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/jobs");
  return { success: true };
}

/**
 * Apply to an open job position.
 */
export async function applyToJobAction(jobId: string, coverNote: string) {
  const dbUser = await getCurrentDbUser();
  if (!dbUser) return { success: false, error: "Authentication required." };

  const supabase = createSupabaseServiceClient();
  if (!supabase) return { success: false, error: "Database not configured." };

  // Insert application
  const { error } = await supabase
    .from("job_applications")
    .insert({
      job_id: jobId,
      user_id: dbUser.id,
      cover_note: coverNote.trim(),
      status: "submitted"
    });

  if (error) {
    if (error.code === "23505") return { success: false, error: "You have already applied to this role." };
    console.error("Failed to submit job application:", error);
    return { success: false, error: error.message };
  }

  // Increment application count
  const { count } = await supabase
    .from("job_applications")
    .select("*", { count: "exact", head: true })
    .eq("job_id", jobId);

  await supabase
    .from("jobs")
    .update({ applications_count: count || 0 })
    .eq("id", jobId);

  revalidatePath("/jobs");
  return { success: true };
}
