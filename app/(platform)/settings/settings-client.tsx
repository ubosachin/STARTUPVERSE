"use client";

import { useState } from "react";
import { User, Bell, Shield, CreditCard, Palette, Save, Camera, Link2, MapPin, Globe, Linkedin, Twitter, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs } from "@/components/ui/tabs";
import { Avatar } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils/cn";
import { MediaUploader } from "@/components/ui/media-uploader";
import { updateProfileAction, updateUserRoleAction } from "@/lib/actions/profiles";

const settingsTabs = [
  { id: "profile", label: "Profile" },
  { id: "role", label: "Role & Goals" },
  { id: "notifications", label: "Notifications" },
  { id: "privacy", label: "Privacy" },
  { id: "billing", label: "Billing" }
];

const roles = [
  { value: "founder" as const, label: "Founder", desc: "Building a startup as CEO/CTO/CPO" },
  { value: "investor" as const, label: "Investor", desc: "Deploying capital into startups" },
  { value: "cofounder" as const, label: "Co-Founder", desc: "Looking to join an early team" },
  { value: "builder" as const, label: "Builder / Engineer", desc: "Technical contributor" },
  { value: "advisor" as const, label: "Advisor / Mentor", desc: "Strategic guidance and intros" }
];

const skillOptions = [
  "React", "Next.js", "TypeScript", "Python", "Go", "Rust", "AI/ML",
  "Product Management", "Sales", "Marketing", "Design/UI", "Finance",
  "Operations", "Legal", "Fundraising", "Growth", "Data Science", "DevOps"
];

interface SettingsClientProps {
  initialProfile: any;
  initialUser: any;
}

