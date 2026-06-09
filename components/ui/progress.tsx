import { cn } from "@/lib/utils/cn";

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  trackClassName?: string;
  barClassName?: string;
  label?: string;
  showValue?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-4"
};

export function Progress({
  value,
  max = 100,
  className,
  trackClassName,
  barClassName,
  label,
  showValue = false,
  size = "md"
}: ProgressProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn("space-y-1.5", className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between text-xs font-semibold text-muted">
          {label && <span>{label}</span>}
          {showValue && <span>{Math.round(pct)}%</span>}
        </div>
      )}
      <div
        className={cn("w-full overflow-hidden rounded-full bg-surface", sizeMap[size], trackClassName)}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
      >
        <div
          className={cn("h-full rounded-full bg-primary transition-all duration-500", barClassName)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
