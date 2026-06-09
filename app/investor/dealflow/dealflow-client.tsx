"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Filter, Rocket, Compass, CheckCircle2, Bookmark, MessageSquare, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeading } from "@/components/layout/page-heading";
import { toast } from "@/components/ui/toast";
import { toggleFollowStartupAction } from "@/lib/actions/startups";
import { expressInterestAction } from "@/lib/actions/deals";
import { createConversationAction } from "@/lib/actions/messages";

interface DealflowClientProps {
  initialDeals: any[];
  initialFollows: string[];
  initialExpressedRounds: string[];
}

export default function DealflowClient({
  initialDeals,
  initialFollows,
  initialExpressedRounds
}: DealflowClientProps) {
  const router = useRouter();
  const [dealflow, setDealflow] = useState<any[]>(initialDeals);
  const [watchlistIds, setWatchlistIds] = useState<string[]>(initialFollows);
  const [expressedRounds, setExpressedRounds] = useState<string[]>(initialExpressedRounds);
  const [industryFilter, setIndustryFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");

  const [loadingInterest, setLoadingInterest] = useState<string | null>(null);
  const [loadingWatch, setLoadingWatch] = useState<string | null>(null);
  const [loadingChat, setLoadingChat] = useState<string | null>(null);

  async function handleExpressInterest(startupId: string, roundId: string, companyName: string) {
    setLoadingInterest(roundId);
    try {
      const res = await expressInterestAction(startupId, roundId);
      if (res.success) {
        setExpressedRounds((prev) => [...prev, roundId]);
        toast.success(`Interest logged for ${companyName}!`);
      } else {
        toast.error(res.error || "Failed to express interest");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred");
    } finally {
      setLoadingInterest(null);
    }
  }

  async function handleSave(startupId: string) {
    setLoadingWatch(startupId);
    try {
      const res = await toggleFollowStartupAction(startupId);
      if (res.success) {
        if (watchlistIds.includes(startupId)) {
          setWatchlistIds((prev) => prev.filter((id) => id !== startupId));
          toast.success("Removed from watchlist");
        } else {
          setWatchlistIds((prev) => [...prev, startupId]);
          toast.success("Added to watchlist");
        }
      } else {
        toast.error(res.error || "Failed to toggle watch state");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred");
    } finally {
      setLoadingWatch(null);
    }
  }

  async function handleMessage(founderId: string) {
    if (!founderId) {
      toast.error("Founder profile not available for chat.");
      return;
    }
    setLoadingChat(founderId);
    try {
      const res = await createConversationAction(founderId);
      if (res.success && res.conversationId) {
        router.push(`/messages?conversationId=${res.conversationId}`);
      } else {
        toast.error(res.error || "Failed to start chat thread");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred starting chat");
    } finally {
      setLoadingChat(null);
    }
  }

  const filteredDeals = dealflow.filter((d) => {
    const matchesIndustry = industryFilter === "all" || d.industry.toLowerCase() === industryFilter.toLowerCase();
    const matchesStage = stageFilter === "all" || d.stage.toLowerCase() === stageFilter.toLowerCase();
    return matchesIndustry && matchesStage;
  });

  return (
    <div className="py-5 space-y-6 max-w-7xl mx-auto px-2">
      <PageHeading
        eyebrow="Marketplace"
        title="Explore active deal flow and syndicates."
        description="Filter high-signal startups by sector or target raise, verify product traction indices, and request access to deck rooms."
      />

      {/* Filters and search */}
      <div className="flex flex-wrap gap-3 border-b border-border/80 pb-4">
        {/* Industry Filter */}
        <div className="flex items-center gap-1.5 bg-surface border border-border/80 px-3 py-1 rounded-xl text-xs font-semibold text-muted">
          <Filter size={13} />
          <span>Sector:</span>
          <select
            value={industryFilter}
            onChange={(e) => setIndustryFilter(e.target.value)}
            className="border-0 bg-transparent p-0 font-bold text-ink focus:ring-0 focus:outline-none"
          >
            <option value="all">All Sectors</option>
            <option value="software">Software</option>
            <option value="fintech">Fintech</option>
            <option value="climate">Climate Tech</option>
            <option value="health AI">Health AI</option>
            <option value="hardware">Hardware</option>
          </select>
        </div>

        {/* Stage Filter */}
        <div className="flex items-center gap-1.5 bg-surface border border-border/80 px-3 py-1 rounded-xl text-xs font-semibold text-muted">
          <Rocket size={13} />
          <span>Round Stage:</span>
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="border-0 bg-transparent p-0 font-bold text-ink focus:ring-0 focus:outline-none"
          >
            <option value="all">All Stages</option>
            <option value="idea">Idea</option>
            <option value="pre-seed">Pre-Seed</option>
            <option value="seed">Seed Rounds</option>
            <option value="series-a">Series A</option>
            <option value="series-b">Series B</option>
            <option value="series-c">Series C</option>
          </select>
        </div>
      </div>

      {/* Deal Cards */}
      {filteredDeals.length === 0 ? (
        <Card className="border-dashed border-border py-16 text-center">
          <CardContent className="space-y-3">
            <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-surface text-muted">
              <Compass size={22} />
            </div>
            <h3 className="text-lg font-semibold">No deal matches found</h3>
            <p className="text-sm text-muted max-w-sm mx-auto">
              No active funding rounds match your selected filters. Reset filters to see other startups.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredDeals.map((deal) => {
            const hasExpressed = expressedRounds.includes(deal.round?.id);
            const isSaved = watchlistIds.includes(deal.id);

            return (
              <Card key={deal.id} className="border border-border/80 bg-white shadow-soft transition duration-300 hover:shadow-soft">
                <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                  <div>
                    {/* Header */}
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <h3 className="font-bold text-ink leading-snug text-base flex items-center gap-1.5">
                          {deal.name}
                          <Link href={`/startups/${deal.slug}`}>
                            <ArrowUpRight size={14} className="text-muted hover:text-primary transition" />
                          </Link>
                        </h3>
                        <p className="text-xs text-primary font-semibold mt-1">Sector: {deal.industry}</p>
                      </div>

                      <div className="flex flex-col items-end gap-1.5">
                        <span className="rounded-full bg-success/15 px-2.5 py-0.5 text-[9px] font-bold text-success border border-success/10 capitalize">
                          {deal.stage}
                        </span>
                        {deal.team_size && (
                          <Badge className="bg-surface text-ink border border-border text-[9px] font-semibold">
                            Team Size: {deal.team_size}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <p className="mt-4 text-xs text-muted leading-relaxed font-medium">{deal.tagline}</p>

                    {/* Active Funding round card if exists */}
                    {deal.round ? (
                      <div className="mt-4 bg-surface rounded-xl p-3 border border-border/50 space-y-1.5">
                        <div className="flex justify-between text-[11px] font-bold text-ink">
                          <span className="capitalize">🎯 Target Round: {deal.round.round_type}</span>
                          <span className="text-primary">${(Number(deal.round.target_amount) / 1000000).toFixed(1)}M</span>
                        </div>
                        <div className="flex justify-between text-[9px] text-muted font-semibold">
                          <span>Status: {deal.round.status}</span>
                          <span>Pre-money Valuation: ${(Number(deal.round.valuation || 0) / 1000000).toFixed(1)}M</span>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-4 text-[10px] text-muted bg-surface rounded-xl p-2.5 text-center">No active funding round configured.</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-border/40 flex justify-between items-center gap-2">
                    <div className="flex gap-1.5">
                      {deal.round && (
                        <Button
                          variant={hasExpressed ? "secondary" : "primary"}
                          size="sm"
                          disabled={hasExpressed || loadingInterest === deal.round.id}
                          onClick={() => handleExpressInterest(deal.id, deal.round.id, deal.name)}
                          className="h-8 text-[10px] font-bold gap-1"
                        >
                          {hasExpressed ? (
                            <>
                              <CheckCircle2 size={12} className="text-success" /> Interested
                            </>
                          ) : (
                            "Express Interest"
                          )}
                        </Button>
                      )}
                      
                      <Button
                        variant="secondary"
                        size="icon"
                        disabled={loadingWatch === deal.id}
                        onClick={() => handleSave(deal.id)}
                        title="Save to Watchlist"
                        className={`size-8 rounded-xl transition-all ${
                          isSaved ? "text-primary bg-primary/5 border-primary/20" : ""
                        }`}
                      >
                        <Bookmark size={13} fill={isSaved ? "currentColor" : "none"} />
                      </Button>
                    </div>

                    <div className="flex gap-1.5">
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={loadingChat === deal.founder_id}
                        onClick={() => handleMessage(deal.founder_id)}
                        className="h-8 text-[10px] font-semibold gap-1"
                      >
                        <MessageSquare size={12} /> Chat Founder
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
