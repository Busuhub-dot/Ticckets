import Link from "next/link";
import { Plus } from "lucide-react";

import { requireCategoryStaff } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

import { TicketList } from "@/components/tickets/ticket-list";

export default async function TicketsPage() {
  const user = await requireCategoryStaff();

  const tickets = await prisma.ticket.findMany({
    where:
      user.role === "CATEGORY_STAFF" && user.categoryId
        ? {
            categoryId: user.categoryId,
          }
        : undefined,

    select: {
      id: true,
      ticketNumber: true,
      participantName: true,
      qrToken: true,
      paymentStatus: true,
      checkInStatus: true,
      createdAt: true,

      category: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
      code: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Tickets</h1>

          <p className="mt-1 text-sm text-zinc-500">
            View and manage event tickets.
          </p>
        </div>

        <Link
          href="/tickets/create"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-medium text-white transition-colors hover:bg-red-700"
        >
          <Plus className="h-4 w-4" />
          Create Ticket
        </Link>
      </div>

      <TicketList
        tickets={tickets.map((ticket) => ({
          ...ticket,
          createdAt: ticket.createdAt.toISOString(),
        }))}
        categories={categories}
        userRole={user.role}
      />
    </div>
  );
}
