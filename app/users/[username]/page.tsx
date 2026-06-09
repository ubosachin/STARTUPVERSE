import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Globe, Linkedin, Twitter, Github, MapPin, Users, MessageSquare,
  Rocket
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { createSupabaseServiceClient, getCurrentDbUser } from "@/lib/supabase/server";
import { ConnectButton } from "./connect-button";

interface Props { params: Promise<{ username: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const supabase = createSupabaseServiceClient();
  if (!supabase) return { title: "User Not Found" };

  const { data: user } = await supabase
    .from("users")
    .select("id, username")
    .eq("username", username)
    .maybeSingle();

  if (!user) return { title: "User Not Found" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, bio")
    .eq("user_id", user.id)
    .maybeSingle();

  return {
    title: profile?.full_name || username,
    description: profile?.bio || `${username}'s profile on StartupVerse`
  };
}

export default async function UserProfilePage({ params }: Props) {
  const { username } = await params;
  const supabase = createSupabaseServiceClient();
  if (!supabase) notFound();

  // 1. Fetch user record
  const { data: user } = await supabase
    .from("users")
    .select("id, username, role, created_at")
    .eq("username", username)
    .maybeSingle();

  if (!user) notFound();

  // 2. Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  // 3. Fetch connections
  const { data: connections } = await supabase
    .from("connections")
    .select("id")
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
    .eq("status", "accepted");

  // 4. Fetch posts
  const { data: posts } = await supabase
    .from("posts")
    .select("id, content, created_at, likes_count, comments_count, reposts_count")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // 5. Fetch connection status with current viewer
  const dbUser = await getCurrentDbUser();
  let connectionStatus: string | null = null;
  let connectionSender: string | null = null;

  if (dbUser && dbUser.id !== user.id) {
    const { data: conn } = await supabase
      .from("connections")
      .select("*")
      .or(`and(requester_id.eq.${dbUser.id},addressee_id.eq.${user.id}),and(requester_id.eq.${user.id},addressee_id.eq.${dbUser.id})`)
      .maybeSingle();

    if (conn) {
      connectionStatus = conn.status;
      connectionSender = conn.requester_id;
    }
  }

  const displayName = profile?.full_name || username;
  const activePosts = posts || [];
  const connectionCount = connections?.length || 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-6">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-blue h-32 sm:h-44">
        {profile?.banner_url ? (
          <img
            src={profile.banner_url}
            alt="Profile Banner"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="gradient-mesh absolute inset-0 opacity-30" />
        )}
      </div>

      {/* Profile header */}
      <div className="rounded-3xl border border-border bg-white p-6 -mt-12 relative">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
          <div className="flex items-end gap-5">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={displayName}
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white shadow-soft -mt-10 object-cover bg-white"
              />
            ) : (
              <Avatar name={displayName} size="xl" className="border-4 border-white shadow-soft -mt-10" />
            )}
            <div className="pb-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold tracking-tight text-ink">{displayName}</h1>
                <Badge className="capitalize font-bold text-xs bg-surface border-border text-muted">
                  {user.role}
                </Badge>
              </div>
              {profile?.headline && (
                <p className="mt-1 text-sm text-ink/80 font-medium leading-relaxed">{profile.headline}</p>
              )}
              {profile?.bio && (
                <p className="mt-1.5 text-sm text-muted max-w-xl leading-relaxed">{profile.bio}</p>
              )}
              <div className="mt-2 flex items-center gap-4 text-xs text-muted flex-wrap">
                {profile?.location && (
                  <span className="flex items-center gap-1">
                    <MapPin size={12} />
                    {profile.location}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Users size={12} />
                  {connectionCount} connections
                </span>
                <span className="flex items-center gap-1">
                  <Rocket size={12} />
                  {activePosts.length} posts
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {dbUser && dbUser.id !== user.id && (
              <>
                <Link href={`/messages?userId=${user.id}`}>
                  <Button variant="secondary" size="sm" className="gap-1.5">
                    <MessageSquare size={15} />
                    Message
                  </Button>
                </Link>
                <ConnectButton
                  userId={user.id}
                  initialStatus={connectionStatus}
                  initialSender={connectionSender}
                  currentUserId={dbUser?.id}
                />
              </>
            )}
          </div>
        </div>

        {/* Social Links */}
        <div className="mt-5 flex items-center gap-3">
          {profile?.website && (
            <a href={profile.website} target="_blank" rel="noopener noreferrer" className="grid size-9 place-items-center rounded-xl border border-border bg-surface text-muted hover:border-primary hover:text-primary transition">
              <Globe size={15} />
            </a>
          )}
          {profile?.linkedin_url && (
            <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="grid size-9 place-items-center rounded-xl border border-border bg-surface text-muted hover:border-primary hover:text-primary transition">
              <Linkedin size={15} />
            </a>
          )}
          {profile?.twitter_url && (
            <a href={profile.twitter_url} target="_blank" rel="noopener noreferrer" className="grid size-9 place-items-center rounded-xl border border-border bg-surface text-muted hover:border-primary hover:text-primary transition">
              <Twitter size={15} />
            </a>
          )}
          {profile?.github_url && (
            <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="grid size-9 place-items-center rounded-xl border border-border bg-surface text-muted hover:border-primary hover:text-primary transition">
              <Github size={15} />
            </a>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: posts */}
        <div className="lg:col-span-2 space-y-5">
          <h2 className="font-bold text-ink">Recent Posts</h2>
          {activePosts.length === 0 ? (
            <div className="rounded-3xl border border-border bg-white py-14 text-center">
              <Rocket size={32} className="mx-auto mb-3 text-muted opacity-40" />
              <p className="text-muted">No posts yet</p>
            </div>
          ) : (
            activePosts.map((post) => (
              <div key={post.id} className="rounded-3xl border border-border bg-white p-5">
                <div className="flex items-center gap-3 mb-3">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={displayName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <Avatar name={displayName} size="sm" />
                  )}
                  <div>
                    <p className="font-bold text-sm text-ink">{displayName}</p>
                    <p className="text-[10px] text-muted">{new Date(post.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <p className="text-sm text-muted leading-relaxed whitespace-pre-line">{post.content}</p>
                <div className="mt-4 flex items-center gap-4 border-t border-border pt-3 text-xs font-semibold text-muted">
                  <span>👍 {post.likes_count}</span>
                  <span>💬 {post.comments_count}</span>
                  <span>🔁 {post.reposts_count}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right: sidebar */}
        <div className="space-y-6">
          {/* Skills */}
          {profile?.skills && profile.skills.length > 0 && (
            <div className="rounded-3xl border border-border bg-white p-6">
              <h2 className="font-bold text-ink mb-3">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill: string) => (
                  <Badge key={skill} className="text-xs bg-surface border-border text-muted font-bold">{skill}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Activity Metrics */}
          <div className="rounded-3xl border border-border bg-white p-6 space-y-3">
            <h2 className="font-bold text-ink">Activity</h2>
            {[
              { label: "Connections", value: connectionCount },
              { label: "Posts", value: activePosts.length },
              { label: "Member Since", value: new Date(user.created_at).toLocaleDateString() }
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between text-sm">
                <span className="text-muted">{s.label}</span>
                <span className="font-bold text-ink">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
