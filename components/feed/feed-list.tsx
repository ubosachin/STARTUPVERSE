"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bookmark, MessageSquare, Send, Heart, Flame, Compass, Award, Loader2, Sparkles, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  getFeedPostsAction, 
  togglePostReactionAction, 
  addCommentAction, 
  toggleSavePostAction,
  getSavedPostIdsAction
} from "@/lib/actions/posts";

const reactionEmojis: Record<string, string> = {
  Bullish: "🐂",
  Insightful: "💡",
  Interested: "🤝",
  Support: "🌟"
};

export function FeedList({ filter, refreshTrigger }: { filter: "recent" | "trending" | "following"; refreshTrigger: number }) {
  const [posts, setPosts] = useState<any[]>([]);
  const [savedPosts, setSavedPosts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeCommentsPostId, setActiveCommentsPostId] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState("");
  const [commentingPostId, setCommentingPostId] = useState<string | null>(null);
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [filter, refreshTrigger]);

  async function loadData() {
    setIsLoading(true);
    setError(null);
    try {
      const postsData = await getFeedPostsAction(filter);
      const savedIds = await getSavedPostIdsAction();
      setPosts(postsData);
      setSavedPosts(savedIds);
    } catch (err: any) {
      setError(err.message || "Failed to load feed posts.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleReaction(postId: string, reactionType: string) {
    try {
      const res = await togglePostReactionAction(postId, reactionType);
      if (res.success) {
        // Optimistic / instant local update
        setPosts((prev) =>
          prev.map((post) => {
            if (post.id !== postId) return post;
            
            const counts = { ...post.reactionCounts };
            const wasActive = post.userReacted === reactionType;

            // Decrement previous reaction count if user had one
            if (post.userReacted) {
              counts[post.userReacted] = Math.max(0, (counts[post.userReacted] || 1) - 1);
            }

            // Increment new reaction if toggling it on
            if (!wasActive) {
              counts[reactionType] = (counts[reactionType] || 0) + 1;
            }

            return {
              ...post,
              userReacted: wasActive ? null : reactionType,
              reactionCounts: counts,
              totalReactions: res.newCount ?? post.totalReactions
            };
          })
        );
      }
    } catch (err) {
      console.error("Failed to react to post:", err);
    }
  }

  async function handleAddComment(e: React.FormEvent, postId: string) {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    setCommentingPostId(postId);
    try {
      const res = await addCommentAction(postId, newCommentText);
      if (res.success) {
        setNewCommentText("");
        // Refresh posts to update comments list
        const postsData = await getFeedPostsAction(filter);
        setPosts(postsData);
      }
    } catch (err) {
      console.error("Failed to add comment:", err);
    } finally {
      setCommentingPostId(null);
    }
  }

  function handleShare(postId: string) {
    const url = typeof window !== "undefined" ? `${window.location.origin}/posts/${postId}` : "";
    navigator.clipboard.writeText(url);
    setCopiedPostId(postId);
    setTimeout(() => setCopiedPostId(null), 2000);
  }

  async function handleSave(postId: string) {
    try {
      const res = await toggleSavePostAction(postId);
      if (res.success) {
        setSavedPosts((prev) =>
          res.saved ? [...prev, postId] : prev.filter((id) => id !== postId)
        );
      }
    } catch (err) {
      console.error("Failed to save post:", err);
    }
  }

  function initials(name: string) {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((n) => (
          <Card key={n} className="border border-border/80 p-5 shadow-soft">
            <div className="flex gap-4">
              <div className="size-12 shrink-0 bg-surface rounded-2xl animate-pulse" />
              <div className="flex-1 space-y-3">
                <div className="h-4 bg-surface rounded w-1/3 animate-pulse" />
                <div className="h-3 bg-surface rounded w-1/4 animate-pulse" />
                <div className="space-y-2 pt-2">
                  <div className="h-4 bg-surface rounded w-full animate-pulse" />
                  <div className="h-4 bg-surface rounded w-5/6 animate-pulse" />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border border-danger/30 bg-danger/5 p-6 text-center text-danger">
        <p className="text-xs font-semibold">⚠️ {error}</p>
        <Button size="sm" variant="secondary" onClick={loadData} className="mt-3">
          Try Again
        </Button>
      </Card>
    );
  }

  if (posts.length === 0) {
    return (
      <Card className="border-dashed border-border p-10 text-center">
        <CardContent className="space-y-3">
          <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-surface text-muted">
            <Compass size={22} />
          </div>
          <h3 className="text-lg font-semibold">No posts to display</h3>
          <p className="text-sm text-muted max-w-sm mx-auto">
            {filter === "following"
              ? "You are not following anyone yet, or they haven't posted. Explore members in the network directory to follow them."
              : "No posts match this filter. Be the first to share an update using the composer above!"}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <Card key={post.id} className="border border-border/80 shadow-soft">
          <CardContent className="p-5">
            <article className="flex gap-4">
              {/* User Avatar */}
              <Link href={`/users/${post.authorUsername}`}>
                <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-ink text-sm font-bold text-white hover:opacity-90 transition">
                  {post.authorAvatarUrl ? (
                    <img src={post.authorAvatarUrl} alt={post.authorName} className="size-full rounded-2xl object-cover" />
                  ) : (
                    initials(post.authorName)
                  )}
                </div>
              </Link>

              <div className="min-w-0 flex-1">
                {/* Author Info */}
                <div className="flex items-start justify-between">
                  <div>
                    <Link href={`/users/${post.authorUsername}`} className="font-bold hover:text-primary transition">
                      {post.authorName}
                    </Link>
                    <p className="text-xs text-muted leading-tight mt-0.5">
                      {post.authorRole} {post.authorBio ? `• ${post.authorBio.substring(0, 45)}...` : ""}
                    </p>
                  </div>
                  <Badge className="bg-surface text-ink border border-border/60 capitalize font-medium">{post.visibility}</Badge>
                </div>

                {/* Content */}
                <h2 className="mt-4 text-base font-medium tracking-tight leading-relaxed text-ink">
                  {post.content}
                </h2>

                {/* Cloudinary media display */}
                {post.media_urls && post.media_urls.map((url: string) => {
                  const isImage = url.match(/\.(jpeg|jpg|gif|png|webp|svg)/i) || url.includes("/image/upload/");
                  const isVideo = url.match(/\.(mp4|webm|ogg|mov)/i) || url.includes("/video/upload/");
                  const isPdf = url.match(/\.pdf/i);

                  return (
                    <div key={url} className="mt-4 rounded-2xl border border-border overflow-hidden max-h-80 bg-surface flex items-center justify-center">
                      {isImage && <img src={url} alt="Post attachment" className="w-full object-cover" />}
                      {isVideo && <video src={url} controls className="w-full" />}
                      {isPdf && (
                        <div className="flex items-center gap-3 p-4 w-full justify-between">
                          <div className="flex items-center gap-2">
                            <FileText className="text-danger" size={20} />
                            <span className="text-xs font-semibold text-ink">PDF Presentation Attached</span>
                          </div>
                          <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary font-bold hover:underline">
                            Open PDF
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Reaction summaries */}
                <div className="mt-5 flex flex-wrap items-center gap-1.5 border-t border-b border-border/40 py-2">
                  {Object.entries(reactionEmojis).map(([type, emoji]) => {
                    const count = post.reactionCounts[type] || 0;
                    const isActive = post.userReacted === type;
                    return (
                      <Button
                        key={type}
                        variant={isActive ? "primary" : "secondary"}
                        size="sm"
                        onClick={() => handleReaction(post.id, type)}
                        className={`h-8 rounded-xl px-2.5 text-xs font-semibold gap-1 ${
                          isActive ? "bg-primary text-white" : ""
                        }`}
                      >
                        <span>{emoji}</span>
                        <span>{type}</span>
                        {count > 0 && <span className="opacity-80">({count})</span>}
                      </Button>
                    );
                  })}
                </div>

                {/* Bottom Actions */}
                <div className="mt-3 flex flex-wrap justify-between items-center gap-2">
                  <div className="flex gap-1.5">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setActiveCommentsPostId(activeCommentsPostId === post.id ? null : post.id)}
                      className={`h-8 rounded-xl text-xs gap-1.5 ${
                        activeCommentsPostId === post.id ? "bg-surface text-primary" : ""
                      }`}
                    >
                      <MessageSquare size={14} />
                      <span>Comment</span>
                      {post.totalComments > 0 && <span className="font-bold">({post.totalComments})</span>}
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleShare(post.id)}
                      className="h-8 rounded-xl text-xs gap-1.5"
                    >
                      <Send size={14} />
                      <span>{copiedPostId === post.id ? "Copied Link!" : "Share"}</span>
                    </Button>
                  </div>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleSave(post.id)}
                    aria-label="Save post"
                    className={`h-8 rounded-xl text-xs gap-1.5 ${
                      savedPosts.includes(post.id) ? "text-primary bg-primary/5 border-primary/20" : ""
                    }`}
                  >
                    <Bookmark size={14} fill={savedPosts.includes(post.id) ? "currentColor" : "none"} />
                    <span>{savedPosts.includes(post.id) ? "Saved" : "Save"}</span>
                  </Button>
                </div>

                {/* Expanded Comments Drawer */}
                {activeCommentsPostId === post.id && (
                  <div className="mt-5 border-t border-border/60 pt-4 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
                    {/* Add Comment */}
                    <form onSubmit={(e) => handleAddComment(e, post.id)} className="flex gap-2">
                      <input
                        type="text"
                        required
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                        placeholder="Add your thoughts to this post..."
                        className="h-9 min-w-0 flex-1 rounded-xl border border-border bg-surface px-3 text-xs placeholder:text-muted focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                      />
                      <Button type="submit" size="sm" className="h-9" disabled={commentingPostId === post.id}>
                        {commentingPostId === post.id ? <Loader2 size={13} className="animate-spin" /> : "Reply"}
                      </Button>
                    </form>

                    {/* Comments List */}
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                      {post.comments.length === 0 ? (
                        <p className="text-xs text-muted text-center py-2">No comments yet. Start the conversation!</p>
                      ) : (
                        post.comments.map((comm: any) => (
                          <div key={comm.id} className="flex gap-2.5 rounded-xl bg-surface p-3 border border-border/40">
                            <div className="grid size-8 shrink-0 place-items-center rounded-xl bg-ink text-xs font-bold text-white">
                              {initials(comm.authorName)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-baseline justify-between gap-2">
                                <span className="text-xs font-bold text-ink">{comm.authorName}</span>
                                <span className="text-[10px] text-muted font-medium capitalize">{comm.authorRole}</span>
                              </div>
                              <p className="mt-1 text-xs text-ink/90 leading-relaxed font-medium">{comm.content}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </article>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
