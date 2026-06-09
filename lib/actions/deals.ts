"use server";

import { createSupabaseServiceClient, getCurrentDbUser } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Express interest in a startup's active funding round.
 */
export async function expressInterestAction(startupId: string, roundId: string) {
  const dbUser = await getCurrentDbUser();
  if (!dbUser) return { success: false, error: "Authentication required." };

  const supabase = createSupabaseServiceClient();
  if (!supabase) return { success: false, error: "Database not configured." };

  const { error } = await supabase
    .from("deals")
    .upsert({
      investor_id: dbUser.id,
      startup_id: startupId,
      round_id: roundId,
      stage: "interested"
    }, { onConflict: "investor_id,startup_id" });

  if (error) {
    console.error("Failed to express interest:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/investor/dealflow");
  revalidatePath("/investor/dashboard");
  return { success: true };
}

/**
 * Update pipeline stage of a deal. Accessible to both the investor and founder.
 */
export async function updateDealStageAction(dealId: string, stage: string) {
  const dbUser = await getCurrentDbUser();
  if (!dbUser) return { success: false, error: "Authentication required." };

  const supabase = createSupabaseServiceClient();
  if (!supabase) return { success: false, error: "Database not configured." };

  // Allow update if user is the investor OR the founder of the startup associated with the deal
  const { data: deal } = await supabase
    .from("deals")
    .select("id, investor_id, startup:startup_id (founder_id)")
    .eq("id", dealId)
    .single();

  if (!deal) return { success: false, error: "Deal not found." };

  const isInvestor = deal.investor_id === dbUser.id;
  const isFounder = (deal.startup as any)?.founder_id === dbUser.id;

  if (!isInvestor && !isFounder) {
    return { success: false, error: "Unauthorized to modify this deal." };
  }

  const { error } = await supabase
    .from("deals")
    .update({ stage, updated_at: new Date().toISOString() })
    .eq("id", dealId);

  if (error) {
    console.error("Failed to update deal stage:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/investor/dealflow");
  revalidatePath("/fundraising");
  return { success: true };
}

/**
 * Save notes for a specific startup.
 */
export async function updateDealNotesAction(startupId: string, notes: string) {
  const dbUser = await getCurrentDbUser();
  if (!dbUser) return { success: false, error: "Authentication required." };

  const supabase = createSupabaseServiceClient();
  if (!supabase) return { success: false, error: "Database not configured." };

  const { error } = await supabase
    .from("deals")
    .upsert({
      investor_id: dbUser.id,
      startup_id: startupId,
      notes,
      stage: "contacted" // default stage if new
    }, { onConflict: "investor_id,startup_id" });

  if (error) {
    console.error("Failed to update deal notes:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/investor/watchlist");
  revalidatePath("/investor/dealflow");
  return { success: true };
}

/**
 * Log an investor interaction/deal from the founder's side.
 */
export async function logDealAction(data: {
  investorId: string;
  startupId: string;
  roundId?: string;
  stage: string;
  notes?: string;
}) {
  const dbUser = await getCurrentDbUser();
  if (!dbUser) return { success: false, error: "Authentication required." };

  const supabase = createSupabaseServiceClient();
  if (!supabase) return { success: false, error: "Database not configured." };

  // Verify user is founder of startupId
  const { data: startup } = await supabase
    .from("startups")
    .select("founder_id")
    .eq("id", data.startupId)
    .single();

  if (!startup || startup.founder_id !== dbUser.id) {
    return { success: false, error: "Unauthorized. You do not own this startup profile." };
  }

  const { error } = await supabase
    .from("deals")
    .upsert({
      investor_id: data.investorId,
      startup_id: data.startupId,
      round_id: data.roundId || null,
      stage: data.stage,
      notes: data.notes || ""
    }, { onConflict: "investor_id,startup_id" });

  if (error) {
    console.error("Failed to log deal:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/fundraising");
  return { success: true };
}

/**
 * Delete a deal flow record (or remove from watch/pipeline).
 */
export async function removeDealAction(startupId: string) {
  const dbUser = await getCurrentDbUser();
  if (!dbUser) return { success: false, error: "Authentication required." };

  const supabase = createSupabaseServiceClient();
  if (!supabase) return { success: false, error: "Database not configured." };

  const { error } = await supabase
    .from("deals")
    .delete()
    .eq("investor_id", dbUser.id)
    .eq("startup_id", startupId);

  if (error) {
    console.error("Failed to delete deal:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/investor/watchlist");
  revalidatePath("/investor/dealflow");
  return { success: true };
}
