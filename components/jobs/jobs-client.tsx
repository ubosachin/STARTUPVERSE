"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Briefcase, DollarSign, MapPin, CheckCircle2, ChevronRight, Send, Plus, Sparkles, Building, Info, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeading } from "@/components/layout/page-heading";
import { toast } from "@/components/ui/toast";
import { postJobAction, applyToJobAction } from "@/lib/actions/jobs";

interface JobsClientProps {
  initialJobs: any[];
  initialApplications: any[];
  isFounder: boolean;
}

export default function JobsClient({ initialJobs, initialApplications, isFounder }: JobsClientProps) {
  const [activeTab, setActiveTab] = useState<"explore" | "my-applications" | "post-job">("explore");
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");

  const [jobs, setJobs] = useState<any[]>(initialJobs);
  const [applications, setApplications] = useState<any[]>(initialApplications);

  // Apply Modal state
  const [applyingJob, setApplyingJob] = useState<any | null>(null);
  const [coverLetter, setCoverLetter] = useState("");

  // Post Job form state
  const [jobTitle, setJobTitle] = useState("");
  const [jobType, setJobType] = useState<any>("full-time");
  const [locationType, setLocationType] = useState<any>("remote");
  const [jobSalary, setJobSalary] = useState("");
  const [jobLocation, setJobLocation] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  const [loading, setLoading] = useState(false);

  function handleOpenApply(job: any) {
    const alreadyApplied = applications.some((app) => app.job_id === job.id);
    if (alreadyApplied) {
      toast.error("You have already applied to this role!");
      return;
    }
    setApplyingJob(job);
    setCoverLetter("");
  }

  async function submitApplication(e: React.FormEvent) {
    e.preventDefault();
    if (!applyingJob) return;

    setLoading(true);
    try {
      const res = await applyToJobAction(applyingJob.id, coverLetter);
      if (res.success) {
        toast.success(`Application submitted successfully for ${applyingJob.title}!`);
        setApplyingJob(null);
        // Refresh application state locally
        setApplications((prev) => [
          ...prev,
          {
            id: Math.random().toString(),
            job_id: applyingJob.id,
            jobTitle: applyingJob.title,
            startupName: applyingJob.startupName,
            location: applyingJob.location,
            status: "submitted",
            created_at: new Date().toISOString()
          }
        ]);
      } else {
        toast.error(res.error || "Failed to submit application.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  }

  async function handlePostJob(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await postJobAction({
        title: jobTitle,
        description: jobDescription,
        type: jobType,
        location_type: locationType,
        location: jobLocation || (locationType === "remote" ? "Remote" : "HQ")
      });

      if (res.success) {
        toast.success("Job posting created successfully!");
        setJobTitle("");
        setJobDescription("");
        setJobLocation("");
        setJobSalary("");
        // Reload page
        window.location.reload();
      } else {
        toast.error(res.error || "Failed to create job posting.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  }

  // Filters
  const filteredJobs = jobs.filter((j) => {
    const matchesSearch =
      j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.startupName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLocation =
      locationFilter === "all" ||
      (locationFilter === "remote" && j.location_type === "remote") ||
      (locationFilter === "onsite" && j.location_type !== "remote");

    return matchesSearch && matchesLocation;
  });

  return (
    <div className="py-5 space-y-6 max-w-7xl mx-auto px-2">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeading
          eyebrow="Jobs Board"
          title="Startup opportunities for operators and core teams."
          description="Submit applications directly to early-stage startups, manage recruitment phases, or configure new job listings."
        />
      </div>

      {/* Tabs and filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/80 pb-3 font-sans">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab("explore")}
            className={`h-9 rounded-xl px-4 text-xs font-bold border transition-all ${
              activeTab === "explore"
                ? "bg-ink border-ink text-white"
                : "bg-surface border-border hover:bg-white text-ink/80"
            }`}
          >
            Explore Jobs
          </button>
          
          <button
            onClick={() => setActiveTab("my-applications")}
            className={`h-9 rounded-xl px-4 text-xs font-bold border transition-all flex items-center gap-1.5 ${
              activeTab === "my-applications"
                ? "bg-ink border-ink text-white"
                : "bg-surface border-border hover:bg-white text-ink/80"
            }`}
          >
            <span>My Applications</span>
            {applications.length > 0 && (
              <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                activeTab === "my-applications" ? "bg-white text-ink" : "bg-primary text-white"
              }`}>
                {applications.length}
              </span>
            )}
          </button>

          {isFounder && (
            <button
              onClick={() => setActiveTab("post-job")}
              className={`h-9 rounded-xl px-4 text-xs font-bold border border-primary/20 transition-all flex items-center gap-1.5 ${
                activeTab === "post-job"
                  ? "bg-primary text-white border-primary"
                  : "bg-surface text-primary hover:bg-primary/5"
              }`}
            >
              <Plus size={13} />
              <span>Post a Job</span>
            </button>
          )}
        </div>

        {activeTab === "explore" && (
          <div className="flex flex-wrap gap-2">
            {/* Search Input */}
            <div className="relative w-full sm:w-64 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={14} />
              <input
                type="text"
                placeholder="Search jobs or startups..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 md:h-9 w-full rounded-xl border border-border bg-surface pl-9 pr-4 text-base md:text-xs placeholder:text-muted focus:border-primary focus:ring-primary focus:outline-none"
              />
            </div>

            {/* Location Select */}
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              aria-label="Filter by location type"
              className="h-11 md:h-9 w-full sm:w-auto rounded-xl border border-border bg-surface px-3 text-base md:text-xs font-semibold text-ink/80 focus:border-primary focus:ring-primary"
            >
              <option value="all">All Locations</option>
              <option value="remote">Remote Only</option>
              <option value="onsite">On-Site / Hybrid</option>
            </select>
          </div>
        )}
      </div>

      {/* EXPLORE JOBS TAB */}
      {activeTab === "explore" && (
        filteredJobs.length === 0 ? (
          <Card className="border-dashed border-border py-16 text-center">
            <CardContent className="space-y-3">
              <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-surface text-muted">
                <Briefcase size={22} />
              </div>
              <h3 className="text-lg font-semibold">No jobs available</h3>
              <p className="text-sm text-muted max-w-sm mx-auto">
                Try modifying your keywords or location filter settings.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {filteredJobs.map((job) => {
              const alreadyApplied = applications.some((app) => app.job_id === job.id);
              return (
                <Card key={job.id} className="border border-border/80 bg-white shadow-soft transition-all hover:shadow-soft duration-300">
                  <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h3 className="font-bold text-ink leading-snug text-base">{job.title}</h3>
                          <div className="flex items-center gap-1.5 mt-1 text-xs text-primary font-semibold">
                            <Building size={12} />
                            <span>{job.startupName}</span>
                          </div>
                        </div>
                        {alreadyApplied && (
                          <Badge className="bg-success/10 text-success border-0 hover:bg-success/10 font-bold text-[10px]">
                            Applied
                          </Badge>
                        )}
                      </div>

                      {/* Info badges */}
                      <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-muted">
                        <div className="flex items-center gap-1 bg-surface px-2.5 py-1 rounded-lg capitalize">
                          <Briefcase size={12} />
                          <span>{job.type}</span>
                        </div>
                        <div className="flex items-center gap-1 bg-surface px-2.5 py-1 rounded-lg capitalize">
                          <MapPin size={12} />
                          <span>{job.location_type}: {job.location}</span>
                        </div>
                      </div>

                      <p className="mt-4 text-xs text-muted leading-relaxed font-medium line-clamp-3">{job.description}</p>
                    </div>

                    <div className="pt-4 border-t border-border/40 flex justify-between items-center gap-2">
                      <Button
                        variant={alreadyApplied ? "secondary" : "primary"}
                        size="sm"
                        disabled={alreadyApplied}
                        onClick={() => handleOpenApply(job)}
                        className="h-8 text-[11px] font-bold"
                      >
                        {alreadyApplied ? "Already Applied" : "Apply to Role"}
                      </Button>
                      <Link href={`/startups/${job.startupSlug}`}>
                        <Button variant="secondary" size="sm" className="h-8 text-[11px] font-semibold">
                          View Startup
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )
      )}

      {/* MY APPLICATIONS TAB */}
      {activeTab === "my-applications" && (
        applications.length === 0 ? (
          <Card className="border-dashed border-border py-16 text-center">
            <CardContent className="space-y-3">
              <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-surface text-muted">
                <CheckCircle2 size={22} />
              </div>
              <h3 className="text-lg font-semibold">No active applications</h3>
              <p className="text-sm text-muted max-w-sm mx-auto">
                You haven't submitted any job applications yet. Go to Explore Jobs to check out live listings.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4 max-w-3xl mx-auto">
            {applications.map((app) => (
              <Card key={app.id} className="border border-border/80 bg-white shadow-soft">
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                      <Briefcase size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-ink text-sm">{app.jobTitle}</h4>
                      <p className="text-xs text-muted font-medium mt-0.5">{app.startupName}</p>
                      <p className="text-[10px] text-muted font-bold mt-1">
                        Applied on: {new Date(app.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <Badge className={`capitalize font-bold text-[10px] ${
                        app.status === "submitted" ? "bg-blue-50 text-blue-600 border border-blue-100" :
                        app.status === "interviewing" ? "bg-amber-50 text-amber-600 border border-amber-100" :
                        app.status === "offered" ? "bg-success/10 text-success border border-success/20" :
                        "bg-danger/10 text-danger border border-danger/20"
                      }`}>
                        {app.status}
                      </Badge>
                    </div>
                    <ChevronRight className="text-muted" size={16} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      )}

      {/* POST JOB TAB (FOUNDERS ONLY) */}
      {activeTab === "post-job" && isFounder && (
        <Card className="border border-primary/20 bg-white max-w-3xl mx-auto overflow-hidden animate-in fade-in duration-300">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="text-primary" size={18} />
              <h2 className="font-bold text-ink text-lg">Create New Job Posting</h2>
            </div>
            <p className="text-xs text-muted mt-1">This job will immediately index in the platform feed directory for matching builders.</p>

            <form onSubmit={handlePostJob} className="space-y-4 pt-2">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold text-muted uppercase">Job Title</label>
                  <input
                    type="text"
                    required
                    placeholder="Founding Full-Stack Engineer (Node/React)"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="mt-1.5 w-full h-11 rounded-xl border border-border bg-surface px-3 text-base md:text-xs focus:border-primary focus:ring-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-muted uppercase">Job Format</label>
                  <select
                    value={jobType}
                    onChange={(e) => setJobType(e.target.value)}
                    className="mt-1.5 w-full h-11 rounded-xl border border-border bg-surface px-3 text-base md:text-xs focus:border-primary focus:ring-primary"
                  >
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                    <option value="co-founder">Co-Founder</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[11px] font-bold text-muted uppercase">Office Location Type</label>
                  <select
                    value={locationType}
                    onChange={(e) => setLocationType(e.target.value)}
                    className="mt-1.5 w-full h-11 rounded-xl border border-border bg-surface px-3 text-base md:text-xs focus:border-primary focus:ring-primary"
                  >
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="on-site">On-Site</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-muted uppercase">Office Location Details</label>
                  <input
                    type="text"
                    placeholder="e.g. San Francisco, CA"
                    value={jobLocation}
                    onChange={(e) => setJobLocation(e.target.value)}
                    className="mt-1.5 w-full h-11 rounded-xl border border-border bg-surface px-3 text-base md:text-xs focus:border-primary focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-muted uppercase">Job Description & Stack Requirements</label>
                <textarea
                  required
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="We are looking for a key partner who has scaled Next.js architectures, managed real-time subscriptions, and enjoys greenfield projects..."
                  className="mt-1.5 w-full min-h-[120px] rounded-xl border border-border bg-surface p-3 text-base md:text-xs focus:border-primary focus:ring-primary focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end pt-3 border-t border-border/40">
                <Button type="submit" size="sm" disabled={loading} className="gap-1.5">
                  {loading ? "Publishing..." : "Publish Job Posting"} <Send size={15} />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Application overlay modal */}
      {applyingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-lg bg-white border border-border shadow-soft rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <CardContent className="p-0">
              <div className="border-b border-border bg-surface p-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Briefcase className="text-primary" size={18} />
                  <span className="font-bold tracking-tight">Apply to {applyingJob.title}</span>
                </div>
                <button
                  onClick={() => setApplyingJob(null)}
                  className="text-muted hover:text-ink font-semibold text-lg"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={submitApplication} className="p-6 space-y-4">
                <div className="rounded-xl bg-surface border border-border p-3">
                  <p className="text-[11px] font-bold text-muted uppercase">Company details</p>
                  <p className="font-bold mt-0.5">{applyingJob.startupName}</p>
                  <p className="text-xs text-muted">{applyingJob.location}</p>
                </div>

                <div>
                  <label htmlFor="cover-letter" className="text-xs font-bold text-muted uppercase tracking-wide">Cover Letter / Note to Founder</label>
                  <textarea
                    id="cover-letter"
                    required
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Hi! I am very interested in this role. I have 4 years of NextJS and Supabase experience, and recently scaled..."
                    className="mt-1.5 w-full min-h-[140px] rounded-xl border border-border bg-white p-3 text-base md:text-xs focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div className="rounded-xl bg-surface/50 border border-border p-3 text-[11px] text-muted flex gap-2">
                  <Info size={16} className="text-primary shrink-0 mt-0.5" />
                  <span>
                    Your StartupVerse profile (skills, experience, and location) is automatically attached to this submission as a resume.
                  </span>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <Button type="button" variant="secondary" size="sm" onClick={() => setApplyingJob(null)}>
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" disabled={loading} className="gap-1.5">
                    {loading ? <Loader2 size={13} className="animate-spin" /> : "Submit Application"} <Send size={14} />
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
