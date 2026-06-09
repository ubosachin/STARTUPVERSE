import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createSupabaseServiceClient, getCurrentDbUser } from "@/lib/supabase/server";
import { ReportsClient } from "./reports-client";

export const metadata: Metadata = {
  title: "Flagged Reports | Admin",
  description: "Moderate flagged content reports on StartupVerse"
};

export const revalidate = 0; // Dynamic data

export default async function AdminReportsPage() {
  const dbUser = await getCurrentDbUser();
  if (!dbUser || !dbUser.is_admin) {
    redirect("/feed");
  }

  const supabase = createSupabaseServiceClient();
  if (!supabase) {
    return (
      <div className="flex h-96 items-center justify-center text-muted">
        Database connection not available.
      </div>
    );
  }

  // Fetch pending reports
  const { data: reports } = await supabase
    .from("reports")
    .select(`
      id,
      reason,
      notes,
      status,
      target_type,
      target_id,
      created_at,
      reporter:reporter_id (
        username,
        profiles (
          full_name
        )
      )
    `)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  const formattedReports = [];
  for (const r of (reports || [])) {
    let postContent = "";
    let postAuthor = "";

    if (r.target_type === "post") {
      const { data: post } = await supabase
        .from("posts")
        .select(`
          content,
          user:user_id (
            username,
            profiles (
              full_name
            )
          )
        `)
        .eq("id", r.target_id)
        .maybeSingle();

      const postData = post as any;
      if (postData) {
        const user = Array.isArray(postData.user) ? postData.user[0] : postData.user;
        const profile = Array.isArray(user?.profiles) ? user.profiles[0] : user?.profiles;
        postContent = postData.content || "";
        postAuthor = profile?.full_name || user?.username || "Builder";
      } else {
        postContent = "[Deleted or Missing Post]";
        postAuthor = "[Deleted]";
      }
    } else {
      postContent = `Reported target of type: ${r.target_type}`;
      postAuthor = `ID: ${r.target_id}`;
    }

    const reporterData = r.reporter as any;
    const reporterProfile = Array.isArray(reporterData?.profiles) ? reporterData.profiles[0] : reporterData?.profiles;

    formattedReports.push({
      id: r.id,
      reason: r.reason,
      reporter: reporterProfile?.full_name || reporterData?.username || "reporter",
      targetType: r.target_type,
      targetId: r.target_id,
      postAuthor,
      postContent,
      notes: r.notes || undefined
    });
  }

  return <ReportsClient initialReports={formattedReports} />;
}
