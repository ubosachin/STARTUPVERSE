import * as React from "react";
import { cn } from "@/lib/utils/cn";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "muted";

const variants: Record<BadgeVariant, string> = {
  default: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger: "bg-danger/10 text-danger",
  muted: "bg-surface text-muted"
};

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return (
    <span
      className={cn("inline-flex rounded-full px-3 py-1 text-xs font-bold", variants[variant], className)}
      {...props}
    />
  );
}
