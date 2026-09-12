import { redirect } from "next/navigation";

import { requireAuth } from "@/lib/auth-helpers";

import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user;

  try {
    user = await requireAuth();
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      redirect("/login");
    }

    throw error;
  }

  return (
    <div className="min-h-screen bg-black">
      <Sidebar />

      <div className="md:pl-64">
        <MobileNav user={user} />

        <main className="min-h-screen p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
