import type { UserRole } from "@/app/generated/prisma/client";

export function canManageAllTickets(role: UserRole) {
  return role === "ADMIN";
}

export function canCreateTickets(role: UserRole) {
  return role === "ADMIN" || role === "CATEGORY_STAFF";
}

export function canScanTickets(role: UserRole) {
  return role === "ADMIN" || role === "CATEGORY_STAFF";
}

export function canManageUsers(role: UserRole) {
  return role === "ADMIN";
}

export function canManageRequests(role: UserRole) {
  return role === "ADMIN" || role === "CATEGORY_STAFF";
}
