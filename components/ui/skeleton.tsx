import { cn } from "@/lib/utils/cn";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-shimmer rounded-xl bg-gradient-to-r from-surface via-border to-surface bg-[length:200%_100%]",
        className
      )}
      aria-hidden="true"
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-border bg-white p-5 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="size-12 rounded-2xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-3/4" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-8 w-20 rounded-xl" />
        <Skeleton className="h-8 w-20 rounded-xl" />
      </div>
    </div>
  );
}

export function SkeletonPost() {
  return (
    <div className="rounded-2xl border border-border bg-white p-5 space-y-4">
      <div className="flex gap-3">
        <Skeleton className="size-11 shrink-0 rounded-2xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-40" />
          <Skeleton className="mt-3 h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-7 w-16 rounded-xl" />
            <Skeleton className="h-7 w-16 rounded-xl" />
            <Skeleton className="h-7 w-16 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
