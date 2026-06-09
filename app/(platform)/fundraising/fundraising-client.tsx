"use client";

import { useState } from "react";
import { BadgeDollarSign, Rocket, LineChart, Plus, User, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageHeading } from "@/components/layout/page-heading";
import { toast } from "@/components/ui/toast";
import { createFundingRoundAction } from "@/lib/actions/startups";
import { logDealAction, updateDealStageAction } from "@/lib/actions/deals";

const PIPELINE_STAGES = [
  { id: "interested", label: "Interested" },
  { id: "meeting", label: "Meeting" },
  { id: "due-diligence", label: "Due Diligence" },
  { id: "committed", label: "Committed" },
  { id: "passed", label: "Passed" }
] as const;

interface FundraisingClientProps {
  startup: any;
  initialRounds: any[];
  initialPipeline: any[];
  availableInvestors: any[];
}

export default function FundraisingClient({
  startup,
  initialRounds,
  initialPipeline,
  availableInvestors
}: FundraisingClientProps) {
  const [rounds, setRounds] = useState<any[]>(initialRounds);
  const [activeRound, setActiveRound] = useState<any>(initialRounds?.[0] || null);
  const [pipelineInterests, setPipelineInterests] = useState<any[]>(initialPipeline);
  const [showAddRoundForm, setShowAddRoundForm] = useState(false);
  const [showLogMeetingForm, setShowLogMeetingForm] = useState(false);

  // New round fields
  const [roundType, setRoundType] = useState("seed");
  const [roundAmount, setRoundAmount] = useState("");
  const [roundValuation, setRoundValuation] = useState("");

  // New interaction logging fields
  const [selectedInvestorId, setSelectedInvestorId] = useState(availableInvestors?.[0]?.id || "");
  const [interactionNotes, setInteractionNotes] = useState("");
  const [interactionStage, setInteractionStage] = useState<string>("interested");

  const [loading, setLoading] = useState(false);

  async function handleCreateRound(e: React.FormEvent) {
    e.preventDefault();
    if (!startup) return;

    setLoading(true);
    try {
      const amt = Number(roundAmount) || 0;
      const res = await createFundingRoundAction(startup.id, {
        round_type: roundType,
        target_amount: amt
      });

      if (res.success) {
        toast.success(`Launched fundraising round successfully!`);
        // Refresh or reload the rounds
        window.location.reload();
      } else {
        toast.error(res.error || "Failed to create round.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogMeeting(e: React.FormEvent) {
    e.preventDefault();
    if (!startup || !selectedInvestorId) return;

    setLoading(true);
    try {
      const res = await logDealAction({
        investorId: selectedInvestorId,
        startupId: startup.id,
        roundId: activeRound?.id,
        stage: interactionStage,
        notes: interactionNotes
      });

      if (res.success) {
        toast.success("Investor interaction logged successfully!");
        setInteractionNotes("");
        setShowLogMeetingForm(false);
        // Refresh round interests
        window.location.reload();
      } else {
        toast.error(res.error || "Failed to log interaction.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred logging interest.");
    } finally {
      setLoading(false);
    }
  }

  async function updatePipelineStage(dealId: string, stage: string) {
    try {
      const res = await updateDealStageAction(dealId, stage);
      if (res.success) {
        setPipelineInterests((prev) =>
          prev.map((i) => (i.id === dealId ? { ...i, stage } : i))
        );
        toast.success("Pipeline stage updated");
      } else {
        toast.error(res.error || "Failed to update pipeline stage");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred");
    }
  }

  // Aggregate stats
  const committedAmount = pipelineInterests
    .filter((i) => i.stage === "committed")
    .reduce((acc, curr) => acc + (Number(curr.amount_interest || 0) || 250000), 0); // fallback average check size $250k

  const totalTarget = activeRound ? Number(activeRound.target_amount) : 0;
  const progressPercent = totalTarget > 0 ? Math.min(100, Math.round((committedAmount / totalTarget) * 100)) : 0;

  return (
    <div className="py-5 space-y-6 max-w-7xl mx-auto px-2">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeading
          eyebrow="Fundraising CRM"
          title="Track active funding rounds and investor pipelines."
          description="Create round structures, invite co-investors, log board conversations, and drag leads across pipeline stages."
        />
        <div className="mt-6 flex gap-2">
          <Button size="sm" onClick={() => setShowAddRoundForm(!showAddRoundForm)} className="gap-1.5">
            <Plus size={15} /> Add Round
          </Button>
          {availableInvestors.length > 0 && (
            <Button variant="secondary" size="sm" onClick={() => setShowLogMeetingForm(!showLogMeetingForm)} className="gap-1.5">
              <BadgeDollarSign size={15} /> Log Meeting
            </Button>
          )}
        </div>
      </div>

      {/* Launcher forms */}
      {showAddRoundForm && (
        <Card className="border border-primary/20 bg-surface/50 overflow-hidden animate-in slide-in-from-top duration-300">
          <CardContent className="p-6">
            <h2 className="font-bold text-ink">Launch Funding Round</h2>
            <form onSubmit={handleCreateRound} className="mt-4 grid gap-4 sm:grid-cols-3">
              <div>
                <label className="text-[11px] font-bold text-muted uppercase">Round Stage</label>
                <select
                  value={roundType}
                  onChange={(e) => setRoundType(e.target.value)}
                  className="mt-1.5 w-full h-10 rounded-xl border border-border bg-white px-3 text-base md:text-xs focus:border-primary focus:ring-primary"
                >
                  <option value="pre-seed">Pre-Seed</option>
                  <option value="seed">Seed Round</option>
                  <option value="series-a">Series A</option>
                  <option value="series-b">Series B</option>
                  <option value="series-c">Series C</option>
                  <option value="bridge">Bridge</option>
                  <option value="strategic">Strategic</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold text-muted uppercase">Target Amount ($)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 1500000"
                  value={roundAmount}
                  onChange={(e) => setRoundAmount(e.target.value)}
                  className="mt-1.5 w-full h-10 rounded-xl border border-border bg-white px-3 text-base md:text-xs focus:border-primary focus:ring-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-muted uppercase">Pre-Money Valuation ($)</label>
                <input
                  type="number"
                  placeholder="e.g. 8000000"
                  value={roundValuation}
                  onChange={(e) => setRoundValuation(e.target.value)}
                  className="mt-1.5 w-full h-10 rounded-xl border border-border bg-white px-3 text-base md:text-xs focus:border-primary focus:ring-primary focus:outline-none"
                />
              </div>
              <div className="sm:col-span-3 flex justify-end gap-2 pt-2">
                <Button type="button" variant="secondary" size="sm" onClick={() => setShowAddRoundForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={loading}>
                  {loading ? "Launching..." : "Launch Round"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Log Interaction form */}
      {showLogMeetingForm && (
        <Card className="border border-primary/20 bg-surface/50 overflow-hidden animate-in slide-in-from-top duration-300">
          <CardContent className="p-6">
            <h2 className="font-bold text-ink">Log Investor Interaction</h2>
            <form onSubmit={handleLogMeeting} className="mt-4 grid gap-4 sm:grid-cols-3">
              <div>
                <label className="text-[11px] font-bold text-muted uppercase">Select Investor</label>
                <select
                  value={selectedInvestorId}
                  onChange={(e) => setSelectedInvestorId(e.target.value)}
                  className="mt-1.5 w-full h-10 rounded-xl border border-border bg-white px-3 text-base md:text-xs focus:border-primary focus:ring-primary"
                >
                  {availableInvestors.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold text-muted uppercase">Pipeline Status</label>
                <select
                  value={interactionStage}
                  onChange={(e) => setInteractionStage(e.target.value)}
                  className="mt-1.5 w-full h-10 rounded-xl border border-border bg-white px-3 text-base md:text-xs focus:border-primary focus:ring-primary"
                >
                  {PIPELINE_STAGES.map((stg) => (
                    <option key={stg.id} value={stg.id}>
                      {stg.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-3">
                <label className="text-[11px] font-bold text-muted uppercase">Notes & Meeting Summary</label>
                <textarea
                  value={interactionNotes}
                  onChange={(e) => setInteractionNotes(e.target.value)}
                  placeholder="Sofia requested a follow-up deck detailing payroll expansion..."
                  className="mt-1.5 w-full min-h-[70px] rounded-xl border border-border bg-white p-3 text-base md:text-xs focus:border-primary focus:ring-primary focus:outline-none"
                />
              </div>
              <div className="sm:col-span-3 flex justify-end gap-2 pt-2">
                <Button type="button" variant="secondary" size="sm" onClick={() => setShowLogMeetingForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={loading}>
                  {loading ? "Logging..." : "Log Interaction"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {activeRound ? (
        <>
          {/* Active Round Progress Cards */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border border-border/80 bg-white shadow-soft">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <Rocket size={22} />
                </div>
                <div>
                  <h3 className="text-xs text-muted font-semibold uppercase tracking-wider">Active Round</h3>
                  <p className="font-bold text-lg text-ink mt-0.5 capitalize">{activeRound.round_type}</p>
                  <p className="text-[11px] text-muted mt-1">Status: {activeRound.status}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border/80 bg-white shadow-soft">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="grid size-12 place-items-center rounded-2xl bg-success/10 text-success">
                  <BadgeDollarSign size={22} />
                </div>
                <div>
                  <h3 className="text-xs text-muted font-semibold uppercase tracking-wider">Raise Target</h3>
                  <p className="font-bold text-lg text-ink mt-0.5">${(Number(activeRound.target_amount) / 1000000).toFixed(1)}M</p>
                  <p className="text-[11px] text-success font-semibold mt-1">
                    Committed: ${(committedAmount / 1000000).toFixed(2)}M
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border/80 bg-white shadow-soft">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="grid size-12 place-items-center rounded-2xl bg-secondary/10 text-secondary">
                  <LineChart size={22} />
                </div>
                <div>
                  <h3 className="text-xs text-muted font-semibold uppercase tracking-wider">Round Valuation</h3>
                  <p className="font-bold text-lg text-ink mt-0.5">
                    {activeRound.valuation ? `$${(Number(activeRound.valuation) / 1000000).toFixed(1)}M` : "TBD"}
                  </p>
                  <p className="text-[11px] text-muted mt-1">Pre-money cap set</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Capital Progress bar */}
          <Card className="border border-border/80 bg-white shadow-soft">
            <CardContent className="p-5 space-y-3">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-ink flex items-center gap-1.5">
                  <CheckCircle2 className="text-success" size={16} /> Campaign Progress ({progressPercent}% via committed stage)
                </span>
                <span className="text-muted">
                  ${committedAmount.toLocaleString()} / {Number(activeRound.target_amount).toLocaleString()} USD
                </span>
              </div>
              <div className="h-3 rounded-full bg-surface">
                <div
                  className="h-3 rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-5 md:h-[480px]">
            {PIPELINE_STAGES.map((stage) => {
              const stageInterests = pipelineInterests.filter((i) => i.stage === stage.id);
              return (
                <div key={stage.id} className="flex flex-col h-full min-h-[200px] md:min-h-0 rounded-2xl bg-surface/50 border border-border/60 p-3">
                  <div className="flex justify-between items-center pb-2 border-b border-border/40 mb-3">
                    <span className="text-xs font-bold text-ink uppercase tracking-wider">{stage.label}</span>
                    <Badge className="bg-white text-muted border border-border/60 hover:bg-white">{stageInterests.length}</Badge>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-3 pr-0.5 no-scrollbar">
                    {stageInterests.length === 0 ? (
                      <div className="h-full flex items-center justify-center p-4 border border-dashed border-border/60 rounded-xl text-[10px] text-muted text-center">
                        No active deals
                      </div>
                    ) : (
                      stageInterests.map((interest) => (
                        <Card key={interest.id} className="border border-border bg-white shadow-line hover:shadow-soft transition duration-200">
                          <CardContent className="p-3.5 space-y-3">
                            <div className="flex justify-between items-start gap-1">
                              <div>
                                <p className="text-xs font-bold text-ink truncate leading-tight">{interest.name}</p>
                                <p className="text-[9px] text-muted truncate mt-0.5">{interest.location}</p>
                              </div>
                              <User size={14} className="text-muted/60" />
                            </div>

                            {interest.notes && (
                              <p className="text-[10px] text-muted leading-relaxed line-clamp-3 bg-surface p-2 rounded-lg border border-border/30">
                                {interest.notes}
                              </p>
                            )}

                            {/* Dropdown to adjust stage */}
                            <div className="pt-2 border-t border-border/40 flex justify-between items-center gap-1.5">
                              <span className="text-[9px] font-bold text-muted uppercase">Move:</span>
                              <select
                                value={interest.stage}
                                onChange={(e) => updatePipelineStage(interest.id, e.target.value)}
                                className="h-8 md:h-6 text-sm md:text-[9px] font-bold rounded-lg border border-border/80 bg-white px-1 focus:ring-0 focus:outline-none"
                              >
                                {PIPELINE_STAGES.map((stg) => (
                                  <option key={stg.id} value={stg.id}>
                                    {stg.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <Card className="border-dashed border-border py-16 text-center">
          <CardContent className="space-y-3">
            <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-surface text-muted">
              <Rocket size={22} />
            </div>
            <h3 className="text-lg font-semibold">No active funding round</h3>
            <p className="text-sm text-muted max-w-sm mx-auto">
              You haven't initialized a fundraising round. Use the "Add Round" button above to configure targets.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
