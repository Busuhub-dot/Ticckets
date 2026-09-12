"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { LayoutDashboard, ScanLine, Ticket, Users } from "lucide-react";

type SidebarNavProps = {
  userRole: "ADMIN" | "CATEGORY_STAFF";
};

const navigation = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    adminOnly: true,
  },
  {
    label: "Tickets",
    href: "/tickets",
    icon: Ticket,
    adminOnly: false,
  },
  {
    label: "Scanner",
    href: "/scanner",
    icon: ScanLine,
    adminOnly: false,
  },
  //   {
  //     label: "Users",
  //     href: "/users",
  //     icon: Users,
  //     adminOnly: true,
  //   },
];

export function SidebarNav({ userRole }: SidebarNavProps) {
  const pathname = usePathname();

  const visibleNavigation = navigation.filter(
    (item) => !item.adminOnly || userRole === "ADMIN",
  );

  return (
    <nav className="flex-1 space-y-1 p-4">
      <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
        Navigation
      </p>

      <div className="space-y-1">
        {visibleNavigation.map((item) => {
          const Icon = item.icon;

          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-red-600/10 text-red-500"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
              }`}
            >
              <Icon
                className={`h-5 w-5 shrink-0 transition-colors ${
                  isActive
                    ? "text-red-500"
                    : "text-zinc-500 group-hover:text-white"
                }`}
              />

              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
