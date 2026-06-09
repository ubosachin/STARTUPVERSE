import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createSupabaseServiceClient, getCurrentDbUser } from "@/lib/supabase/server";
import { PostsClient } from "./posts-client";

export const metadata: Metadata = {
  title: "Feed Moderation | Admin",
  description: "Moderate community posts on StartupVerse"
};

export const revalidate = 0; // Dynamic data

export default async function AdminPostsPage() {
  const dbUser = await getCurrentDbUser();

  const supabase = createSupabaseServiceClient();
  if (!supabase) {
    return (
      <div className="flex h-96 items-center justify-center text-muted">
        Database connection not available.
      </div>
    );
  }

  // Fetch posts with author info
  const { data: posts } = await supabase
    .from("posts")
    .select(`
      id,
      content,
      created_at,
      user:user_id (
        username,
        profiles (
          full_name
        )
      )
    `)
    .order("created_at", { ascending: false });

  const formattedPosts = (posts || []).map((p: any) => {
    const authorName = p.user?.profiles?.full_name || p.user?.username || "Builder";
    const authorUsername = p.user?.username || "unknown";
    return {
      id: p.id,
      content: p.content,
      created_at: p.created_at,
      authorName,
      authorUsername
    };
  });

  return <PostsClient initialPosts={formattedPosts} />;
}
