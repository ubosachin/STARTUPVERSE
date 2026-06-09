"use client";

import { useState } from "react";
import { FeedList } from "@/components/feed/feed-list";
import { PostComposer } from "@/components/feed/post-composer";
import { PageHeading } from "@/components/layout/page-heading";
import { StatGrid } from "@/components/dashboard/stat-grid";

export default function FeedPage() {
  const [filter, setFilter] = useState<"recent" | "trending" | "following">("recent");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const stats = [
    { label: "Active network posts", value: "3", trend: "+12%" },
    { label: "Deal rooms active", value: "8", trend: "+4%" },
    { label: "Match updates", value: "14", trend: "+20%" },
    { label: "Saved posts", value: "2", trend: "+10%" }
  ];

  function handlePostCreated() {
    setRefreshTrigger((prev) => prev + 1);
  }

  return (
    <div className="space-y-5 py-5 max-w-4xl mx-auto">
      <PageHeading
        eyebrow="Feed"
        title=" lauch updates, rounds, hiring, and notes"
        description="Share content, attachments, and interact with the founder-investor professional community graph."
      />
      
      <StatGrid stats={stats} />
      
      <PostComposer onPostCreated={handlePostCreated} />

      {/* Feed Filters */}
      <div className="flex border-b border-border/80 pb-1.5 items-center justify-between">
        <div className="flex gap-2">
          {([
            { id: "recent", label: "Recent Posts" },
            { id: "trending", label: "Trending Feed" },
            { id: "following", label: "Following Only" }
          ] as const).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`h-8 rounded-xl px-3 text-xs font-semibold border transition-all ${
                filter === tab.id
                  ? "bg-ink border-ink text-white"
                  : "bg-surface border-border hover:bg-white text-ink/80"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <span className="text-[11px] font-bold text-muted uppercase tracking-wider">Ranked feed</span>
      </div>

      <FeedList filter={filter} refreshTrigger={refreshTrigger} />
    </div>
  );
}
