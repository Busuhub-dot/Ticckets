"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  Loader2,
  Printer,
  Search,
  Ticket,
  XCircle,
} from "lucide-react";

import { generateTicketPdf } from "@/lib/generate-ticket-pdf";

type TicketItem = {
  id: string;
  ticketNumber: string;
  participantName: string;
  qrToken: string;
  paymentStatus: "UNPAID" | "PAID" | "CANCELLED";
  checkInStatus: "NOT_CHECKED_IN" | "CHECKED_IN";
  createdAt: string;
  category: {
    id: string;
    name: string;
    code: string;
  };
};

type Category = {
  id: string;
  name: string;
  code: string;
};

type TicketListProps = {
  tickets: TicketItem[];
  categories: Category[];
  userRole: "ADMIN" | "CATEGORY_STAFF";
};

const ITEMS_PER_PAGE = 10;

export function TicketList({ tickets, categories, userRole }: TicketListProps) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [paymentFilter, setPaymentFilter] = useState("ALL");
  const [checkInFilter, setCheckInFilter] = useState("ALL");

  const [currentPage, setCurrentPage] = useState(1);
  const [printingTicketId, setPrintingTicketId] = useState<string | null>(null);

  const filteredTickets = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return tickets.filter((ticket) => {
      const matchesSearch =
        !normalizedSearch ||
        ticket.ticketNumber.toLowerCase().includes(normalizedSearch) ||
        ticket.participantName.toLowerCase().includes(normalizedSearch);

      const matchesCategory =
        categoryFilter === "ALL" || ticket.category.id === categoryFilter;

      const matchesPayment =
        paymentFilter === "ALL" || ticket.paymentStatus === paymentFilter;

      const matchesCheckIn =
        checkInFilter === "ALL" || ticket.checkInStatus === checkInFilter;

      return (
        matchesSearch && matchesCategory && matchesPayment && matchesCheckIn
      );
    });
  }, [tickets, search, categoryFilter, paymentFilter, checkInFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredTickets.length / ITEMS_PER_PAGE),
  );

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedTickets = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;

    return filteredTickets.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredTickets, safeCurrentPage]);

  const pageNumbers = useMemo(() => {
    const pages: number[] = [];

    for (let page = 1; page <= totalPages; page++) {
      pages.push(page);
    }

    return pages;
  }, [totalPages]);

  const hasFilters =
    Boolean(search) ||
    categoryFilter !== "ALL" ||
    paymentFilter !== "ALL" ||
    checkInFilter !== "ALL";

  function resetToFirstPage() {
    setCurrentPage(1);
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    resetToFirstPage();
  }

  function handleCategoryChange(value: string) {
    setCategoryFilter(value);
    resetToFirstPage();
  }

  function handlePaymentChange(value: string) {
    setPaymentFilter(value);
    resetToFirstPage();
  }

  function handleCheckInChange(value: string) {
    setCheckInFilter(value);
    resetToFirstPage();
  }

  async function handlePrintTicket(ticket: TicketItem) {
    setPrintingTicketId(ticket.id);

    try {
      const pdf = await generateTicketPdf({
        ticketNumber: ticket.ticketNumber,
        qrToken: ticket.qrToken,
      });

      const participantName =
        ticket.participantName
          ?.trim()
          .replace(/[^a-zA-Z0-9\s_-]/g, "")
          .replace(/\s+/g, "-") || "Ticket";

      const fileName = `${participantName}-${ticket.ticketNumber}.pdf`;

      pdf.save(fileName);
    } catch (error) {
      console.error("Failed to generate ticket PDF:", error);
      alert("Failed to generate the ticket PDF. Please try again.");
    } finally {
      setPrintingTicketId(null);
    }
  }

  function clearFilters() {
    setSearch("");
    setCategoryFilter("ALL");
    setPaymentFilter("ALL");
    setCheckInFilter("ALL");
    setCurrentPage(1);
  }

  function goToPage(page: number) {
    if (page < 1 || page > totalPages) {
      return;
    }

    setCurrentPage(page);
  }

  const startItem =
    filteredTickets.length === 0
      ? 0
      : (safeCurrentPage - 1) * ITEMS_PER_PAGE + 1;

  const endItem = Math.min(
    safeCurrentPage * ITEMS_PER_PAGE,
    filteredTickets.length,
  );

  return (
    <div className="space-y-4">
      {/* --------------------------------------------------------- */}
      {/* Filters */}
      {/* --------------------------------------------------------- */}

      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
        <div className="mb-4 flex items-center gap-2">
          <Filter className="h-4 w-4 text-zinc-500" />

          <h2 className="text-sm font-medium text-zinc-300">Filter Tickets</h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* Search */}

          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />

            <input
              type="text"
              value={search}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="Search ticket or participant..."
              className="h-10 w-full rounded-lg border border-zinc-800 bg-zinc-900 pl-9 pr-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-red-600"
            />
          </div>

          {/* Category */}

          {userRole === "ADMIN" && (
            <select
              value={categoryFilter}
              onChange={(event) => handleCategoryChange(event.target.value)}
              className="h-10 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-sm font-sans text-white outline-none transition focus:border-red-600"
            >
              <option value="ALL">All Categories</option>

              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name} ({category.code})
                </option>
              ))}
            </select>
          )}

          {/* Payment */}

          <select
            value={paymentFilter}
            onChange={(event) => handlePaymentChange(event.target.value)}
            className="h-10 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-sm font-sans text-white outline-none transition focus:border-red-600"
          >
            <option value="ALL">All Payment Status</option>
            <option value="PAID">Paid</option>
            <option value="UNPAID">Unpaid</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          {/* Check-in */}

          <select
            value={checkInFilter}
            onChange={(event) => handleCheckInChange(event.target.value)}
            className="h-10 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-sm font-sans text-white outline-none transition focus:border-red-600"
          >
            <option value="ALL">All Check-in Status</option>
            <option value="CHECKED_IN">Checked In</option>
            <option value="NOT_CHECKED_IN">Not Checked In</option>
          </select>
        </div>

        {/* Filter information */}

        {hasFilters && (
          <div className="mt-4 flex flex-col gap-2 border-t border-zinc-800 pt-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-zinc-500">
              Showing {filteredTickets.length} of {tickets.length} tickets
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="self-start text-xs font-medium text-red-400 transition-colors hover:text-red-300 sm:self-auto"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* --------------------------------------------------------- */}
      {/* Ticket count */}
      {/* --------------------------------------------------------- */}

      {filteredTickets.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-zinc-500">
            Showing{" "}
            <span className="font-medium text-zinc-300">
              {startItem}-{endItem}
            </span>{" "}
            of{" "}
            <span className="font-medium text-zinc-300">
              {filteredTickets.length}
            </span>{" "}
            tickets
          </p>
        </div>
      )}

      {/* --------------------------------------------------------- */}
      {/* Empty state */}
      {/* --------------------------------------------------------- */}

      {filteredTickets.length === 0 ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-950 px-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-zinc-900">
            <Ticket className="h-7 w-7 text-zinc-500" />
          </div>

          <h2 className="mt-4 text-lg font-medium text-white">
            {tickets.length === 0 ? "No tickets yet" : "No matching tickets"}
          </h2>

          <p className="mt-1 max-w-sm text-center text-sm text-zinc-500">
            {tickets.length === 0
              ? "Create the first ticket for the event."
              : "Try changing your search or filters."}
          </p>

          {tickets.length === 0 ? (
            <Link
              href="/tickets/create"
              className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg border border-zinc-700 px-4 text-sm font-medium text-zinc-200 transition-colors hover:bg-zinc-900"
            >
              <Ticket className="h-4 w-4" />
              Create Ticket
            </Link>
          ) : (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg border border-zinc-700 px-4 text-sm font-medium text-zinc-200 transition-colors hover:bg-zinc-900"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <>
          {/* ----------------------------------------------------- */}
          {/* Desktop table */}
          {/* ----------------------------------------------------- */}

          <div className="hidden overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px]">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900/50">
                    <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                      Ticket
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                      Participant
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                      Category
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                      Payment
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                      Check-in
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                      Created
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-zinc-800">
                  {paginatedTickets.map((ticket) => {
                    const printing = printingTicketId === ticket.id;

                    return (
                      <tr
                        key={ticket.id}
                        className="transition-colors hover:bg-zinc-900/40"
                      >
                        {/* Ticket */}

                        <td className="px-5 py-4">
                          <span className="font-mono text-sm font-bold tracking-wide text-red-400">
                            {ticket.ticketNumber}
                          </span>
                        </td>

                        {/* Participant */}

                        <td className="px-5 py-4">
                          <span className="text-sm font-medium text-white">
                            {ticket.participantName}
                          </span>
                        </td>

                        {/* Category */}

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-zinc-300">
                              {ticket.category.name}
                            </span>

                            <span className="rounded-md bg-zinc-800 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-400">
                              {ticket.category.code}
                            </span>
                          </div>
                        </td>

                        {/* Payment */}

                        <td className="px-5 py-4">
                          <PaymentBadge status={ticket.paymentStatus} />
                        </td>

                        {/* Check-in */}

                        <td className="px-5 py-4">
                          <CheckInBadge status={ticket.checkInStatus} />
                        </td>

                        {/* Created */}

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5 text-sm text-zinc-500">
                            <CalendarDays className="h-3.5 w-3.5" />

                            {formatDate(ticket.createdAt)}
                          </div>
                        </td>

                        {/* Action */}

                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => handlePrintTicket(ticket)}
                            disabled={printing}
                            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-zinc-700 px-3 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {printing ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Printer className="h-3.5 w-3.5" />
                            )}

                            {printing ? "Generating..." : "Print Ticket"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ----------------------------------------------------- */}
          {/* Mobile cards */}
          {/* ----------------------------------------------------- */}

          <div className="space-y-3 md:hidden">
            {paginatedTickets.map((ticket) => {
              const printing = printingTicketId === ticket.id;

              return (
                <div
                  key={ticket.id}
                  className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4"
                >
                  {/* Top */}

                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
                        Ticket
                      </p>

                      <p className="mt-1 font-mono text-xl font-bold tracking-wide text-red-400">
                        {ticket.ticketNumber}
                      </p>
                    </div>

                    <span className="shrink-0 rounded-md bg-zinc-900 px-2 py-1 text-xs font-semibold text-zinc-400">
                      {ticket.category.code}
                    </span>
                  </div>

                  {/* Participant */}

                  <div className="mt-4">
                    <p className="text-xs text-zinc-600">Participant</p>

                    <p className="mt-1 truncate text-sm font-medium text-white">
                      {ticket.participantName}
                    </p>
                  </div>

                  {/* Category */}

                  <div className="mt-3">
                    <p className="text-xs text-zinc-600">Category</p>

                    <p className="mt-1 text-sm text-zinc-300">
                      {ticket.category.name}
                    </p>
                  </div>

                  {/* Status */}

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div>
                      <p className="mb-1.5 text-xs text-zinc-600">Payment</p>

                      <PaymentBadge status={ticket.paymentStatus} />
                    </div>

                    <div>
                      <p className="mb-1.5 text-xs text-zinc-600">Check-in</p>

                      <CheckInBadge status={ticket.checkInStatus} />
                    </div>
                  </div>

                  {/* Created */}

                  <div className="mt-4 flex items-center gap-1.5 border-t border-zinc-800 pt-3 text-xs text-zinc-600">
                    <CalendarDays className="h-3.5 w-3.5" />

                    {formatDate(ticket.createdAt)}
                  </div>

                  {/* Print */}

                  <button
                    type="button"
                    onClick={() => handlePrintTicket(ticket)}
                    disabled={printing}
                    className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {printing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Printer className="h-4 w-4" />
                    )}

                    {printing ? "Generating Ticket..." : "Print Ticket"}
                  </button>
                </div>
              );
            })}
          </div>

          {/* ----------------------------------------------------- */}
          {/* Pagination */}
          {/* ----------------------------------------------------- */}

          {totalPages > 1 && (
            <div className="flex flex-col gap-3 border-t border-zinc-800 pt-4 sm:flex-row sm:items-center sm:justify-between">
              {/* Page information */}

              <p className="text-xs text-zinc-500">
                Page {safeCurrentPage} of {totalPages}
              </p>

              {/* Pagination controls */}

              <div className="flex items-center justify-center gap-1">
                {/* Previous */}

                <button
                  type="button"
                  onClick={() => goToPage(safeCurrentPage - 1)}
                  disabled={safeCurrentPage === 1}
                  aria-label="Previous page"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {/* Page numbers */}

                <div className="flex items-center gap-1">
                  {pageNumbers.map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => goToPage(page)}
                      className={
                        page === safeCurrentPage
                          ? "flex h-9 min-w-9 items-center justify-center rounded-lg bg-red-600 px-2 text-xs font-medium text-white"
                          : "flex h-9 min-w-9 items-center justify-center rounded-lg border border-zinc-800 px-2 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-white"
                      }
                    >
                      {page}
                    </button>
                  ))}
                </div>

                {/* Next */}

                <button
                  type="button"
                  onClick={() => goToPage(safeCurrentPage + 1)}
                  disabled={safeCurrentPage === totalPages}
                  aria-label="Next page"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Payment Badge */
/* ---------------------------------------------------------------- */

function PaymentBadge({ status }: { status: TicketItem["paymentStatus"] }) {
  if (status === "PAID") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-400">
        <CheckCircle2 className="h-3 w-3" />
        Paid
      </span>
    );
  }

  if (status === "CANCELLED") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-400">
        <XCircle className="h-3 w-3" />
        Cancelled
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-500/10 px-2.5 py-1 text-xs font-medium text-yellow-400">
      <Clock className="h-3 w-3" />
      Unpaid
    </span>
  );
}

/* ---------------------------------------------------------------- */
/* Check-in Badge */
/* ---------------------------------------------------------------- */

function CheckInBadge({ status }: { status: TicketItem["checkInStatus"] }) {
  if (status === "CHECKED_IN") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-400">
        <CheckCircle2 className="h-3 w-3" />
        Checked In
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-400">
      Not Checked In
    </span>
  );
}

/* ---------------------------------------------------------------- */
/* Date */
/* ---------------------------------------------------------------- */

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}
