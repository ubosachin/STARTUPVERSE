import { redirect } from "next/navigation";
import { createSupabaseServiceClient, getCurrentDbUser } from "@/lib/supabase/server";
import JobsClient from "@/components/jobs/jobs-client";

export const revalidate = 0; // Fresh jobs listings

export default async function PlatformJobsPage() {
  const dbUser = await getCurrentDbUser();
  if (!dbUser) {
    redirect("/login");
  }

  const supabase = createSupabaseServiceClient();
  if (!supabase) {
    return (
      <div className="flex h-96 items-center justify-center text-muted">
        Database connection not available.
      </div>
    );
  }

  // 1. Fetch active jobs, joined with startups
  const { data: jobsData } = await supabase
    .from("jobs")
    .select(`
      id,
      title,
      description,
      type,
      location_type,
      location,
      salary_min,
      salary_max,
      applications_count,
      startup:startup_id (
        name,
        slug,
        logo_url
      )
    `)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  const jobs = (jobsData || [])
    .filter((j) => j.startup)
    .map((j: any) => ({
      id: j.id,
      title: j.title,
      description: j.description,
      type: j.type,
      location_type: j.location_type,
      location: j.location,
      salary: `$${Math.round(j.salary_min / 1000)}k - $${Math.round(j.salary_max / 1000)}k`,
      applications_count: j.applications_count,
      startupName: j.startup.name,
      startupLogo: j.startup.logo_url,
      startupSlug: j.startup.slug
    }));

  // 2. Fetch current user's job applications
  const { data: applicationsData } = await supabase
    .from("job_applications")
    .select(`
      id,
      job_id,
      status,
      created_at,
      job:job_id (
        title,
        location,
        salary_min,
        salary_max,
        startup:startup_id (
          name
        )
      )
    `)
    .eq("user_id", dbUser.id)
    .order("created_at", { ascending: false });

  const applications = (applicationsData || [])
    .filter((a) => a.job && (a.job as any).startup)
    .map((a: any) => ({
      id: a.id,
      job_id: a.job_id,
      status: a.status,
      created_at: a.created_at,
      jobTitle: a.job.title,
      startupName: a.job.startup.name,
      location: a.job.location,
      salary: `$${Math.round(a.job.salary_min / 1000)}k - $${Math.round(a.job.salary_max / 1000)}k`
    }));

  // Check if current user is founder to allow posting
  const isFounder = dbUser.role === "founder" || dbUser.role === "admin";

  return (
    <JobsClient
      initialJobs={jobs}
      initialApplications={applications}
      isFounder={isFounder}
    />
  );
}
