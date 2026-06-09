"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Users, ArrowLeft, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toast";
import { MediaUploader } from "@/components/ui/media-uploader";
import { updateStartupAction, addStartupMemberAction } from "@/lib/actions/startups";

interface StartupSettingsClientProps {
  startup: any;
}

export default function StartupSettingsClient({ startup }: StartupSettingsClientProps) {
  const router = useRouter();

  // Form states
  const [name, setName] = useState(startup.name || "");
  const [tagline, setTagline] = useState(startup.tagline || "");
  const [description, setDescription] = useState(startup.description || "");
  const [industry, setIndustry] = useState(startup.industry || "");
  const [stage, setStage] = useState(startup.stage || "pre-seed");
  const [website, setWebsite] = useState(startup.website || "");
  const [logoUrl, setLogoUrl] = useState(startup.logo_url || "");

  // Team Invite states
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [isInviting, setIsInviting] = useState(false);

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await updateStartupAction(startup.id, {
        name,
        tagline,
        description,
        industry,
        stage,
        website,
        logo_url: logoUrl
      });

      if (res.success) {
        toast.success("Startup settings saved successfully!");
      } else {
        toast.error(res.error || "Failed to save startup settings.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "An error occurred.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleInviteMember(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail || !inviteRole) return;

    setIsInviting(true);
    try {
      const res = await addStartupMemberAction(startup.id, inviteEmail, inviteRole);
      if (res.success) {
        toast.success(`Successfully invited user to your startup team!`);
        setInviteEmail("");
        setInviteRole("");
      } else {
        toast.error(res.error || "Failed to invite team member.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error("An error occurred adding team member.");
    } finally {
      setIsInviting(false);
    }
  }

  return (
    <main className="py-5 space-y-6 max-w-4xl mx-auto px-2">
      <div className="flex items-center gap-3">
        <Button variant="secondary" size="icon" onClick={() => router.push("/startup/dashboard")} className="size-9 rounded-xl">
          <ArrowLeft size={16} />
        </Button>
        <div>
          <Badge>Company Workspace</Badge>
          <h1 className="mt-1 text-xl font-bold tracking-tight text-ink font-sans">Startup Settings</h1>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left 2 Cols: Details Edit */}
        <div className="md:col-span-2 space-y-6">
          {/* Logo Upload */}
          <Card className="border border-border/80 bg-white shadow-soft">
            <CardContent className="p-6 space-y-4">
              <h2 className="font-bold text-ink leading-tight">Startup Logo</h2>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="shrink-0">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo preview" className="size-16 object-contain rounded-2xl border border-border bg-surface/50 p-2" />
                  ) : (
                    <div className="grid size-16 place-items-center rounded-2xl bg-gradient-blue text-white font-bold text-2xl">
                      {name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="flex-1 w-full">
                  <MediaUploader
                    onUploadSuccess={(url) => setLogoUrl(url)}
                    onDeleteSuccess={() => setLogoUrl("")}
                    defaultValue={logoUrl}
                    folder="logos"
                    label=""
                    maxSizeMB={5}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Settings Form */}
          <Card className="border border-border/80 bg-white shadow-soft">
            <CardContent className="p-6">
              <h2 className="font-bold text-ink leading-tight">Edit Startup Profile</h2>
              <form onSubmit={handleSaveSettings} className="mt-4 space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-muted uppercase">Company Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1.5 h-10 w-full rounded-xl border border-border bg-surface px-3 text-base md:text-xs focus:border-primary focus:ring-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-muted uppercase">One-Sentence Tagline</label>
                  <input
                    type="text"
                    required
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className="mt-1.5 h-10 w-full rounded-xl border border-border bg-surface px-3 text-base md:text-xs focus:border-primary focus:ring-primary focus:outline-none"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-[11px] font-bold text-muted uppercase">Industry</label>
                    <input
                      type="text"
                      required
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="mt-1.5 h-10 w-full rounded-xl border border-border bg-surface px-3 text-base md:text-xs focus:border-primary focus:ring-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-muted uppercase">Stage</label>
                    <select
                      value={stage}
                      onChange={(e) => setStage(e.target.value)}
                      className="mt-1.5 h-10 w-full rounded-xl border border-border bg-surface px-3 text-base md:text-xs focus:border-primary focus:ring-primary"
                    >
                      <option value="idea">Idea</option>
                      <option value="pre-seed">Pre-seed</option>
                      <option value="seed">Seed</option>
                      <option value="series-a">Series A</option>
                      <option value="series-b">Series B</option>
                      <option value="series-c">Series C</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-muted uppercase">Website URL</label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="mt-1.5 h-10 w-full rounded-xl border border-border bg-surface px-3 text-base md:text-xs focus:border-primary focus:ring-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-muted uppercase">Detailed Description</label>
                  <textarea
                    rows={5}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-border bg-surface p-3 text-base md:text-xs focus:border-primary focus:ring-primary focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex justify-end items-center border-t border-border/40">
                  <Button type="submit" size="sm" disabled={isSaving} className="gap-1.5 font-semibold">
                    <Save size={15} /> {isSaving ? "Saving Changes..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Team Invites */}
        <Card className="border border-border bg-surface h-fit">
          <CardContent className="p-4 space-y-4">
            <h3 className="text-xs font-bold text-ink uppercase tracking-wide flex items-center gap-1">
              <Users size={14} /> Invite Team Member
            </h3>
            <p className="text-[11px] text-muted leading-relaxed">
              Add co-founders, developers, or advisors to show on your company profile and participate in equity raises.
            </p>

            <form onSubmit={handleInviteMember} className="space-y-3 pt-2 border-t border-border/40">
              <div>
                <label className="text-[10px] font-bold text-muted uppercase">Registered User Email</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. nina@startup.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="mt-1 w-full h-9 rounded-lg border border-border bg-white px-2.5 text-base md:text-xs focus:border-primary focus:ring-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted uppercase">Role Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Co-Founder & CTO"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="mt-1 w-full h-9 rounded-lg border border-border bg-white px-2.5 text-base md:text-xs focus:border-primary focus:ring-primary focus:outline-none"
                />
              </div>

              <Button type="submit" size="sm" disabled={isInviting} className="w-full text-xs font-semibold mt-2">
                {isInviting ? "Adding..." : "Add to Team"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
