"use client";

import { useState } from "react";
import { Search, Shield, ShieldAlert, ShieldCheck, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Tabs } from "@/components/ui/tabs";
import { toast } from "@/components/ui/toast";
import { adminToggleVerifyUserAction, adminUpdateUserRoleAction } from "@/lib/actions/admin";
import { useRouter } from "next/navigation";

const roles = ["all", "founder", "investor", "cofounder", "builder", "advisor", "admin"];

interface UserProfile {
  id: string;
  username: string;
  role: string;
  email: string;
  is_verified: boolean;
  is_admin: boolean;
  created_at: string;
  profiles: {
    full_name: string;
    avatar_url: string | null;
  } | null;
  posts: {
    count: number;
  }[];
}

interface UsersClientProps {
  initialUsers: any[];
}

export function UsersClient({ initialUsers }: UsersClientProps) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [isPending, setIsPending] = useState<string | null>(null);
  const router = useRouter();

  const formattedUsers = initialUsers.map((u) => {
    const fullName = u.profiles?.full_name || u.username;
    const postCount = u.posts?.[0]?.count || 0;
    return {
      id: u.id,
      name: fullName,
      username: u.username,
      email: u.email,
      role: u.role?.toLowerCase() || "builder",
      joined: new Date(u.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
      posts: postCount,
      is_verified: u.is_verified,
      is_admin: u.is_admin,
    };
  });

  const filtered = formattedUsers.filter((u) => {
    const matchesRole = filter === "all" || u.role === filter;
    const matchesSearch =
      !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const handleToggleVerify = async (userId: string, name: string) => {
    setIsPending(userId);
    try {
      const res = await adminToggleVerifyUserAction(userId);
      if (res.success) {
        toast.success(`Verification status updated for ${name}`);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to update verification status.");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred.");
    } finally {
      setIsPending(null);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setIsPending(userId + "role");
    try {
      const res = await adminUpdateUserRoleAction(userId, newRole);
      if (res.success) {
        toast.success(`Role updated successfully.`);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to update role.");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred.");
    } finally {
      setIsPending(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">User Management</h1>
        <p className="mt-1 text-sm text-muted">{formattedUsers.length} registered users</p>
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={17} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 w-full rounded-2xl border border-border bg-white pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Search users by name, username, or email…"
          />
        </div>
      </div>

      <Tabs
        tabs={roles.map((r) => ({ id: r, label: r.charAt(0).toUpperCase() + r.slice(1) }))}
        active={filter}
        onChange={setFilter}
        variant="card"
      />

      {/* Table */}
      <div className="rounded-3xl border border-border bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-surface">
              <tr>
                {["User", "Role", "Posts", "Joined", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-bold text-muted uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-muted">
                    No users match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-surface/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={user.name} size="sm" />
                        <div className="flex flex-col">
                          <span className="font-semibold text-ink flex items-center gap-1">
                            {user.name}
                            {user.is_admin && (
                              <span title="Admin">
                                <Shield size={14} className="text-primary" />
                              </span>
                            )}
                          </span>
                          <span className="text-xs text-muted">@{user.username}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        disabled={isPending === user.id + "role"}
                        className="text-xs font-semibold bg-surface border border-border rounded-lg px-2 py-1 text-ink focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                      >
                        {roles.filter(r => r !== "all").map(r => (
                          <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-4 text-muted">{user.posts}</td>
                    <td className="px-5 py-4 text-muted">{user.joined}</td>
                    <td className="px-5 py-4">
                      <Badge className={`text-[10px] font-bold ${user.is_verified ? "bg-success/10 border-success/20 text-success" : "bg-warning/10 border-warning/20 text-warning"}`}>
                        {user.is_verified ? "Verified" : "Unverified"}
                      </Badge>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleToggleVerify(user.id, user.name)}
                          disabled={isPending === user.id}
                          className="text-xs font-semibold"
                        >
                          {user.is_verified ? "Revoke Verification" : "Verify User"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
