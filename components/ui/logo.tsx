import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils/cn";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "w-12 h-12",
  md: "w-16 h-16",
  lg: "w-24 h-24",
  xl: "w-32 h-32",
};

export function LogoMark({ size = "md", className }: LogoProps) {
  return (
    <div className={cn("relative shrink-0 flex items-center justify-center overflow-visible", sizeClasses[size], className)}>
      <Image 
        src="/logo.png" 
        alt="StartupVerse Logo" 
        fill 
        className="object-contain object-center scale-[2.5]" 
        sizes="(max-width: 768px) 100vw, 50vw"
      />
    </div>
  );
}

interface LogoFullProps extends LogoProps {
  textClassName?: string;
  hideTextOnMobile?: boolean;
}

export function Logo({ size = "md", className, textClassName, hideTextOnMobile = false }: LogoFullProps) {
  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-3xl",
  };

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LogoMark size={size} />
      <span
        className={cn(
          "font-bold tracking-tight text-ink",
          textSizes[size],
          hideTextOnMobile && "hidden sm:inline-block",
          textClassName
        )}
      >
        StartupVerse
      </span>
    </div>
  );
}
