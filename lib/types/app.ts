import type { LucideIcon } from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  roles?: string[];
};

export type Stat = {
  label: string;
  value: string;
  trend: string;
};

export type PageIntro = {
  eyebrow: string;
  title: string;
  description: string;
};
