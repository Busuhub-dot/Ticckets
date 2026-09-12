"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export function LogoutButton() {
  async function handleLogout() {
    await signOut({
      callbackUrl: "/login",
    });
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-zinc-800 bg-red-900/80 px-4 text-sm font-medium text-zinc-300 transition-all hover:border-red-900/60 hover:bg-red-950/30 hover:text-red-400 active:scale-[0.98]"
    >
      <LogOut className="h-4 w-4" />
      <span>Logout</span>
    </button>
  );
}
