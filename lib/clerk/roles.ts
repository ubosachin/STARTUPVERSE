import type { UserRole } from "@/lib/types/database";

export const roles: UserRole[] = ["Founder", "Investor", "CoFounder", "Advisor", "Builder", "Admin"];

export function normalizeRole(value: unknown): UserRole {
  return roles.includes(value as UserRole) ? (value as UserRole) : "Builder";
}

export function canAccessRole(userRole: UserRole | undefined, allowedRoles?: UserRole[]) {
  if (!allowedRoles?.length) return true;
  if (userRole === "Admin") return true;
  return !!userRole && allowedRoles.includes(userRole);
}
