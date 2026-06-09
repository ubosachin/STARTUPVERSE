"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeMap = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl"
};

export function Dialog({ open, onClose, title, description, children, className, size = "md" }: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) {
      document.addEventListener("keydown", handleKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "dialog-title" : undefined}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={dialogRef}
        className={cn(
          "relative z-10 w-full rounded-3xl bg-white shadow-soft border border-border animate-scale-in",
          sizeMap[size],
          className
        )}
      >
        {(title || description) && (
          <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
            <div>
              {title && (
                <h2 id="dialog-title" className="text-lg font-semibold tracking-tight text-ink">
                  {title}
                </h2>
              )}
              {description && (
                <p className="mt-1 text-sm text-muted">{description}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="grid size-8 shrink-0 place-items-center rounded-xl text-muted transition hover:bg-surface hover:text-ink"
              aria-label="Close dialog"
            >
              <X size={16} />
            </button>
          </div>
        )}
        {!title && !description && (
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 grid size-8 place-items-center rounded-xl text-muted transition hover:bg-surface hover:text-ink"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
