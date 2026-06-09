import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createSupabaseServiceClient, getCurrentDbUser } from "@/lib/supabase/server";
import { UsersClient } from "./users-client";

export const metadata: Metadata = {
  title: "User Management | Admin",
  description: "Manage users on StartupVerse"
};

export const revalidate = 0; // Dynamic data

export default async function AdminUsersPage() {
  const dbUser = await getCurrentDbUser();
  if (!dbUser || !dbUser.is_admin) {
    redirect("/feed");
  }

  const supabase = createSupabaseServiceClient();
  if (!supabase) {
    return (
      <div className="flex h-96 items-center justify-center text-muted">
        Database connection not available.
      </div>
    );
  }

  // Fetch all users with their profile details and posts count
  const { data: users } = await supabase
    .from("users")
    .select(`
      id,
      clerk_id,
      email,
      username,
      role,
      subscription_tier,
      is_admin,
      is_verified,
      created_at,
      profiles (
        full_name,
        avatar_url
      ),
      posts (
        id
      )
    `)
    .order("created_at", { ascending: false });

  // Map to format post counts
  const formattedUsers = (users || []).map((u: any) => ({
    ...u,
    posts: [{ count: u.posts?.length || 0 }]
  }));

  return <UsersClient initialUsers={formattedUsers} />;
}
