"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BadgeDollarSign, Bell, BriefcaseBusiness, CalendarDays, Compass,
  Handshake, MessageSquare, Rocket, Search, Settings, Sparkles,
  Users, TrendingUp, Menu, X
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils/cn";
import { useNotifications } from "@/lib/hooks/useNotifications";
import { getCurrentUserAndProfile } from "@/lib/actions/profiles";

const platformLinks = [
  { label: "Feed", href: "/feed", icon: Compass },
  { label: "Network", href: "/network", icon: Users },
  { label: "Messages", href: "/messages", icon: MessageSquare },
  { label: "Matches", href: "/matches", icon: Handshake },
  { label: "Startups", href: "/startups", icon: Rocket },
  { label: "Investors", href: "/investors", icon: BadgeDollarSign },
  { label: "Fundraising", href: "/fundraising", icon: TrendingUp },
  { label: "Events", href: "/events", icon: CalendarDays },
  { label: "Jobs", href: "/jobs", icon: BriefcaseBusiness },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Settings", href: "/settings", icon: Settings }
];

const mobileLinks = [
  { label: "Feed", href: "/feed", icon: Compass },
  { label: "Network", href: "/network", icon: Users },
  { label: "Messages", href: "/messages", icon: MessageSquare },
  { label: "Matches", href: "/matches", icon: Handshake },
  { label: "More", href: "/notifications", icon: Bell }
];

export function PlatformShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [profile, setProfile] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const { unreadCount } = useNotifications();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await getCurrentUserAndProfile();
        if (res) {
          setProfile(res.profile);
          setUser(res.user);
        }
      } catch (err) {
        console.error("Failed to load user profile in shell:", err);
      }
    }
    loadUser();
  }, []);

  function isActive(href: string) {
    return pathname === href || (href !== "/feed" && pathname.startsWith(href));
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-[1480px] gap-0 lg:gap-5 px-0 py-0 lg:px-4 lg:py-4 sm:px-0 lg:px-8">
      {/* ── Sidebar ── */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col rounded-none lg:rounded-3xl border-r lg:border border-border bg-white/95 p-4 shadow-soft backdrop-blur-xl lg:flex lg:top-4 lg:h-[calc(100vh-2rem)]">
        {/* Logo */}
        <Link href="/feed" className="py-2">
          <Logo size="md" />
        </Link>

        {/* Nav links */}
        <nav className="mt-8 flex-1 space-y-0.5 overflow-y-auto no-scrollbar">
          {platformLinks.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-all duration-150",
                  active
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted hover:bg-surface hover:text-ink"
                )}
              >
                <item.icon
                  size={17}
                  className={cn(
                    "shrink-0 transition-colors",
                    active ? "text-primary" : "text-muted group-hover:text-ink"
                  )}
                />
                <span className="truncate">{item.label}</span>
                {item.label === "Notifications" && unreadCount > 0 && (
                  <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="mt-4 rounded-2xl border border-border bg-surface p-3">
          <Link href={`/users/${user?.username}`} className="flex items-center gap-3 group">
            <Avatar name={profile?.full_name || user?.username || "User"} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-ink group-hover:text-primary transition-colors">
                {profile?.full_name || user?.username || "New User"}
              </p>
              <p className="truncate text-[10px] font-semibold text-muted capitalize">
                {user?.role || "Builder"}
              </p>
            </div>
          </Link>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <section className="min-w-0 flex-1 pb-20 lg:pb-0">
        {/* Platform header */}
        <header className="sticky top-0 z-20 border-b border-border bg-white/90 px-4 py-3 backdrop-blur-xl sm:px-6 lg:mx-0 lg:rounded-3xl lg:border lg:shadow-card">
          <div className="flex items-center gap-3">
            {/* Hamburger (Mobile only) */}
            <button
              className="lg:hidden grid size-10 shrink-0 place-items-center rounded-xl border border-border bg-surface text-muted transition hover:border-primary hover:text-primary"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>

            {/* Search */}
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={17} />
              <input
                aria-label="Search StartupVerse"
                className="h-10 w-full rounded-2xl border border-border bg-surface pl-10 pr-4 text-sm placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Search founders, startups, investors, jobs…"
              />
            </div>

            {/* Role badge */}
            <span className="hidden sm:inline-flex items-center rounded-xl border border-border bg-surface px-3 py-2 text-xs font-bold text-muted capitalize">
              {user?.role || "Builder"}
            </span>

            {/* Notification bell */}
            <Link
              href="/notifications"
              className="relative grid size-10 place-items-center rounded-xl border border-border bg-surface text-muted transition hover:border-primary hover:text-primary"
              aria-label={`Notifications (${unreadCount} unread)`}
            >
              <Bell size={17} />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[9px] font-extrabold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>

            {/* Avatar */}
            <Link href={`/users/${user?.username}`} aria-label="Profile">
              <Avatar name={profile?.full_name || user?.username || "User"} size="sm" className="cursor-pointer hover:opacity-90 transition" />
            </Link>
          </div>
        </header>

        {/* Page content */}
        <div className="platform-page">
          {children}
        </div>
      </section>

      {/* ── Mobile Hamburger Drawer ── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm animate-fade-in" onClick={() => setMobileMenuOpen(false)} />
          <aside className="relative flex w-64 max-w-[80vw] flex-col overflow-y-auto bg-white p-4 shadow-xl animate-slide-in-right">
            <div className="flex items-center justify-between py-2">
              <Link href="/feed" onClick={() => setMobileMenuOpen(false)}>
                <Logo size="md" />
              </Link>
              <button
                className="grid size-8 shrink-0 place-items-center rounded-xl bg-surface text-muted"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X size={16} />
              </button>
            </div>
            <nav className="mt-8 flex-1 space-y-0.5">
              {platformLinks.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "group flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-all",
                      active ? "bg-primary/10 text-primary font-semibold" : "text-muted hover:bg-surface hover:text-ink"
                    )}
                  >
                    <item.icon size={17} className={cn("shrink-0", active ? "text-primary" : "text-muted")} />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      {/* ── Mobile Bottom Nav ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center border-t border-border bg-white/95 backdrop-blur-xl pb-safe lg:hidden">
        {mobileLinks.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-3 text-[10px] font-semibold transition-colors",
                active ? "text-primary" : "text-muted"
              )}
            >
              <item.icon size={20} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
