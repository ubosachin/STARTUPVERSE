"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, Heart, MessageSquare, Send, X, Sparkles, Sliders, ChevronDown, Check, ArrowRight, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeading } from "@/components/layout/page-heading";
import { getMatchesAction, updateMatchStatusAction } from "@/lib/actions/matches";
import { createConversationAction } from "@/lib/actions/messages";
import { sendConnectionAction } from "@/lib/actions/connections";

export default function MatchesPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<any[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Onboarding parameters
  const [prefRole, setPrefRole] = useState<string>("cofounder");
  const [prefIndustry, setPrefIndustry] = useState<string>("Fintech");
  const [prefSkill, setPrefSkill] = useState<string>("React");
  const [prefCommitment, setPrefCommitment] = useState<string>("Full-time");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    loadMatches();
  }, [prefRole, prefIndustry, prefSkill, prefCommitment]);

  async function loadMatches() {
    setIsLoading(true);
    try {
      const data = await getMatchesAction({
        role: prefRole,
        industry: prefIndustry,
        skill: prefSkill,
        commitment: prefCommitment
      });
      setMatches(data);
    } catch (err) {
      console.error("Failed to load match listings:", err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handlePass(targetUserId: string) {
    try {
      const res = await updateMatchStatusAction(targetUserId, "passed");
      if (res.success) {
        setMatches((prev) => prev.filter((m) => m.targetUserId !== targetUserId));
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSave(targetUserId: string, name: string, isCurrentlySaved: boolean) {
    try {
      const nextStatus = isCurrentlySaved ? "pending" : "saved";
      const res = await updateMatchStatusAction(targetUserId, nextStatus);
      if (res.success) {
        setMatches((prev) =>
          prev.map((m) => {
            if (m.targetUserId !== targetUserId) return m;
            return { ...m, saved: !isCurrentlySaved };
          })
        );
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleLike(name: string, targetUserId: string) {
    try {
      const res = await updateMatchStatusAction(targetUserId, "liked");
      if (res.success) {
        alert(`Anonymous high-five sent to ${name}!`);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleMessage(userId: string) {
    try {
      const res = await createConversationAction(userId);
      if (res.success && res.conversationId) {
        router.push(`/messages?conversationId=${res.conversationId}`);
      } else {
        alert(res.error || "Failed to start thread.");
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleConnect(userId: string, name: string) {
    try {
      const res = await sendConnectionAction(userId);
      if (res.success) {
        alert(`Connection request sent to ${name}!`);
      } else {
        alert(res.error || "Failed to send connection request.");
      }
    } catch (err) {
      console.error(err);
    }
  }

  function runOnboardingCalculation(e: React.FormEvent) {
    e.preventDefault();
    setSuccessMsg("Recalculating compatibility scores using live database profiles...");
    setTimeout(() => {
      loadMatches();
      setSuccessMsg("Scores updated! View new matches below.");
      setTimeout(() => setSuccessMsg(""), 3000);
    }, 1000);
  }

  return (
    <div className="py-5 space-y-6 max-w-7xl mx-auto px-2">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeading
          eyebrow="Founder matchmaking"
          title="Find co-founders, investors, advisors, and early builders."
          description="Compatibility scores are calculated in real-time using industry alignment, stack synergy, commitment levels, and location."
        />
        <Button
          variant="secondary"
          className="mt-6 flex items-center gap-1.5"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Sliders size={16} />
          Match Prefs
          <ChevronDown size={14} className={`transition-transform ${showFilters ? "rotate-180" : ""}`} />
        </Button>
      </div>

      {/* Slide-out Preference Quiz Form */}
      {showFilters && (
        <Card className="border border-primary/20 bg-surface/50 overflow-hidden animate-in slide-in-from-top duration-300">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Sparkles className="text-primary" size={18} />
              Customize Compatibility Factors
            </h2>
            <p className="text-xs text-muted mt-1">Our matching engine weights stack expertise, commitment limits, and timezone preferences.</p>

            <form onSubmit={runOnboardingCalculation} className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="text-xs font-semibold text-muted uppercase tracking-wider">I am looking for a...</label>
                <select
                  value={prefRole}
                  onChange={(e) => setPrefRole(e.target.value)}
                  className="mt-1.5 w-full h-11 rounded-xl border border-border bg-white px-3 text-sm focus:border-primary focus:ring-primary"
                >
                  <option value="cofounder">Co-Founder</option>
                  <option value="investor">Investor / Angel</option>
                  <option value="advisor">Advisor</option>
                  <option value="builder">Software Builder</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted uppercase tracking-wider">Focused Industry</label>
                <select
                  value={prefIndustry}
                  onChange={(e) => setPrefIndustry(e.target.value)}
                  className="mt-1.5 w-full h-11 rounded-xl border border-border bg-white px-3 text-sm focus:border-primary focus:ring-primary"
                >
                  <option value="Fintech">Fintech / Web3</option>
                  <option value="Health AI">Health & Biotech</option>
                  <option value="Climate">Climate Tech</option>
                  <option value="SaaS">B2B SaaS / Infra</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted uppercase tracking-wider">Required Skill</label>
                <select
                  value={prefSkill}
                  onChange={(e) => setPrefSkill(e.target.value)}
                  className="mt-1.5 w-full h-11 rounded-xl border border-border bg-white px-3 text-sm focus:border-primary focus:ring-primary"
                >
                  <option value="React">React / Frontend</option>
                  <option value="AI infra">AI Infra / ML</option>
                  <option value="GTM">GTM / Sales</option>
                  <option value="Pricing">Pricing & Finance</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted uppercase tracking-wider">Commitment Level</label>
                <select
                  value={prefCommitment}
                  onChange={(e) => setPrefCommitment(e.target.value)}
                  className="mt-1.5 w-full h-11 rounded-xl border border-border bg-white px-3 text-sm focus:border-primary focus:ring-primary"
                >
                  <option value="Full-time">Full-time Builder</option>
                  <option value="Part-time">Part-time Partner</option>
                  <option value="Advisor">Advisor / Mentor</option>
                </select>
              </div>

              <div className="sm:col-span-2 lg:col-span-4 flex items-center justify-between pt-3 border-t border-border/60">
                <span className="text-xs font-semibold text-success">{successMsg}</span>
                <Button type="submit" size="sm" className="gap-1.5">
                  Recalculate <ArrowRight size={15} />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Matches Display Board */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 size={30} className="animate-spin text-primary" />
          <span className="text-sm font-semibold text-muted ml-3">Calculating compatibility scores...</span>
        </div>
      ) : matches.length === 0 ? (
        <Card className="border-dashed border-border py-16 text-center">
          <CardContent className="space-y-3">
            <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-surface text-muted">
              <X size={22} />
            </div>
            <h3 className="text-lg font-semibold">No matches left</h3>
            <p className="text-sm text-muted max-w-sm mx-auto">
              You have ignored or processed all suggestions. Try changing your Match Prefs filter to load new profiles.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {matches.map((match) => (
            <Card
              key={match.targetUserId}
              className={`border transition-all hover:shadow-soft duration-300 relative ${
                match.saved ? "border-primary/40 bg-white" : "border-border/80 bg-white/70"
              }`}
            >
              <CardContent className="p-6 flex flex-col justify-between h-full space-y-6">
                <div>
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <h3 className="font-bold text-lg text-ink">{match.name}</h3>
                      <p className="text-xs text-muted font-medium mt-0.5">{match.title}</p>
                      <p className="text-[11px] text-muted font-semibold mt-1">📍 {match.location}</p>
                    </div>

                    <div className="flex flex-col items-end">
                      <span className="rounded-full bg-success/15 px-3 py-1 text-xs font-bold text-success border border-success/10 shadow-sm">
                        {match.score}% Match
                      </span>
                      <Badge className="mt-2 capitalize bg-surface text-ink font-semibold border border-border">
                        {match.matchType}
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-1.5">
                    {match.skills.map((skill: string) => (
                      <span
                        key={skill}
                        className="rounded-lg bg-surface border border-border/50 px-2.5 py-1 text-[11px] font-bold text-muted"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-1.5 text-center">
                    {match.fit.map((fit: string) => (
                      <div
                        key={fit}
                        className="rounded-lg bg-surface/80 border border-border/40 py-2 text-[10px] font-bold text-ink/80 animate-pulse"
                      >
                        {fit}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Actions Row */}
                <div className="grid grid-cols-5 gap-2 pt-4 border-t border-border/40">
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => handlePass(match.targetUserId)}
                    title="Pass Match"
                    className="rounded-xl hover:bg-danger/10 hover:text-danger hover:border-danger/20 transition-all"
                  >
                    <X size={15} />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => handleSave(match.targetUserId, match.name, match.saved)}
                    title="Bookmark Match"
                    className={`rounded-xl transition-all ${
                      match.saved ? "text-primary bg-primary/5 border-primary/20" : ""
                    }`}
                  >
                    <Bookmark size={15} fill={match.saved ? "currentColor" : "none"} />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => handleLike(match.name, match.targetUserId)}
                    title="Send anonymous high-five"
                    className="rounded-xl hover:text-red-500 hover:bg-red-50 hover:border-red-100 transition-all"
                  >
                    <Heart size={15} />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => handleMessage(match.targetUserId)}
                    title="Send quick chat"
                    className="rounded-xl hover:text-primary hover:bg-primary/5 hover:border-primary/20 transition-all"
                  >
                    <MessageSquare size={15} />
                  </Button>
                  <Button
                    onClick={() => handleConnect(match.targetUserId, match.name)}
                    title="Send connection request"
                    className="rounded-xl transition-all"
                  >
                    <Send size={15} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
