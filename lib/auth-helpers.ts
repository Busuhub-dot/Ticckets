import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);

  return session?.user ?? null;
}

export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();

  if (user.role !== "ADMIN") {
    redirect("/tickets");
  }

  return user;
}

export async function requireCategoryStaff() {
  const user = await requireAuth();

  if (user.role !== "ADMIN" && user.role !== "CATEGORY_STAFF") {
    redirect("/tickets");
  }

  return user;
}

export async function requireCategoryAccess(categoryId: string) {
  const user = await requireCategoryStaff();

  if (user.role !== "ADMIN" && user.categoryId !== categoryId) {
    redirect("/tickets");
  }

  return user;
}
