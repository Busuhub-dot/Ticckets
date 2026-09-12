import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { requireCategoryStaff } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { CreateTicketForm } from "@/components/tickets/create-ticket-form";

export default async function CreateTicketPage() {
  const user = await requireCategoryStaff();

  const categories = await prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
      code: true,
    },
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/tickets"
          className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to tickets
        </Link>

        <h1 className="text-2xl font-semibold text-white">Create Ticket</h1>

        <p className="mt-1 text-sm text-zinc-500">
          Create a new event ticket for a participant.
        </p>
      </div>

      {/* Form */}
      <CreateTicketForm
        categories={categories}
        userRole={user.role}
        userCategoryId={user.categoryId}
        userCategoryName={user.categoryName}
      />
    </div>
  );
}
