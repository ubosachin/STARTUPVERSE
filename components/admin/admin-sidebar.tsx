"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  FileText, 
  AlertTriangle,
  ChevronLeft,
  Menu,
  X
} from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils/cn";
import { UserButton, useUser } from "@clerk/nextjs";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Startups", href: "/admin/startups", icon: Building2 },
  { name: "Posts", href: "/admin/posts", icon: FileText },
  { name: "Reports", href: "/admin/reports", icon: AlertTriangle },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* ── Mobile Header ── */}
      <div className="flex h-16 shrink-0 items-center justify-between px-4 border-b border-border bg-white lg:hidden">
        <Link href="/admin" onClick={() => setMobileOpen(false)}>
          <Logo size="md" />
        </Link>
        <button
          className="grid size-9 place-items-center rounded-xl border border-border bg-surface text-muted"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle admin menu"
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* ── Mobile Drawer Overlay ── */}
      {mobileOpen && (
        <div className="fixed inset-0 top-16 z-50 bg-white lg:hidden animate-slide-down flex flex-col border-t border-border">
          <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
            <div className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-muted">
              Management
            </div>
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted hover:bg-surface hover:text-ink"
                  )}
                >
                  <item.icon
                    className={cn(
                      "size-5 shrink-0 transition-colors",
                      isActive ? "text-primary" : "text-muted group-hover:text-ink"
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-border p-4 pb-8">
            <Link
              href="/feed"
              className="group mb-4 flex items-center gap-2 rounded-xl px-3 py-3 text-sm font-medium text-muted transition-colors hover:bg-surface hover:text-ink"
            >
              <ChevronLeft className="size-5" />
              Return to Platform
            </Link>
            <div className="flex items-center gap-3 px-3">
              <UserButton />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-ink">
                  {user?.fullName || "Admin User"}
                </span>
                <span className="text-xs text-muted">Administrator</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Desktop Sidebar ── */}
      <div className="hidden lg:flex h-full w-64 flex-col bg-white border-r border-border shrink-0">
        {/* Header */}
        <div className="flex h-16 shrink-0 items-center px-6 border-b border-border">
          <Link href="/admin">
            <Logo size="md" textClassName="text-xl" />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
          <div className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-muted">
            Management
          </div>
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted hover:bg-surface hover:text-ink"
                )}
              >
                <item.icon
                  className={cn(
                    "size-5 shrink-0 transition-colors",
                    isActive ? "text-primary" : "text-muted group-hover:text-ink"
                  )}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer / Profile */}
        <div className="border-t border-border p-4">
          <Link
            href="/feed"
            className="group mb-4 flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface hover:text-ink"
          >
            <ChevronLeft className="size-4" />
            Return to Platform
          </Link>
          <div className="flex items-center gap-3 px-3">
            <UserButton />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-ink">
                {user?.fullName || "Admin User"}
              </span>
              <span className="text-xs text-muted">Administrator</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
