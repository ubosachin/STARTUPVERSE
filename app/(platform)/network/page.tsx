"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, UserPlus, UserCheck, MessageSquare, Rss, Ban, Clock, Award, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeading } from "@/components/layout/page-heading";
import { 
  getNetworkProfilesAction, 
  sendConnectionAction, 
  acceptConnectionAction, 
  rejectConnectionAction,
  followUserAction,
  unfollowUserAction
} from "@/lib/actions/connections";
import { createConversationAction } from "@/lib/actions/messages";

export default function NetworkPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"discover" | "connections" | "requests">("discover");
  const [searchQuery, setSearchQuery] = useState("");
  const [profiles, setProfiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadNetwork();
  }, []);

  async function loadNetwork() {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getNetworkProfilesAction();
      setProfiles(data);
    } catch (err: any) {
      setError(err.message || "Failed to load network directories.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleConnect(userId: string) {
    try {
      const res = await sendConnectionAction(userId);
      if (res.success) {
        // Optimistic toggle locally to show instant success response
        setProfiles((prev) =>
          prev.map((p) => {
            if (p.id !== userId) return p;
            return { ...p, connectionStatus: "pending", connectionSender: "user-current" };
          })
        );
      } else {
        alert(res.error || "Failed to connect.");
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleAccept(userId: string) {
    try {
      const res = await acceptConnectionAction(userId);
      if (res.success) {
        setProfiles((prev) =>
          prev.map((p) => {
            if (p.id !== userId) return p;
            return { ...p, connectionStatus: "accepted" };
          })
        );
      } else {
        alert(res.error || "Failed to accept.");
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleReject(userId: string) {
    try {
      const res = await rejectConnectionAction(userId);
      if (res.success) {
        setProfiles((prev) =>
          prev.map((p) => {
            if (p.id !== userId) return p;
            return { ...p, connectionStatus: null, connectionSender: null };
          })
        );
      } else {
        alert(res.error || "Failed to ignore request.");
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleFollow(userId: string, isCurrentlyFollowing: boolean) {
    try {
      const res = isCurrentlyFollowing 
        ? await unfollowUserAction(userId) 
        : await followUserAction(userId);
        
      if (res.success) {
        setProfiles((prev) =>
          prev.map((p) => {
            if (p.id !== userId) return p;
            return { ...p, isFollowing: !isCurrentlyFollowing };
          })
        );
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleMessage(userId: string) {
    try {
      const res = await createConversationAction(userId);
      if (res.success && res.conversationId) {
        router.push(`/messages?conversationId=${res.conversationId}`);
      } else {
        alert(res.error || "Failed to start thread.");
      }
    } catch (err) {
      console.error(err);
    }
  }

  function initials(name: string) {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  }

  // Filter lists based on tab and query
  const filtered = profiles.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.skills.some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeTab === "connections") {
      return p.connectionStatus === "accepted";
    }

    if (activeTab === "requests") {
      return p.connectionStatus === "pending";
    }

    // Tab is Discover: show people who are not connected and have no pending requests
    return p.connectionStatus === null;
  });

  const inboundRequests = filtered.filter((p) => p.connectionStatus === "pending" && p.connectionSender !== "user-current");
  const outboundRequests = filtered.filter((p) => p.connectionStatus === "pending" && p.connectionSender === "user-current");

  return (
    <div className="py-5 space-y-6 max-w-7xl mx-auto px-2">
      <PageHeading
        eyebrow="Network"
        title="Link and follow startup professionals."
        description="Search founders, technical builders, and VC sponsors to invite connections, message partners, or track updates."
      />

      {/* Tabs and Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/80 pb-3">
        <div className="flex gap-2">
          {([
            { id: "discover", label: "Discover Builders" },
            { id: "connections", label: "My Connections" },
            { id: "requests", label: "Requests" }
          ] as const).map((tab) => {
            let badgeCount = 0;
            if (tab.id === "connections") {
              badgeCount = profiles.filter((p) => p.connectionStatus === "accepted").length;
            } else if (tab.id === "requests") {
              badgeCount = profiles.filter((p) => p.connectionStatus === "pending" && p.connectionSender !== "user-current").length;
            }
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`h-9 rounded-xl px-4 text-xs font-bold border transition-all flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? "bg-ink border-ink text-white"
                    : "bg-surface border-border hover:bg-white text-ink/80"
                }`}
              >
                <span>{tab.label}</span>
                {badgeCount > 0 && (
                  <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? "bg-white text-ink" : "bg-primary text-white"}`}>
                    {badgeCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="relative w-full md:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
          <input
            type="text"
            placeholder="Search by name, role, skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-full rounded-xl border border-border bg-surface pl-9 pr-4 text-xs placeholder:text-muted focus:border-primary focus:ring-primary focus:outline-none"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 size={30} className="animate-spin text-primary" />
          <span className="text-sm font-semibold text-muted ml-3">Loading network directory...</span>
        </div>
      ) : error ? (
        <Card className="border border-danger/30 bg-danger/5 p-6 text-center text-danger">
          <p className="text-xs font-semibold">⚠️ {error}</p>
          <Button size="sm" variant="secondary" onClick={loadNetwork} className="mt-3">
            Retry
          </Button>
        </Card>
      ) : activeTab === "requests" ? (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Inbound requests */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-ink uppercase tracking-wide flex items-center gap-1.5">
              <Sparkles size={14} className="text-primary" /> Inbound Invitations ({inboundRequests.length})
            </h3>
            {inboundRequests.length === 0 ? (
              <Card className="border-dashed border-border p-6 text-center text-xs text-muted">
                No pending connection invitations received.
              </Card>
            ) : (
              inboundRequests.map((p) => (
                <Card key={p.id} className="border border-border/80 shadow-soft">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-ink text-xs font-bold text-white uppercase">
                      {initials(p.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-ink truncate">{p.name}</p>
                      <p className="text-[10px] text-muted truncate">{p.bio}</p>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <Button size="sm" onClick={() => handleAccept(p.id)} className="h-8 text-[11px] font-semibold">
                        Accept
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => handleReject(p.id)} className="h-8 text-[11px] font-semibold text-danger hover:bg-danger/10">
                        Ignore
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Outbound requests */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-ink uppercase tracking-wide flex items-center gap-1.5">
              <Clock size={14} className="text-muted" /> Sent Requests ({outboundRequests.length})
            </h3>
            {outboundRequests.length === 0 ? (
              <Card className="border-dashed border-border p-6 text-center text-xs text-muted">
                No connection requests waiting response.
              </Card>
            ) : (
              outboundRequests.map((p) => (
                <Card key={p.id} className="border border-border/80 shadow-soft">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-ink text-xs font-bold text-white uppercase">
                      {initials(p.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-ink truncate">{p.name}</p>
                      <p className="text-[10px] text-muted truncate">{p.bio}</p>
                    </div>
                    <Button variant="secondary" size="sm" onClick={() => handleReject(p.id)} className="h-8 text-[11px] font-semibold shrink-0 gap-1 text-muted">
                      Cancel
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      ) : (
        filtered.length === 0 ? (
          <Card className="border-dashed border-border py-16 text-center">
            <CardContent className="space-y-3">
              <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-surface text-muted">
                <Ban size={22} />
              </div>
              <h3 className="text-lg font-semibold">No profiles found</h3>
              <p className="text-sm text-muted max-w-sm mx-auto">
                No matching users found for "{searchQuery}". Try modifying your search keywords.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <Card key={p.id} className="border border-border/80 bg-white shadow-soft transition-all hover:-translate-y-0.5 duration-300">
                <CardContent className="p-5 flex flex-col justify-between h-full space-y-5">
                  <div className="flex items-start gap-3 justify-between">
                    <div className="flex items-start gap-3">
                      <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-ink text-sm font-bold text-white uppercase">
                        {initials(p.name)}
                      </div>
                      <div>
                        <h3 className="font-bold text-ink leading-tight">{p.name}</h3>
                        <p className="text-[10px] text-muted font-medium mt-0.5">@{p.username}</p>
                        <p className="text-[11px] text-muted mt-2">📍 {p.location}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-1.5">
                      <Badge className="bg-surface text-ink border border-border capitalize font-semibold text-[10px]">
                        {p.role}
                      </Badge>
                      {p.isFollowedBy && (
                        <Badge className="bg-success/10 text-success border-0 text-[9px] font-bold">
                          Follows you
                        </Badge>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-muted leading-relaxed line-clamp-2 min-h-[32px]">{p.bio}</p>

                  {p.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {p.skills.slice(0, 3).map((skill: string) => (
                        <span key={skill} className="rounded-lg bg-surface border border-border/50 px-2.5 py-0.5 text-[10px] font-bold text-muted">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Actions Row */}
                  <div className="grid grid-cols-3 gap-2 pt-4 border-t border-border/40">
                    <Button
                      variant={p.connectionStatus === "accepted" ? "secondary" : "primary"}
                      size="sm"
                      onClick={() => {
                        if (p.connectionStatus === "accepted") {
                          handleMessage(p.id);
                        } else if (p.connectionStatus === "pending") {
                          // Allow cancel if we sent it
                          if (p.connectionSender === "user-current") {
                            handleReject(p.id);
                          } else {
                            handleAccept(p.id);
                          }
                        } else {
                          handleConnect(p.id);
                        }
                      }}
                      className="h-8 rounded-xl text-[10px] font-semibold gap-1"
                    >
                      {p.connectionStatus === "accepted" ? (
                        <>
                          <MessageSquare size={12} /> Message
                        </>
                      ) : p.connectionStatus === "pending" ? (
                        p.connectionSender === "user-current" ? (
                          <>
                            <Clock size={12} /> Pending
                          </>
                        ) : (
                          <>
                            <UserCheck size={12} /> Accept
                          </>
                        )
                      ) : (
                        <>
                          <UserPlus size={12} /> Connect
                        </>
                      )}
                    </Button>

                    <Button
                      variant={p.isFollowing ? "secondary" : "secondary"}
                      size="sm"
                      onClick={() => handleFollow(p.id, p.isFollowing)}
                      className={`h-8 rounded-xl text-[10px] font-semibold gap-1 ${
                        p.isFollowing ? "text-primary bg-primary/5 border-primary/20" : ""
                      }`}
                    >
                      <Rss size={12} />
                      {p.isFollowing ? "Following" : "Follow"}
                    </Button>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => router.push(`/users/${p.username}`)}
                      className="h-8 rounded-xl text-[10px] font-semibold gap-1"
                    >
                      <Award size={12} /> Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      )}
    </div>
  );
}
