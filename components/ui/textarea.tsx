import * as React from "react";
import { cn } from "@/lib/utils/cn";

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full resize-none rounded-2xl border border-border bg-white px-4 py-3 text-base md:text-sm shadow-none placeholder:text-muted focus:border-primary focus:ring-primary",
        className
      )}
      {...props}
    />
  );
}
