import * as React from "react";
import { cn } from "@/lib/utils/cn";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "min-h-[44px] w-full rounded-2xl border border-border bg-white px-4 text-base md:text-sm shadow-none placeholder:text-muted focus:border-primary focus:ring-primary",
        className
      )}
      {...props}
    />
  );
}
