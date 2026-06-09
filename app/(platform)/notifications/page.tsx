"use client";

import { useState } from "react";
import {
  Bell, CheckCheck, Handshake, MessageSquare, BadgeDollarSign,
  UserPlus, Heart, Rocket, Star, Loader2
} from "lucide-react";
import { useNotifications } from "@/lib/hooks/useNotifications";
import { Tabs } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

const notifTypes = [
  { id: "all", label: "All" },
  { id: "match", label: "Matches" },
  { id: "message", label: "Messages" },
  { id: "connection", label: "Connections" },
  { id: "funding", label: "Funding" },
  { id: "reaction", label: "Reactions" }
];

const typeConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  match: { icon: Handshake, color: "text-violet-600", bg: "bg-violet-50" },
  message: { icon: MessageSquare, color: "text-blue-600", bg: "bg-blue-50" },
  connection: { icon: UserPlus, color: "text-emerald-600", bg: "bg-emerald-50" },
  funding: { icon: BadgeDollarSign, color: "text-amber-600", bg: "bg-amber-50" },
  reaction: { icon: Heart, color: "text-rose-600", bg: "bg-rose-50" },
  system: { icon: Bell, color: "text-sky-600", bg: "bg-sky-50" },
  startup: { icon: Rocket, color: "text-orange-600", bg: "bg-orange-50" },
  review: { icon: Star, color: "text-yellow-600", bg: "bg-yellow-50" }
};

function timeAgo(dateString: string) {
  const now = new Date();
  const d = new Date(dateString);
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function NotificationsPage() {
  const [tab, setTab] = useState("all");
  const { notifications, unreadCount, isLoading, markRead, markAllRead } = useNotifications();

  const filtered = tab === "all"
    ? notifications
    : notifications.filter((n) => n.type === tab);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink font-sans">Notifications</h1>
          <p className="mt-1 text-sm text-muted">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}` : "All caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="secondary"
            size="sm"
            onClick={markAllRead}
            className="gap-1.5"
          >
            <CheckCheck size={15} />
            Mark all read
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs
        tabs={notifTypes.map((t) => ({
          ...t,
          count: t.id === "all" ? unreadCount : notifications.filter((n) => n.type === t.id && !n.read).length || undefined
        }))}
        active={tab}
        onChange={setTab}
        variant="card"
      />

      {/* Notifications list */}
      <div className="space-y-2">
        {isLoading ? (
          <div className="flex justify-center py-20 text-muted items-center gap-2">
            <Loader2 className="animate-spin text-primary" size={24} />
            <span>Loading notifications...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border border-border bg-white py-16 text-center">
            <Bell size={36} className="mx-auto mb-3 text-muted opacity-40" />
            <p className="font-semibold text-muted">No {tab !== "all" ? tab : ""} notifications</p>
            <p className="mt-1 text-sm text-muted/70">You&apos;re all caught up!</p>
          </div>
        ) : (
          filtered.map((notif) => {
            const cfg = typeConfig[notif.type] || typeConfig.system;
            const Icon = cfg.icon;
            return (
              <div
                key={notif.id}
                onClick={() => markRead(notif.id)}
                className={cn(
                  "flex cursor-pointer items-start gap-4 rounded-2xl border p-4 transition hover:shadow-card",
                  notif.read
                    ? "border-border bg-white"
                    : "border-primary/20 bg-primary/5"
                )}
              >
                {/* Icon */}
                <div className={cn("grid size-10 shrink-0 place-items-center rounded-2xl", cfg.bg, cfg.color)}>
                  <Icon size={18} />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-ink leading-tight">{notif.title}</p>
                      {!notif.read && (
                        <span className="size-1.5 rounded-full bg-primary shrink-0 inline-block" />
                      )}
                    </div>
                    <span className="shrink-0 text-[10px] font-semibold text-muted">
                      {timeAgo(notif.created_at)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted leading-relaxed">{notif.message}</p>
                  {notif.action_url && (
                    <a
                      href={notif.action_url}
                      className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View details →
                    </a>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
