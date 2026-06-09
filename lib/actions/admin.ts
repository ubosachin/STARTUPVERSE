"use server";

import { createSupabaseServiceClient, getCurrentDbUser } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Helper to assert current user is an admin.
 */
async function assertAdmin() {
  const dbUser = await getCurrentDbUser();
  if (!dbUser || !dbUser.is_admin) {
    throw new Error("Unauthorized. Admin access required.");
  }
}

/**
 * Toggle verification status of a user.
 */
export async function adminToggleVerifyUserAction(userId: string) {
  try {
    await assertAdmin();
    const supabase = createSupabaseServiceClient();
    if (!supabase) return { success: false, error: "Database not configured." };

    // Fetch current status
    const { data: user } = await supabase
      .from("users")
      .select("is_verified")
      .eq("id", userId)
      .single();

    if (!user) return { success: false, error: "User not found." };

    const { error } = await supabase
      .from("users")
      .update({ is_verified: !user.is_verified, updated_at: new Date().toISOString() })
      .eq("id", userId);

    if (error) return { success: false, error: error.message };

    revalidatePath("/admin/users");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Toggle verification status of a startup.
 */
export async function adminToggleVerifyStartupAction(startupId: string) {
  try {
    await assertAdmin();
    const supabase = createSupabaseServiceClient();
    if (!supabase) return { success: false, error: "Database not configured." };

    // Fetch current status
    const { data: startup } = await supabase
      .from("startups")
      .select("is_verified")
      .eq("id", startupId)
      .single();

    if (!startup) return { success: false, error: "Startup not found." };

    const { error } = await supabase
      .from("startups")
      .update({ is_verified: !startup.is_verified, updated_at: new Date().toISOString() })
      .eq("id", startupId);

    if (error) return { success: false, error: error.message };

    revalidatePath("/admin/startups");
    revalidatePath("/startups");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Delete a post from the platform.
 */
export async function adminDeletePostAction(postId: string) {
  try {
    await assertAdmin();
    const supabase = createSupabaseServiceClient();
    if (!supabase) return { success: false, error: "Database not configured." };

    const { error } = await supabase
      .from("posts")
      .delete()
      .eq("id", postId);

    if (error) return { success: false, error: error.message };

    revalidatePath("/admin/posts");
    revalidatePath("/feed");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Resolve or dismiss a content report.
 */
export async function adminResolveReportAction(reportId: string, status: "resolved" | "dismissed") {
  try {
    await assertAdmin();
    const supabase = createSupabaseServiceClient();
    if (!supabase) return { success: false, error: "Database not configured." };

    const dbUser = await getCurrentDbUser();

    const { error } = await supabase
      .from("reports")
      .update({
        status,
        reviewed_by: dbUser?.id || null
      })
      .eq("id", reportId);

    if (error) return { success: false, error: error.message };

    revalidatePath("/admin/reports");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
