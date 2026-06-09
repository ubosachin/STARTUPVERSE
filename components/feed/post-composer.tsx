"use client";

import { useState } from "react";
import { Image as ImageIcon, Send, Globe, Users2, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { createPostAction } from "@/lib/actions/posts";
import { MediaUploader } from "@/components/ui/media-uploader";

export function PostComposer({ onPostCreated }: { onPostCreated: () => void }) {
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState<"public" | "connections" | "private">("public");
  const [attachedMediaUrl, setAttachedMediaUrl] = useState<string>("");
  const [attachedMediaPublicId, setAttachedMediaPublicId] = useState<string>("");
  const [showUploader, setShowUploader] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (content.trim().length < 2) return;

    setIsSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.append("content", content);
    formData.append("visibility", visibility);
    if (attachedMediaUrl) {
      formData.append("mediaUrl", attachedMediaUrl);
    }

    try {
      const res = await createPostAction(formData);
      if (res.success) {
        setContent("");
        setAttachedMediaUrl("");
        setAttachedMediaPublicId("");
        setShowUploader(false);
        onPostCreated();
      } else {
        setError(res.error || "Failed to create post.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleUploadSuccess(url: string, publicId: string) {
    setAttachedMediaUrl(url);
    setAttachedMediaPublicId(publicId);
  }

  function handleUploadDelete() {
    setAttachedMediaUrl("");
    setAttachedMediaPublicId("");
  }

  return (
    <Card className="border border-border/80 shadow-soft">
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share a launch update, fundraise announcement, hiring need, or ecosystem insight..."
            className="min-h-[90px] w-full resize-none border-0 p-0 text-base placeholder:text-muted focus:ring-0 focus-visible:outline-none focus:outline-none"
          />

          {showUploader && (
            <div className="pt-2">
              <MediaUploader
                folder="posts"
                onUploadSuccess={handleUploadSuccess}
                onDeleteSuccess={handleUploadDelete}
                defaultValue={attachedMediaUrl}
                defaultPublicId={attachedMediaPublicId}
                label="Post attachment (Image, Video, or PDF)"
              />
            </div>
          )}

          {error && (
            <p className="text-xs font-semibold text-danger bg-danger/10 px-3 py-1.5 rounded-lg">
              ⚠️ {error}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/60">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setShowUploader(!showUploader)}
                className="gap-1.5"
              >
                <ImageIcon size={15} className="text-primary" />
                <span>Attach Files</span>
              </Button>
            </div>

            <div className="flex items-center gap-3">
              {/* Visibility select */}
              <div className="relative">
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as any)}
                  aria-label="Post visibility"
                  className="h-11 md:h-9 rounded-xl border border-border bg-white pl-8 pr-8 text-sm md:text-xs font-semibold text-ink/80 focus:border-primary focus:ring-primary appearance-none cursor-pointer"
                >
                  <option value="public">Anyone</option>
                  <option value="connections">Connections</option>
                  <option value="private">Private</option>
                </select>
                <div className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted">
                  {visibility === "public" && <Globe size={13} />}
                  {visibility === "connections" && <Users2 size={13} />}
                  {visibility === "private" && <Lock size={13} />}
                </div>
              </div>

              <Button type="submit" size="sm" disabled={content.trim().length < 2 || isSubmitting} className="gap-1.5">
                {isSubmitting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <>
                    <span>Post</span>
                    <Send size={14} />
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
