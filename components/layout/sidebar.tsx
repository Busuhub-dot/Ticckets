import { Ticket, UserCircle } from "lucide-react";

import { getCurrentUser } from "@/lib/auth-helpers";
import { LogoutButton } from "@/components/layout/logout-button";
import { SidebarNav } from "@/components/layout/sidebar-nav";

export async function Sidebar() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-zinc-800 bg-zinc-950 md:block">
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex h-16 shrink-0 items-center border-b border-zinc-800 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-600">
              <Ticket className="h-5 w-5 text-white" />
            </div>

            <div>
              <p className="font-semibold text-white">Event Tickets</p>

              <p className="text-xs text-zinc-500">Management System</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <SidebarNav userRole={user.role} />

        {/* User Section */}
        <div className="shrink-0 border-t border-zinc-800 px-4 pt-4">
          <div className="mb-3 flex items-center gap-3 rounded-lg bg-zinc-900/70 p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-800">
              <UserCircle className="h-5 w-5 text-zinc-400" />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">
                {user.name}
              </p>

              <p className="truncate text-xs text-zinc-500">
                {user.role === "ADMIN"
                  ? "Administrator"
                  : (user.categoryName ?? "Category Staff")}
              </p>
            </div>
          </div>

          <LogoutButton />

          <div className="flex justify-center mt-5 mb-3">
            <a
              href="https://github.com/ukihunter"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 text-xs text-zinc-600 transition-colors hover:text-zinc-300"
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="h-3.5 w-3.5 fill-current transition-colors group-hover:text-white"
              >
                <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.09 3.3 9.41 7.88 10.94.58.1.79-.25.79-.56v-2.01c-3.2.7-3.87-1.54-3.87-1.54-.53-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.56-.29-5.26-1.28-5.26-5.7 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.47.11-3.06 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.77.11 3.06.73.81 1.18 1.84 1.18 3.1 0 4.43-2.7 5.41-5.27 5.69.41.35.78 1.04.78 2.1v3.11c0 .3.21.66.8.55C20.2 21.4 23.5 17.09 23.5 12 23.5 5.65 18.35.5 12 .5Z" />
              </svg>

              <span>
                Developed by{" "}
                <span className="text-zinc-500 group-hover:text-white">
                  Uki Hunter
                </span>
              </span>
            </a>
          </div>
        </div>
      </div>
    </aside>
  );
}
