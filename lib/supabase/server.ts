import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";

export function createSupabaseServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

/**
 * Helper function to retrieve the current Clerk user and fetch their corresponding 
 * database record from the 'users' table in Supabase.
 */
export async function getCurrentDbUser() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  const supabase = createSupabaseServiceClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("clerk_id", clerkId)
    .single();

  if (error || !data) {
    console.error("Database user resolution failed:", error);
    return null;
  }

  return data;
}

export async function createClient() {
  return createSupabaseServiceClient();
}
