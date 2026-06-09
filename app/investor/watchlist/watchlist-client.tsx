"use client";

import { useState } from "react";
import { Star, ChevronRight, Trash2, StickyNote } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { toggleFollowStartupAction } from "@/lib/actions/startups";
import { updateDealNotesAction } from "@/lib/actions/deals";

interface WatchlistClientProps {
  initialWatchlist: any[];
  initialNotes: Record<string, string>;
}

export default function WatchlistClient({ initialWatchlist, initialNotes }: WatchlistClientProps) {
  const [watchlist, setWatchlist] = useState<any[]>(initialWatchlist);
  const [notes, setNotes] = useState<Record<string, string>>(initialNotes);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [tempNote, setTempNote] = useState("");
  const [isPending, setIsPending] = useState<string | null>(null);

  async function handleRemove(startupId: string) {
    setIsPending(startupId);
    try {
      const res = await toggleFollowStartupAction(startupId);
      if (res.success) {
        setWatchlist((prev) => prev.filter((s) => s.id !== startupId));
        toast.success("Removed from watchlist");
      } else {
        toast.error(res.error || "Failed to remove startup");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred");
    } finally {
      setIsPending(null);
    }
  }

  async function handleSaveNote(startupId: string) {
    try {
      const res = await updateDealNotesAction(startupId, tempNote);
      if (res.success) {
        setNotes((prev) => ({ ...prev, [startupId]: tempNote }));
        setEditingNote(null);
        toast.success("Note saved");
      } else {
        toast.error(res.error || "Failed to save note");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred saving note");
    }
  }

  return (
    <div className="space-y-4">
      {watchlist.map((startup) => (
        <div key={startup.id} className="rounded-3xl border border-border bg-white p-5 hover-lift shadow-card">
          <div className="flex items-start gap-4">
            <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-blue text-white font-bold text-xl">
              {startup.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-ink">{startup.name}</h3>
                  <p className="text-sm text-muted mt-0.5 line-clamp-1">{startup.tagline}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge className="text-[10px] bg-surface border-border text-muted font-bold capitalize">{startup.stage}</Badge>
                    <Badge className="text-[10px] bg-surface border-border text-muted font-bold">{startup.industry}</Badge>
                    {startup.is_hiring && (
                      <Badge className="text-[10px] bg-success/10 border-success/20 text-success font-bold">● Hiring</Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link href={`/startups/${startup.slug}`}>
                    <Button variant="secondary" size="sm" className="gap-1.5">
                      <ChevronRight size={14} />
                      View
                    </Button>
                  </Link>
                  <button
                    onClick={() => handleRemove(startup.id)}
                    disabled={isPending === startup.id}
                    className="grid size-8 place-items-center rounded-xl border border-border text-muted transition hover:border-danger/30 hover:bg-danger/5 hover:text-danger disabled:opacity-50"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Note */}
              <div className="mt-3">
                {editingNote === startup.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={tempNote}
                      onChange={(e) => setTempNote(e.target.value)}
                      className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs resize-none focus:border-primary focus:outline-none"
                      rows={2}
                      placeholder="Add thesis note, status, or follow-up action…"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleSaveNote(startup.id)}>
                        Save note
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => setEditingNote(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setEditingNote(startup.id);
                      setTempNote(notes[startup.id] || "");
                    }}
                    className="flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-primary transition"
                  >
                    <StickyNote size={13} />
                    {notes[startup.id] ? (
                      <span className="line-clamp-1 text-ink">{notes[startup.id]}</span>
                    ) : (
                      "Add note"
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      {watchlist.length === 0 && (
        <div className="rounded-3xl border border-border bg-surface py-20 text-center">
          <Star size={36} className="mx-auto mb-3 text-muted opacity-40" />
          <p className="font-bold text-muted">Your watchlist is empty</p>
          <p className="mt-1 text-sm text-muted">Browse startups and click Watch to add them here.</p>
          <Link href="/startups" className="mt-4 inline-block">
            <Button size="sm">Browse startups</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
