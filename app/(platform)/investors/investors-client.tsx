"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, BadgeDollarSign, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils/cn";

const focuses = ["All", "AI/ML", "Fintech", "Climate", "B2B SaaS", "Consumer", "Health"];

interface InvestorsClientProps {
  initialInvestors: any[];
}

export default function InvestorsClient({ initialInvestors }: InvestorsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFocus, setSelectedFocus] = useState("All");

  const filtered = initialInvestors.filter((inv) => {
    const matchesSearch =
      inv.firm_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.investment_thesis.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.username.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFocus =
      selectedFocus === "All" ||
      inv.focus_areas.some((area: string) => area.toLowerCase() === selectedFocus.toLowerCase());

    return matchesSearch && matchesFocus;
  });

  return (
    <div className="space-y-6">
      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={17} />
          <input
            className="h-11 w-full rounded-2xl border border-border bg-white pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Search by name, firm, or thesis…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Focus filter */}
      <div className="flex flex-wrap gap-2">
        {focuses.map((f) => (
          <button
            key={f}
            onClick={() => setSelectedFocus(f)}
            className={cn(
              "rounded-xl border px-3.5 py-1.5 text-xs font-bold transition",
              selectedFocus === f
                ? "border-ink bg-ink text-white"
                : "border-border bg-surface text-muted hover:border-ink hover:text-ink"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-border bg-surface py-20 text-center">
          <BadgeDollarSign size={36} className="mx-auto mb-3 text-muted opacity-40 animate-pulse" />
          <p className="font-bold text-muted">No investors found</p>
          <p className="mt-1 text-sm text-muted">Try adjusting your search query or focus category filters.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((inv) => (
            <Link key={inv.id} href={`/investors/${inv.username}`}>
              <div className="group flex flex-col rounded-3xl border border-border bg-white p-6 hover-lift shadow-card cursor-pointer h-full justify-between">
                <div>
                  {/* Header */}
                  <div className="flex items-start gap-4 mb-4">
                    {inv.avatarUrl ? (
                      <img src={inv.avatarUrl} alt={inv.firm_name} className="size-12 rounded-2xl object-cover border border-border" />
                    ) : (
                      <Avatar name={inv.firm_name} size="lg" />
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-ink group-hover:text-primary transition-colors text-sm truncate">
                        {inv.firm_name}
                      </h3>
                      <p className="text-xs text-muted mt-0.5">{inv.check_size}</p>
                      <Badge className="mt-2 text-[10px] bg-emerald-50 border-emerald-100 text-emerald-700 font-bold">
                        ● Active
                      </Badge>
                    </div>
                  </div>

                  {/* Thesis */}
                  <div className="mb-4">
                    <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Thesis</p>
                    <p className="text-xs text-ink leading-relaxed line-clamp-3">{inv.investment_thesis}</p>
                  </div>

                  {/* Focus areas */}
                  <div className="mb-4">
                    <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-2">Focus areas</p>
                    <div className="flex flex-wrap gap-1.5">
                      {inv.focus_areas.slice(0, 4).map((area: string) => (
                        <Badge key={area} className="text-[10px] bg-surface border-border text-muted font-bold capitalize">{area}</Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="mt-auto flex items-center gap-4 border-t border-border/40 pt-4 text-[11px] font-bold text-muted">
                  <span className="flex items-center gap-1">
                    <BadgeDollarSign size={12} />
                    {inv.portfolio_companies?.length || 0} portfolio
                  </span>
                  <span className="flex items-center gap-1 truncate max-w-[140px]">
                    <TrendingUp size={12} className="shrink-0" />
                    <span className="truncate capitalize">{inv.preferred_stages?.join(", ") || "Early"}</span>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
