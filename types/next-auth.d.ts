import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "CATEGORY_STAFF";
      categoryId: string | null;
      categoryName: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: "ADMIN" | "CATEGORY_STAFF";
    categoryId: string | null;
    categoryName: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "ADMIN" | "CATEGORY_STAFF";
    categoryId: string | null;
    categoryName: string | null;
  }
}
