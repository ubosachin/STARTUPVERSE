"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServiceClient, getCurrentDbUser } from "@/lib/supabase/server";

/**
 * Server action to fetch posts based on recent, trending, or following filters.
 */
export async function getFeedPostsAction(filter: "recent" | "trending" | "following") {
  const dbUser = await getCurrentDbUser();
  const supabase = createSupabaseServiceClient();
  if (!supabase) return [];

  let query = supabase.from("posts").select(`
    *,
    profiles (
      full_name,
      bio,
      avatar_url
    ),
    users (
      username,
      role
    )
  `);

  if (filter === "following" && dbUser) {
    const { data: follows } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", dbUser.id);

    const followedIds = follows?.map((f) => f.following_id) || [];
    followedIds.push(dbUser.id); // Include user's own posts in their following feed

    query = query.in("user_id", followedIds);
  }

  const { data: posts, error } = await query;
  if (error || !posts) {
    console.error("Failed to fetch posts:", error);
    return [];
  }

  // Fetch comments and reactions for all fetched posts
  const postIds = posts.map(p => p.id);
  if (postIds.length === 0) return [];

  const { data: allReactions } = await supabase
    .from("post_reactions")
    .select("*")
    .in("post_id", postIds);

  const { data: allComments } = await supabase
    .from("comments")
    .select(`
      *,
      profiles (
        full_name
      ),
      users (
        username,
        role
      )
    `)
    .in("post_id", postIds)
    .order("created_at", { ascending: true });

  const reactionsMap = new Map<string, any[]>();
  allReactions?.forEach((r) => {
    const arr = reactionsMap.get(r.post_id) || [];
    arr.push(r);
    reactionsMap.set(r.post_id, arr);
  });

  const commentsMap = new Map<string, any[]>();
  allComments?.forEach((c) => {
    const arr = commentsMap.get(c.post_id) || [];
    arr.push(c);
    commentsMap.set(c.post_id, arr);
  });

  const formatted = posts.map((post) => {
    const postReactions = reactionsMap.get(post.id) || [];
    const postComments = commentsMap.get(post.id) || [];

    const counts: Record<string, number> = { Bullish: 0, Insightful: 0, Interested: 0, Support: 0 };
    let userReacted: string | null = null;
    postReactions.forEach((r) => {
      counts[r.type] = (counts[r.type] || 0) + 1;
      if (dbUser && r.user_id === dbUser.id) {
        userReacted = r.type;
      }
    });

    return {
      id: post.id,
      author_id: post.user_id,
      content: post.content,
      visibility: post.visibility,
      media_urls: post.media_urls || [],
      created_at: post.created_at,
      authorName: post.profiles?.full_name || post.users?.username || "Anonymous",
      authorUsername: post.users?.username || "anonymous",
      authorRole: post.users?.role || "Builder",
      authorBio: post.profiles?.bio || "",
      authorAvatarUrl: post.profiles?.avatar_url || "",
      reactionCounts: counts,
      userReacted,
      totalReactions: postReactions.length,
      comments: postComments.map((c) => ({
        id: c.id,
        content: c.content,
        created_at: c.created_at,
        authorName: c.profiles?.full_name || c.users?.username || "Anonymous",
        authorRole: c.users?.role || "Builder"
      })),
      totalComments: postComments.length
    };
  });

  // Apply sorting
  if (filter === "trending") {
    formatted.sort((a, b) => {
      const scoreA = a.totalReactions * 1.5 + a.totalComments * 2;
      const scoreB = b.totalReactions * 1.5 + b.totalComments * 2;
      return scoreB - scoreA;
    });
  } else {
    // recent and following
    formatted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  return formatted;
}

/**
 * Server action to create a new post in the feed.
 */
export async function createPostAction(formData: FormData) {
  const dbUser = await getCurrentDbUser();
  if (!dbUser) {
    return { success: false, error: "You must be signed in to create posts." };
  }

  const content = String(formData.get("content") ?? "").trim();
  const visibility = String(formData.get("visibility") ?? "public");
  const mediaUrl = String(formData.get("mediaUrl") ?? "").trim();
  const startupId = formData.get("startupId") ? String(formData.get("startupId")) : null;

  if (content.length < 2) {
    return { success: false, error: "Post content is too short." };
  }

  const supabase = createSupabaseServiceClient();
  if (!supabase) {
    return { success: false, error: "Database service is not configured." };
  }

  const mediaUrls = mediaUrl ? [mediaUrl] : [];

  const { error } = await supabase.from("posts").insert({
    user_id: dbUser.id,
    content,
    visibility,
    media_urls: mediaUrls,
    startup_id: startupId
  });

  if (error) {
    console.error("Failed to create post:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/feed");
  return { success: true };
}

/**
 * Server action to delete an existing post.
 */
export async function deletePostAction(postId: string) {
  const dbUser = await getCurrentDbUser();
  if (!dbUser) {
    return { success: false, error: "You must be signed in to delete posts." };
  }

  const supabase = createSupabaseServiceClient();
  if (!supabase) {
    return { success: false, error: "Database service is not configured." };
  }

  const { data: post, error: fetchError } = await supabase
    .from("posts")
    .select("user_id")
    .eq("id", postId)
    .single();

  if (fetchError || !post) {
    return { success: false, error: "Post not found or database error." };
  }

  if (post.user_id !== dbUser.id && !dbUser.is_admin) {
    return { success: false, error: "Unauthorized." };
  }

  const { error: deleteError } = await supabase
    .from("posts")
    .delete()
    .eq("id", postId);

  if (deleteError) {
    console.error("Failed to delete post:", deleteError);
    return { success: false, error: deleteError.message };
  }

  revalidatePath("/feed");
  revalidatePath("/admin/posts");
  return { success: true };
}

/**
 * Server action to reaction-toggle a post.
 */
export async function togglePostReactionAction(postId: string, reactionType: string) {
  const dbUser = await getCurrentDbUser();
  if (!dbUser) {
    return { success: false, error: "Authentication required." };
  }

  const supabase = createSupabaseServiceClient();
  if (!supabase) {
    return { success: false, error: "Database not configured." };
  }

  const { data: existingReaction } = await supabase
    .from("post_reactions")
    .select("id, type")
    .eq("post_id", postId)
    .eq("user_id", dbUser.id)
    .maybeSingle();

  if (existingReaction) {
    if (existingReaction.type === reactionType) {
      await supabase.from("post_reactions").delete().eq("id", existingReaction.id);
    } else {
      await supabase
        .from("post_reactions")
        .update({ type: reactionType })
        .eq("id", existingReaction.id);
    }
  } else {
    await supabase.from("post_reactions").insert({
      post_id: postId,
      user_id: dbUser.id,
      type: reactionType
    });

    const { data: post } = await supabase.from("posts").select("user_id").eq("id", postId).single();
    if (post && post.user_id !== dbUser.id) {
      await supabase.from("notifications").insert({
        user_id: post.user_id,
        type: "reaction",
        title: "New post reaction",
        message: `${dbUser.username} reacted to your post.`,
        action_url: "/feed"
      });
    }
  }

  const { count } = await supabase
    .from("post_reactions")
    .select("*", { count: "exact", head: true })
    .eq("post_id", postId);

  const newCount = count || 0;
  await supabase.from("posts").update({ likes_count: newCount }).eq("id", postId);

  revalidatePath("/feed");
  return { success: true, newCount };
}

/**
 * Server action to reply to a post.
 */
export async function addCommentAction(postId: string, content: string) {
  const dbUser = await getCurrentDbUser();
  if (!dbUser) {
    return { success: false, error: "Authentication required." };
  }

  if (!content.trim()) {
    return { success: false, error: "Comment cannot be empty." };
  }

  const supabase = createSupabaseServiceClient();
  if (!supabase) {
    return { success: false, error: "Database not configured." };
  }

  const { error } = await supabase.from("comments").insert({
    post_id: postId,
    user_id: dbUser.id,
    content: content.trim()
  });

  if (error) {
    return { success: false, error: error.message };
  }

  const { count } = await supabase
    .from("comments")
    .select("*", { count: "exact", head: true })
    .eq("post_id", postId);

  const newCount = count || 0;
  await supabase.from("posts").update({ comments_count: newCount }).eq("id", postId);

  const { data: post } = await supabase.from("posts").select("user_id").eq("id", postId).single();
  if (post && post.user_id !== dbUser.id) {
    await supabase.from("notifications").insert({
      user_id: post.user_id,
      type: "comment",
      title: "New post comment",
      message: `${dbUser.username} commented on your post.`,
      action_url: "/feed"
    });
  }

  revalidatePath("/feed");
  return { success: true };
}

/**
 * Server action to bookmark (save) a post.
 */
export async function toggleSavePostAction(postId: string) {
  const dbUser = await getCurrentDbUser();
  if (!dbUser) return { success: false, error: "Authentication required." };

  const supabase = createSupabaseServiceClient();
  if (!supabase) return { success: false, error: "Database not configured." };

  const { data: existing } = await supabase
    .from("saved_posts")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", dbUser.id)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase.from("saved_posts").delete().eq("id", existing.id);
    if (error) return { success: false, error: error.message };
    return { success: true, saved: false };
  } else {
    const { error } = await supabase.from("saved_posts").insert({
      post_id: postId,
      user_id: dbUser.id
    });
    if (error) return { success: false, error: error.message };
    return { success: true, saved: true };
  }
}

/**
 * Server action to fetch all post IDs saved by the current user.
 */
export async function getSavedPostIdsAction() {
  const dbUser = await getCurrentDbUser();
  if (!dbUser) return [];

  const supabase = createSupabaseServiceClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("saved_posts")
    .select("post_id")
    .eq("user_id", dbUser.id);

  return data?.map((d) => d.post_id) || [];
}
