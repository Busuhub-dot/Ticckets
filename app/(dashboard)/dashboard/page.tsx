import { requireAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

const TICKET_PRICE = 3900;

export default async function DashboardPage() {
  await requireAdmin();

  const [
    totalTickets,
    paidTickets,
    checkedInTickets,
    unpaidTickets,
    categories,
  ] = await Promise.all([
    // Total generated tickets
    prisma.ticket.count(),

    // Paid tickets
    prisma.ticket.count({
      where: {
        paymentStatus: "PAID",
      },
    }),

    // Checked-in tickets
    prisma.ticket.count({
      where: {
        checkInStatus: "CHECKED_IN",
      },
    }),

    // Unpaid tickets
    prisma.ticket.count({
      where: {
        paymentStatus: "UNPAID",
      },
    }),

    // Category statistics
    prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        code: true,

        _count: {
          select: {
            tickets: true,
          },
        },

        tickets: {
          where: {
            paymentStatus: "PAID",
          },
          select: {
            id: true,
          },
        },

        // We use filtered relation counts below through _count
      },
    }),
  ]);

  /*
   * Get category paid / checked-in counts without
   * loading every ticket into the browser.
   */
  const categoryPaidCounts = await prisma.ticket.groupBy({
    by: ["categoryId"],
    where: {
      paymentStatus: "PAID",
    },
    _count: {
      _all: true,
    },
  });

  const categoryCheckedInCounts = await prisma.ticket.groupBy({
    by: ["categoryId"],
    where: {
      checkInStatus: "CHECKED_IN",
    },
    _count: {
      _all: true,
    },
  });

  const categoryStats = categories.map((category) => {
    const paid =
      categoryPaidCounts.find((item) => item.categoryId === category.id)?._count
        ._all ?? 0;

    const checkedIn =
      categoryCheckedInCounts.find((item) => item.categoryId === category.id)
        ?._count._all ?? 0;

    return {
      id: category.id,
      name: category.name,
      code: category.code,
      total: category._count.tickets,
      paid,
      checkedIn,
      revenue: paid * TICKET_PRICE,
    };
  });

  const notCheckedInTickets = totalTickets - checkedInTickets;

  const totalRevenue = paidTickets * TICKET_PRICE;

  return (
    <main className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>

        <p className="mt-1 text-sm text-zinc-400">
          Overview of the event ticket management system.
        </p>
      </div>

      {/* Main Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard label="Tickets Generated" value={totalTickets} />

        <DashboardCard label="Tickets Sold" value={paidTickets} />

        <DashboardCard label="Checked In" value={checkedInTickets} />

        <DashboardCard label="Not Checked In" value={notCheckedInTickets} />
      </div>

      {/* Financial Statistics */}
      <div className="grid gap-4 sm:grid-cols-2">
        <DashboardCard
          label="Total Revenue"
          value={totalRevenue}
          prefix="Rs. "
        />

        <DashboardCard label="Unpaid Tickets" value={unpaidTickets} />
      </div>

      {/* Category Overview */}
      <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
        <div className="border-b border-zinc-800 p-6">
          <h2 className="text-lg font-semibold text-white">
            Category Overview
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Ticket, payment, check-in, and revenue statistics by category.
          </p>
        </div>

        {/* Desktop Header */}
        <div className="hidden border-b border-zinc-800 px-5 py-3 text-xs font-medium uppercase tracking-wide text-zinc-600 md:grid md:grid-cols-[1fr_auto_auto_auto_auto] md:gap-6">
          <div>Category</div>
          <div className="min-w-20">Generated</div>
          <div className="min-w-20">Paid</div>
          <div className="min-w-20">Checked In</div>
          <div className="min-w-32 text-right">Revenue</div>
        </div>

        {/* Categories */}
        <div className="divide-y divide-zinc-800">
          {categoryStats.map((category) => (
            <div
              key={category.id}
              className="grid gap-4 p-5 md:grid-cols-[1fr_auto_auto_auto_auto] md:items-center md:gap-6"
            >
              {/* Category */}
              <div>
                <p className="font-medium text-white">{category.name}</p>

                <p className="mt-1 text-xs text-zinc-500">
                  Category {category.code}
                </p>
              </div>

              {/* Generated */}
              <Stat label="Generated" value={category.total} />

              {/* Paid */}
              <Stat label="Paid" value={category.paid} />

              {/* Checked In */}
              <Stat label="Checked In" value={category.checkedIn} />

              {/* Revenue */}
              <div className="min-w-32 md:text-right">
                <p className="text-xs text-zinc-600">Revenue</p>

                <p className="mt-1 text-sm font-semibold text-white">
                  Rs. {category.revenue.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="border-t border-zinc-800 bg-zinc-900/40 p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-white">Total Revenue</p>

              <p className="mt-1 text-xs text-zinc-500">
                {paidTickets.toLocaleString()} paid tickets × Rs.{" "}
                {TICKET_PRICE.toLocaleString()}
              </p>
            </div>

            <p className="text-xl font-bold text-white">
              Rs. {totalRevenue.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

function DashboardCard({
  label,
  value,
  prefix = "",
}: {
  label: string;
  value: number;
  prefix?: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">
      <p className="text-sm text-zinc-400">{label}</p>

      <p className="mt-2 text-3xl font-bold text-white">
        {prefix}
        {value.toLocaleString()}
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-20">
      <p className="text-xs text-zinc-600 md:hidden">{label}</p>

      <p className="mt-1 text-sm font-semibold text-zinc-200">
        {value.toLocaleString()}
      </p>
    </div>
  );
}
