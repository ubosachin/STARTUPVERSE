"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeading } from "@/components/layout/page-heading";
import { toast } from "@/components/ui/toast";
import { adminDeletePostAction } from "@/lib/actions/admin";

interface Post {
  id: string;
  content: string;
  created_at: string;
  authorName: string;
  authorUsername: string;
}

interface PostsClientProps {
  initialPosts: Post[];
}

export function PostsClient({ initialPosts }: PostsClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const filteredPosts = initialPosts.filter((post) => {
    return (
      post.content.toLowerCase().includes(search.toLowerCase()) ||
      post.authorName.toLowerCase().includes(search.toLowerCase()) ||
      post.authorUsername.toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleDeletePost = async (postId: string, authorName: string) => {
    if (!confirm(`Are you sure you want to delete this post by ${authorName}?`)) {
      return;
    }
    setIsDeleting(postId);
    try {
      const res = await adminDeletePostAction(postId);
      if (res.success) {
        toast.success(`Successfully deleted post by ${authorName}!`);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to delete post.");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred.");
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <main className="py-5 space-y-6 max-w-4xl mx-auto px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <Button variant="secondary" size="icon" onClick={() => router.push("/admin")} className="size-9 rounded-xl">
          <ArrowLeft size={16} />
        </Button>
        <div>
          <Badge>Feed Moderation</Badge>
          <h1 className="mt-1 text-xl font-bold tracking-tight text-ink">Moderate Posts</h1>
        </div>
      </div>

      <PageHeading
        eyebrow="Admin Tool"
        title="Review or delete community posts."
        description="Verify post compliance guidelines, check content text flags, and remove spam or recruitment listings."
      />

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={17} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-11 w-full rounded-2xl border border-border bg-white pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          placeholder="Search posts by author or content…"
        />
      </div>

      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <Card className="border-dashed border-border py-12 text-center text-xs text-muted">
            No posts match your search or feed is empty.
          </Card>
        ) : (
          filteredPosts.map((post) => (
            <Card key={post.id} className="border border-border/80 bg-white shadow-soft">
              <CardContent className="p-4 flex justify-between items-start gap-4 text-xs">
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="font-bold text-ink">{post.authorName}</span>
                    <span className="text-[10px] text-muted font-medium">@{post.authorUsername}</span>
                    <span className="text-[9px] text-muted">• {new Date(post.created_at).toLocaleString()}</span>
                  </div>
                  <p className="mt-2 text-ink/90 text-sm leading-relaxed font-medium whitespace-pre-wrap">{post.content}</p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleDeletePost(post.id, post.authorName)}
                  disabled={isDeleting === post.id}
                  className="h-8 text-[11px] font-semibold text-danger hover:bg-danger/10 hover:border-danger/20 shrink-0 gap-1"
                >
                  <Trash2 size={12} /> {isDeleting === post.id ? "Deleting..." : "Delete"}
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </main>
  );
}
