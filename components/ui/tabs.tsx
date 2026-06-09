"use client";

import { cn } from "@/lib/utils/cn";

interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
  variant?: "pill" | "underline" | "card";
}

export function Tabs({ tabs, active, onChange, className, variant = "pill" }: TabsProps) {
  if (variant === "underline") {
    return (
      <div className={cn("flex border-b border-border/80", className)}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex items-center gap-2 border-b-2 px-4 pb-3 pt-1 text-sm font-semibold transition-colors",
              active === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted hover:text-ink"
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                  active === tab.id ? "bg-primary/10 text-primary" : "bg-surface text-muted"
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div className={cn("flex gap-1 rounded-2xl bg-surface p-1", className)}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-all",
              active === tab.id
                ? "bg-white text-ink shadow-card"
                : "text-muted hover:text-ink"
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                  active === tab.id ? "bg-primary text-white" : "bg-border text-muted"
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
    );
  }

  // Default: pill
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold transition-all",
            active === tab.id
              ? "border-ink bg-ink text-white"
              : "border-border bg-surface text-ink/80 hover:bg-white hover:text-ink"
          )}
        >
          {tab.label}
          {tab.count !== undefined && tab.count > 0 && (
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[10px] font-extrabold",
                active === tab.id ? "bg-white text-ink" : "bg-primary text-white"
              )}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
