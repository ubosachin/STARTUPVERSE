"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Rocket, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeading } from "@/components/layout/page-heading";
import { toast } from "@/components/ui/toast";
import { createStartupAction } from "@/lib/actions/startups";
import { updateUserRoleAction } from "@/lib/actions/profiles";
import type { StartupStage } from "@/lib/types/database";

export default function CreateStartupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [industry, setIndustry] = useState("Software");
  const [stage, setStage] = useState<string>("pre-seed");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("tagline", tagline);
      formData.append("description", description);
      formData.append("industry", industry);
      formData.append("stage", stage);
      formData.append("website", website);

      const res = await createStartupAction(formData);
      if (res.success) {
        // Automatically promote user role to founder in the DB
        await updateUserRoleAction("founder");
        toast.success(`${name} profile created successfully!`);
        router.push("/startup/dashboard");
      } else {
        toast.error(res.error || "Failed to create startup profile");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <PageHeading
        eyebrow="Founder Workspace"
        title="Launch your startup profile."
        description="Fill out details to publish your company deck room, job openings, and traction metrics to interested capital allocators."
      />

      <div className="grid gap-6 md:grid-cols-[1fr_260px] items-start">
        <Card className="border border-border/80 bg-white shadow-soft">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-muted uppercase">Startup Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Stripe, Linear"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1.5 h-11 w-full rounded-xl border border-border bg-surface px-4 text-xs focus:border-primary focus:ring-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-muted uppercase">One-Sentence Tagline</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Financial infrastructure for the internet."
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="mt-1.5 h-11 w-full rounded-xl border border-border bg-surface px-4 text-xs focus:border-primary focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[11px] font-bold text-muted uppercase">Focused Industry</label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="mt-1.5 h-11 w-full rounded-xl border border-border bg-surface px-3 text-xs focus:border-primary focus:ring-primary"
                  >
                    <option value="Software">Software</option>
                    <option value="Fintech">Fintech</option>
                    <option value="Health AI">Health AI</option>
                    <option value="Climate">Climate</option>
                    <option value="SaaS">B2B SaaS</option>
                    <option value="Developer Tools">Developer Tools</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-muted uppercase">Startup Stage</label>
                  <select
                    value={stage}
                    onChange={(e) => setStage(e.target.value)}
                    className="mt-1.5 h-11 w-full rounded-xl border border-border bg-surface px-3 text-xs focus:border-primary focus:ring-primary"
                  >
                    <option value="idea">Idea Phase</option>
                    <option value="pre-seed">Pre-Seed</option>
                    <option value="seed">Seed Round</option>
                    <option value="series-a">Series A</option>
                    <option value="series-b">Series B</option>
                    <option value="series-c">Series C</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-muted uppercase">Company Website URL</label>
                <input
                  type="url"
                  placeholder="https://mycompany.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="mt-1.5 h-11 w-full rounded-xl border border-border bg-surface px-4 text-xs focus:border-primary focus:ring-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-muted uppercase">Description (Detailed)</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Explain what problem your team is solving, your traction to date, and current milestones..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-border bg-surface p-3 text-xs focus:border-primary focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <Button type="submit" disabled={loading} className="w-full gap-1.5 py-6 rounded-xl font-bold">
                  {loading ? "Launching Profile..." : "Create Startup Profile"}
                  {!loading && <ArrowRight size={16} />}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Info card */}
        <Card className="border border-border bg-surface">
          <CardContent className="p-4 space-y-4">
            <h3 className="text-xs font-bold text-ink uppercase tracking-wide flex items-center gap-1">
              <Sparkles size={14} className="text-primary" /> Profile Tips
            </h3>
            <p className="text-[11px] text-muted leading-relaxed">
              Investors review taglines and stages before requesting pitch decks. Fill in clear traction markers to improve your compatibility score.
            </p>
            <div className="space-y-2 text-[10px] text-ink font-semibold pt-2 border-t border-border/40">
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-success" />
                <span>Verified tags enabled</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-success" />
                <span>Deck analytics live</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
