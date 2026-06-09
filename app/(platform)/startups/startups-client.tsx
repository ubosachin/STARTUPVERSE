"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, Building2, TrendingUp, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

const stages = ["All", "Idea", "Pre-seed", "Seed", "Series-A", "Series-B", "Series-C"];

interface StartupsClientProps {
  initialStartups: any[];
}

export default function StartupsClient({ initialStartups }: StartupsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStage, setSelectedStage] = useState("All");

  const filtered = initialStartups.filter((startup) => {
    const matchesSearch =
      startup.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      startup.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      startup.industry.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStage =
      selectedStage === "All" ||
      startup.stage?.toLowerCase() === selectedStage.toLowerCase();

    return matchesSearch && matchesStage;
  });

  return (
    <div className="space-y-6">
      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={17} />
          <input
            className="h-11 w-full rounded-2xl border border-border bg-white pl-10 pr-4 text-base md:text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Search startups by name, industry, or tagline…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Stage filter pills */}
      <div className="flex flex-wrap gap-2">
        {stages.map((s) => (
          <button
            key={s}
            onClick={() => setSelectedStage(s)}
            className={cn(
              "rounded-xl border px-3.5 py-1.5 text-xs font-bold transition",
              selectedStage === s
                ? "border-ink bg-ink text-white"
                : "border-border bg-surface text-muted hover:border-ink hover:text-ink"
            )}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-border bg-surface py-20 text-center">
          <Building2 size={36} className="mx-auto mb-3 text-muted opacity-40 animate-pulse" />
          <p className="font-bold text-muted">No startups found</p>
          <p className="mt-1 text-sm text-muted">Try adjusting your search query or stage filters.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((startup) => (
            <Link key={startup.id} href={`/startups/${startup.slug}`}>
              <div className="group flex flex-col rounded-3xl border border-border bg-white p-6 hover-lift shadow-card cursor-pointer h-full justify-between">
                <div>
                  {/* Header */}
                  <div className="flex items-start gap-4 mb-4">
                    {startup.logo_url ? (
                      <img src={startup.logo_url} alt={startup.name} className="size-14 object-contain rounded-2xl border border-border p-2 bg-surface/30" />
                    ) : (
                      <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-blue text-white font-bold text-xl uppercase">
                        {startup.name.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-ink group-hover:text-primary transition-colors truncate text-sm">
                        {startup.name}
                      </h3>
                      <p className="text-xs text-muted mt-0.5 truncate">{startup.industry}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <Badge className="text-[10px] bg-surface border-border text-muted font-bold capitalize">{startup.stage}</Badge>
                        {startup.is_verified && (
                          <Badge className="text-[10px] bg-primary/10 border-primary/20 text-primary font-bold">✓ Verified</Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Tagline */}
                  <p className="text-xs text-muted leading-relaxed flex-1 line-clamp-3 mb-4">{startup.tagline}</p>
                </div>

                {/* Stats */}
                <div className="mt-auto flex items-center gap-4 border-t border-border/40 pt-4 text-[11px] font-bold text-muted">
                  <span className="flex items-center gap-1">
                    <Users size={12} />
                    {startup.team_size} team
                  </span>
                  <span className="flex items-center gap-1 capitalize">
                    <TrendingUp size={12} />
                    {startup.stage}
                  </span>
                  {startup.is_hiring && (
                    <span className="ml-auto text-success">● Hiring</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
