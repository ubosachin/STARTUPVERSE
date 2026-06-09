import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentDbUser } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export const metadata: Metadata = {
  title: {
    default: "Admin | StartupVerse",
    template: "%s | Admin | StartupVerse"
  },
  description: "Admin panel for StartupVerse"
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dbUser = await getCurrentDbUser();
  
  if (!dbUser || !dbUser.is_admin) {
    redirect("/feed");
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full bg-surface overflow-hidden font-sans">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto bg-surface/50">
        <div className="min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
