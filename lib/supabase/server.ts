import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { auth, currentUser } from "@clerk/nextjs/server";

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
    console.error("Database user resolution failed, attempting to fallback and create user:", error);
    // Fallback: create user if they don't exist
    const user = await currentUser();
    if (!user) return null;

    const email = user.emailAddresses[0]?.emailAddress || "";
    const username = user.username || user.firstName || email.split("@")[0] || "user";
    const role = (user.unsafeMetadata?.role as string) || "builder";

    // Insert user
    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert({
        clerk_id: clerkId,
        email,
        username,
        role
      })
      .select()
      .single();

    if (insertError || !newUser) {
      console.error("Failed to create user fallback:", insertError);
      return null;
    }
    
    // Also create profile
    await supabase.from("profiles").insert({
      user_id: newUser.id,
      full_name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || username,
      avatar_url: user.imageUrl || ""
    });

    return newUser;
  }

  return data;
}

export async function createClient() {
  return createSupabaseServiceClient();
}