export default function SettingsClient({ initialProfile, initialUser }: SettingsClientProps) {
  const [tab, setTab] = useState("profile");
  const [name, setName] = useState(initialProfile?.full_name || "");
  const [bio, setBio] = useState(initialProfile?.bio || "");
  const [location, setLocation] = useState(initialProfile?.location || "");
  const [website, setWebsite] = useState(initialProfile?.website || "");
  const [linkedin, setLinkedin] = useState(initialProfile?.linkedin_url || "");
  const [twitter, setTwitter] = useState(initialProfile?.twitter_url || "");
  const [github, setGithub] = useState(initialProfile?.github_url || "");
  const [selectedRole, setSelectedRole] = useState<any>(initialUser?.role || "builder");
  const [selectedSkills, setSelectedSkills] = useState<string[]>(initialProfile?.skills || []);
  const [avatarUrl, setAvatarUrl] = useState(initialProfile?.avatar_url || "");
  
  const [isSaving, setIsSaving] = useState(false);
  const [notifPrefs, setNotifPrefs] = useState({
    matches: true,
    messages: true,
    connections: true,
    funding: true,
    reactions: false,
    newsletter: true
  });

  const profileCompletion = [
    Boolean(name),
    Boolean(bio),
    Boolean(location),
    Boolean(website),
    selectedSkills.length > 0,
    Boolean(linkedin || twitter || github),
    Boolean(avatarUrl)
  ].filter(Boolean).length / 7 * 100;

  async function handleSaveProfile() {
    setIsSaving(true);
    try {
      const res = await updateProfileAction({
        full_name: name,
        bio,
        location,
        website,
        linkedin_url: linkedin,
        twitter_url: twitter,
        github_url: github,
        skills: selectedSkills,
        avatar_url: avatarUrl
      });

      if (res.success) {
        toast.success("Profile saved successfully!");
      } else {
        toast.error(res.error || "Failed to update profile.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "An error occurred.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleUpdateRole() {
    setIsSaving(true);
    try {
      const res = await updateUserRoleAction(selectedRole);
      if (res.success) {
        toast.success("Role updated successfully!");
      } else {
        toast.error(res.error || "Failed to update role.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error("An error occurred.");
    } finally {
      setIsSaving(false);
    }
  }

  function toggleSkill(skill: string) {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">Settings</h1>
        <p className="mt-1 text-sm text-muted">Manage your profile, preferences, and account</p>
      </div>

      {/* Tabs */}
      <Tabs tabs={settingsTabs} active={tab} onChange={setTab} variant="underline" />

      {/* Profile tab */}
      {tab === "profile" && (
        <div className="space-y-6">
          {/* Profile completion */}
          <div className="rounded-3xl border border-border bg-surface p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-ink">Profile Completion</h2>
              <span className={cn("text-sm font-bold", profileCompletion === 100 ? "text-success" : "text-primary")}>
                {Math.round(profileCompletion)}%
              </span>
            </div>
            <Progress value={profileCompletion} size="md" />
            {profileCompletion < 100 && (
              <p className="mt-3 text-xs text-muted">
                Complete your profile to appear higher in search results and attract better matches.
              </p>
            )}
          </div>

          {/* Avatar Upload */}
          <div className="rounded-3xl border border-border bg-white p-6">
            <h2 className="font-bold text-ink mb-3">Profile Photo</h2>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="shrink-0 relative">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar preview" className="size-20 rounded-full object-cover border border-border" />
                ) : (
                  <Avatar name={name} size="xl" />
                )}
              </div>
              <div className="flex-1 w-full">
                <MediaUploader
                  onUploadSuccess={(url) => setAvatarUrl(url)}
                  onDeleteSuccess={() => setAvatarUrl("")}
                  defaultValue={avatarUrl}
                  folder="avatars"
                  label=""
                  maxSizeMB={5}
                />
              </div>
            </div>
          </div>

          {/* Basic info */}
          <div className="rounded-3xl border border-border bg-white p-6 space-y-5">
            <h2 className="font-bold text-ink">Basic Information</h2>

            <div>
              <label htmlFor="settings-name" className="block text-xs font-bold text-muted mb-1.5 uppercase tracking-wider">
                Full Name
              </label>
              <input
                id="settings-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label htmlFor="settings-bio" className="block text-xs font-bold text-muted mb-1.5 uppercase tracking-wider">
                Bio
              </label>
              <textarea
                id="settings-bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                maxLength={500}
                className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                placeholder="Tell the ecosystem who you are, what you're building, and what you're looking for…"
              />
              <p className="mt-1.5 text-xs text-muted text-right">{bio.length}/500</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="settings-location" className="block text-xs font-bold text-muted mb-1.5 uppercase tracking-wider">
                  Location
                </label>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={15} />
                  <input
                    id="settings-location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full rounded-2xl border border-border bg-surface pl-9 pr-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="San Francisco, CA"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="settings-website" className="block text-xs font-bold text-muted mb-1.5 uppercase tracking-wider">
                  Website
                </label>
                <div className="relative">
                  <Globe className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={15} />
                  <input
                    id="settings-website"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full rounded-2xl border border-border bg-surface pl-9 pr-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="https://yoursite.com"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Social links */}
          <div className="rounded-3xl border border-border bg-white p-6 space-y-4">
            <h2 className="font-bold text-ink">Social Links</h2>
            {[
              { id: "linkedin", icon: Linkedin, label: "LinkedIn", value: linkedin, setter: setLinkedin, placeholder: "linkedin.com/in/yourhandle" },
              { id: "twitter", icon: Twitter, label: "Twitter / X", value: twitter, setter: setTwitter, placeholder: "twitter.com/yourhandle" },
              { id: "github", icon: Github, label: "GitHub", value: github, setter: setGithub, placeholder: "github.com/yourusername" }
            ].map((social) => (
              <div key={social.id}>
                <label htmlFor={`settings-${social.id}`} className="block text-xs font-bold text-muted mb-1.5 uppercase tracking-wider">
                  {social.label}
                </label>
                <div className="relative">
                  <social.icon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={15} />
                  <input
                    id={`settings-${social.id}`}
                    value={social.value}
                    onChange={(e) => social.setter(e.target.value)}
                    className="w-full rounded-2xl border border-border bg-surface pl-9 pr-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder={social.placeholder}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Skills */}
          <div className="rounded-3xl border border-border bg-white p-6">
            <h2 className="font-bold text-ink mb-1">Skills</h2>
            <p className="text-xs text-muted mb-4">Select skills for better matches and visibility in search.</p>
            <div className="flex flex-wrap gap-2">
              {skillOptions.map((skill) => (
                <button
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  className={cn(
                    "rounded-xl border px-3 py-1.5 text-xs font-bold transition-all",
                    selectedSkills.includes(skill)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-surface text-muted hover:border-ink hover:text-ink"
                  )}
                >
                  {skill}
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted">{selectedSkills.length} selected</p>
          </div>

          <Button onClick={handleSaveProfile} disabled={isSaving} className="gap-2">
            <Save size={16} />
            {isSaving ? "Saving..." : "Save changes"}
          </Button>
        </div>
      )}

      {/* Role tab */}
      {tab === "role" && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-border bg-white p-6">
            <h2 className="font-bold text-ink mb-1">Your Role</h2>
            <p className="text-sm text-muted mb-5">Your role shapes how you appear to others and which features you access.</p>
            <div className="space-y-3">
              {roles.map((role) => (
                <button
                  key={role.value}
                  onClick={() => setSelectedRole(role.value)}
                  className={cn(
                    "flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition",
                    selectedRole === role.value
                      ? "border-primary bg-primary/5"
                      : "border-border bg-surface hover:border-primary/40"
                  )}
                >
                  <div className={cn(
                    "size-4 rounded-full border-2 transition",
                    selectedRole === role.value ? "border-primary bg-primary" : "border-border"
                  )} />
                  <div>
                    <p className={cn("font-bold text-sm", selectedRole === role.value ? "text-primary" : "text-ink")}>{role.label}</p>
                    <p className="text-xs text-muted">{role.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
          <Button onClick={handleUpdateRole} disabled={isSaving} className="gap-2">
            <Save size={16} />
            {isSaving ? "Updating role..." : "Update role"}
          </Button>
        </div>
      )}

      {/* Notifications tab */}
      {tab === "notifications" && (
        <div className="space-y-4">
          <div className="rounded-3xl border border-border bg-white p-6">
            <h2 className="font-bold text-ink mb-5">Email Notifications</h2>
            <div className="space-y-4">
              {Object.entries(notifPrefs).map(([key, val]) => {
                const labels: Record<string, { title: string; desc: string }> = {
                  matches: { title: "New match found", desc: "When AI finds a compatible founder or co-founder" },
                  messages: { title: "New message", desc: "When someone sends you a direct message" },
                  connections: { title: "Connection requests", desc: "When someone wants to connect with you" },
                  funding: { title: "Funding interest", desc: "When an investor expresses interest in your startup" },
                  reactions: { title: "Reactions & comments", desc: "When someone reacts to or comments on your posts" },
                  newsletter: { title: "Platform newsletter", desc: "Weekly highlights, featured startups, and ecosystem updates" }
                };
                const info = labels[key];
                return (
                  <div key={key} className="flex items-center justify-between py-2">
                    <div>
                      <p className="font-semibold text-sm text-ink">{info.title}</p>
                      <p className="text-xs text-muted">{info.desc}</p>
                    </div>
                    <button
                      onClick={() => setNotifPrefs((prev) => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))}
                      className={cn(
                        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border-2 border-transparent transition-colors",
                        val ? "bg-primary" : "bg-border"
                      )}
                    >
                      <span
                        className={cn(
                          "inline-block size-4 transform rounded-full bg-white shadow transition",
                          val ? "translate-x-5" : "translate-x-0"
                        )}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
          <Button onClick={() => toast.success("Notification preferences saved!")} className="gap-2">
            <Save size={16} />
            Save preferences
          </Button>
        </div>
      )}

      {/* Billing tab */}
      {tab === "billing" && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-border bg-white p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-ink">Current Plan</h2>
              <Badge className="bg-surface border-border text-muted font-bold capitalize">{initialUser?.subscription_tier || "Free"}</Badge>
            </div>
            <p className="text-sm text-muted mb-6">
              You're currently on the {initialUser?.subscription_tier || "Free"} plan. Upgrade to unlock premium investor discovery features.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { name: "Founder Pro", price: "$29/mo", features: "Unlimited connections, Matches, CRM", color: "border-primary" },
                { name: "Investor Pro", price: "$49/mo", features: "Dealflow, Watchlist, Portfolio", color: "border-border" },
                { name: "Startup Pro", price: "$99/mo", features: "Team, Jobs, Verified badge", color: "border-border" }
              ].map((plan) => (
                <div key={plan.name} className={cn("rounded-2xl border p-4", plan.color)}>
                  <p className="font-bold text-ink">{plan.name}</p>
                  <p className="text-lg font-bold text-primary mt-1">{plan.price}</p>
                  <p className="text-xs text-muted mt-1">{plan.features}</p>
                  <Button size="sm" className="mt-4 w-full" onClick={() => toast.info("Stripe checkout coming soon!")}>
                    Upgrade
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Privacy tab */}
      {tab === "privacy" && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-border bg-white p-6 space-y-4">
            <h2 className="font-bold text-ink">Privacy Settings</h2>
            {[
              { label: "Show profile in search results", desc: "Allow other members to find your profile" },
              { label: "Show email to connections", desc: "Share your email with accepted connections" },
              { label: "Allow direct messages from anyone", desc: "Receive messages from non-connections" }
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2">
                <div>
                  <p className="font-semibold text-sm text-ink">{item.label}</p>
                  <p className="text-xs text-muted">{item.desc}</p>
                </div>
                <button className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border-2 border-transparent bg-primary transition-colors">
                  <span className="inline-block size-4 translate-x-5 transform rounded-full bg-white shadow" />
                </button>
              </div>
            ))}
          </div>
          <div className="rounded-3xl border border-danger/20 bg-danger/5 p-6">
            <h2 className="font-bold text-danger mb-2">Danger Zone</h2>
            <p className="text-sm text-muted mb-4">Once you delete your account, all data is permanently removed.</p>
            <Button variant="secondary" size="sm" className="border-danger/30 text-danger hover:bg-danger/10">
              Delete account
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
