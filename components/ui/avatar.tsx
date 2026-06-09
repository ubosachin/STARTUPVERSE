"use client";

import { cn } from "@/lib/utils/cn";

interface AvatarProps {
  name?: string;
  src?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  xs: "size-7 text-[10px]",
  sm: "size-9 text-xs",
  md: "size-11 text-sm",
  lg: "size-14 text-base",
  xl: "size-20 text-xl"
};

const colorMap = [
  "bg-blue-600",
  "bg-indigo-600",
  "bg-violet-600",
  "bg-emerald-600",
  "bg-teal-600",
  "bg-sky-600",
  "bg-rose-600",
  "bg-amber-600"
];

function getColorFromName(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colorMap[Math.abs(hash) % colorMap.length];
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function Avatar({ name = "U", src, size = "md", className }: AvatarProps) {
  const color = getColorFromName(name);
  const sizeClass = sizeMap[size];

  if (src) {
    return (
      <div className={cn("shrink-0 overflow-hidden rounded-2xl", sizeClass, className)}>
        <img src={src} alt={name} className="h-full w-full object-cover" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid shrink-0 place-items-center rounded-2xl font-bold text-white",
        sizeClass,
        color,
        className
      )}
      aria-label={name}
    >
      {getInitials(name)}
    </div>
  );
}
