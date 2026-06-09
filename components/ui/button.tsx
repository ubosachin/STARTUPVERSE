import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const buttonVariants = cva(
  "inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-semibold transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-primary text-white shadow-lg shadow-blue-100 hover:bg-blue-700",
        secondary: "border border-border bg-white text-ink hover:bg-surface",
        ghost: "text-muted hover:bg-surface hover:text-ink",
        dark: "bg-ink text-white hover:bg-slate-800"
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 rounded-xl px-3 text-xs",
        lg: "h-14 rounded-2xl px-8 text-base",
        icon: "size-11 rounded-2xl p-0"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "default"
    }
  }
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { buttonVariants };
