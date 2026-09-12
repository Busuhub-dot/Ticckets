"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import { CheckCircle2, Loader2, Printer, Ticket } from "lucide-react";

import Link from "next/link";

import { generateTicketPdf } from "@/lib/generate-ticket-pdf";

type Category = {
  id: string;
  name: string;
  code: string;
};

type PaymentStatus = "UNPAID" | "PAID";

type CreateTicketFormProps = {
  categories: Category[];
  userRole: "ADMIN" | "CATEGORY_STAFF";
  userCategoryId: string | null;
  userCategoryName: string | null;
};

type CreatedTicket = {
  id: string;
  ticketNumber: string;
  participantName: string;
  qrToken: string;
  paymentStatus: string;
  checkInStatus: string;
  category: {
    id: string;
    name: string;
    code: string;
  };
};

export function CreateTicketForm({
  categories,
  userRole,
  userCategoryId,
  userCategoryName,
}: CreateTicketFormProps) {
  const [participantName, setParticipantName] = useState("");

  const [categoryId, setCategoryId] = useState(
    userRole === "CATEGORY_STAFF" ? (userCategoryId ?? "") : "",
  );

  const [nextTicketNumber, setNextTicketNumber] = useState("");

  const [loadingNextNumber, setLoadingNextNumber] = useState(false);

  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("PAID");

  const [loading, setLoading] = useState(false);

  const [printing, setPrinting] = useState(false);

  const [error, setError] = useState("");

  const [createdTicket, setCreatedTicket] = useState<CreatedTicket | null>(
    null,
  );

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === categoryId),
    [categories, categoryId],
  );

  // ------------------------------------------------------------
  // Load next ticket number
  // ------------------------------------------------------------

  useEffect(() => {
    if (!categoryId) {
      return;
    }

    let cancelled = false;

    async function loadNextTicketNumber() {
      setLoadingNextNumber(true);

      try {
        const response = await fetch(
          `/api/tickets/next-number?categoryId=${encodeURIComponent(
            categoryId,
          )}`,
          {
            method: "GET",
            cache: "no-store",
          },
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          if (!cancelled) {
            setNextTicketNumber("");
          }

          return;
        }

        if (!cancelled) {
          setNextTicketNumber(data.ticketNumber);
        }
      } catch {
        if (!cancelled) {
          setNextTicketNumber("");
        }
      } finally {
        if (!cancelled) {
          setLoadingNextNumber(false);
        }
      }
    }

    loadNextTicketNumber();

    return () => {
      cancelled = true;
    };
  }, [categoryId]);

  // ------------------------------------------------------------
  // Print ticket
  // ------------------------------------------------------------

  async function handlePrintTicket() {
    if (!createdTicket || printing) {
      return;
    }

    setError("");
    setPrinting(true);

    try {
      const pdf = await generateTicketPdf({
        ticketNumber: createdTicket.ticketNumber,
        qrToken: createdTicket.qrToken,
      });

      const blob = pdf.output("blob");

      const url = URL.createObjectURL(blob);

      const printWindow = window.open(url, "_blank");

      if (!printWindow) {
        URL.revokeObjectURL(url);

        setError(
          "Unable to open the ticket PDF. Please allow pop-ups and try again.",
        );

        return;
      }

      /*
       * Give the browser time to load the PDF before
       * releasing the object URL.
       */
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 60_000);
    } catch (error) {
      console.error("Failed to generate ticket PDF:", error);

      setError("Failed to generate the ticket PDF. Please try again.");
    } finally {
      setPrinting(false);
    }
  }

  // ------------------------------------------------------------
  // Create ticket
  // ------------------------------------------------------------

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setCreatedTicket(null);

    const trimmedName = participantName.trim();

    if (!trimmedName) {
      setError("Please enter the participant name.");
      return;
    }

    if (!categoryId) {
      setError("Please select a category.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          participantName: trimmedName,
          categoryId,
          paymentStatus,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message ?? "Failed to create the ticket.");

        return;
      }

      setCreatedTicket(data.ticket);
      setParticipantName("");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // ------------------------------------------------------------
  // Success state
  // ------------------------------------------------------------

  if (createdTicket) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
        <div className="flex flex-col items-center text-center">
          {/* Success icon */}

          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10">
            <CheckCircle2 className="h-7 w-7 text-green-500" />
          </div>

          <h2 className="mt-4 text-xl font-semibold text-white">
            Ticket Created
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            The ticket was successfully created.
          </p>

          {/* Ticket details */}

          <div className="mt-6 w-full rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Ticket Number
            </p>

            <p className="mt-2 text-4xl font-bold tracking-wider text-red-500">
              {createdTicket.ticketNumber}
            </p>

            <div className="mt-5 space-y-3 border-t border-zinc-800 pt-4 text-left">
              {/* Participant */}

              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-zinc-500">Participant</span>

                <span className="text-sm font-medium text-white">
                  {createdTicket.participantName}
                </span>
              </div>

              {/* Category */}

              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-zinc-500">Category</span>

                <span className="text-sm font-medium text-white">
                  {createdTicket.category.name}
                </span>
              </div>

              {/* Payment */}

              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-zinc-500">Payment</span>

                <span className="rounded-full bg-yellow-500/10 px-2.5 py-1 text-xs font-medium text-yellow-500">
                  {createdTicket.paymentStatus}
                </span>
              </div>

              {/* Check-in */}

              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-zinc-500">Check-in</span>

                <span className="rounded-full bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-400">
                  Not checked in
                </span>
              </div>
            </div>
          </div>

          {/* Error */}

          {error && (
            <div className="mt-4 w-full rounded-lg border border-red-900/50 bg-red-950/30 px-3 py-3 text-left text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Actions */}

          <div className="mt-6 grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
            {/* Print */}
            <button
              type="button"
              onClick={handlePrintTicket}
              disabled={printing}
              className="flex h-11 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {printing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Printer className="h-4 w-4" />
              )}
              {printing ? "Generating..." : "Print Ticket"}
            </button>

            {/* Create Another */}
            <button
              type="button"
              onClick={() => {
                setCreatedTicket(null);
                setError("");
              }}
              className="flex h-11 items-center justify-center gap-2 rounded-lg border border-zinc-700 px-4 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-900 hover:text-white"
            >
              <Ticket className="h-4 w-4" />
              Create Another
            </button>

            {/* View Tickets */}
            <Link
              href="/tickets"
              className="flex h-11 items-center justify-center rounded-lg border border-zinc-800 px-4 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-white"
            >
              View Tickets
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------
  // Form
  // ------------------------------------------------------------

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6"
    >
      <div className="space-y-6">
        {/* Ticket number preview */}

        <div>
          <label
            htmlFor="ticketNumber"
            className="mb-2 block text-sm font-medium text-zinc-300"
          >
            Ticket Number
          </label>

          <div className="relative">
            <input
              id="ticketNumber"
              type="text"
              value={
                loadingNextNumber
                  ? "Loading..."
                  : nextTicketNumber || "Automatically generated"
              }
              readOnly
              disabled
              className="h-11 w-full rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 pr-10 font-mono text-sm font-semibold text-zinc-500 outline-none disabled:cursor-not-allowed"
            />

            <Ticket className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
          </div>

          <p className="mt-2 text-xs text-zinc-600">
            Preview of the next ticket number. The final number is assigned
            automatically when the ticket is created.
          </p>
        </div>

        {/* Participant name */}

        <div>
          <label
            htmlFor="participantName"
            className="mb-2 block text-sm font-medium text-zinc-300"
          >
            Participant Name
          </label>

          <input
            id="participantName"
            name="participantName"
            type="text"
            value={participantName}
            onChange={(event) => setParticipantName(event.target.value)}
            placeholder="Enter participant name"
            autoComplete="off"
            disabled={loading}
            className="h-11 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-red-600 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>

        {/* Category */}

        <div>
          <label
            htmlFor="category"
            className="mb-2 block text-sm font-medium text-zinc-300"
          >
            Category
          </label>

          {userRole === "CATEGORY_STAFF" ? (
            <>
              <div className="flex h-11 items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900 px-3">
                <span className="text-sm text-white">
                  {userCategoryName ?? "Your category"}
                </span>

                {selectedCategory && (
                  <span className="rounded-md bg-red-500/10 px-2 py-1 text-xs font-semibold text-red-400">
                    {selectedCategory.code}
                  </span>
                )}
              </div>

              <p className="mt-2 text-xs text-zinc-600">
                Your account is assigned to this category.
              </p>
            </>
          ) : (
            <select
              id="category"
              name="category"
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              disabled={loading}
              className="h-11 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-sm text-white outline-none transition focus:border-red-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="">Select category</option>

              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name} ({category.code})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Payment status */}

        <div>
          <label
            htmlFor="paymentStatus"
            className="mb-2 block text-sm font-medium text-zinc-300"
          >
            Payment Status
          </label>

          <select
            id="paymentStatus"
            name="paymentStatus"
            value={paymentStatus}
            onChange={(event) =>
              setPaymentStatus(event.target.value as PaymentStatus)
            }
            disabled={loading}
            className="h-11 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-sm font-sans text-white outline-none transition focus:border-red-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <option
              value="UNPAID"
              className="bg-zinc-900 text-sm font-sans text-white"
            >
              Unpaid
            </option>

            <option
              value="PAID"
              className="bg-zinc-900 text-sm font-sans text-white"
            >
              Paid
            </option>
          </select>

          <p className="mt-2 text-xs text-zinc-600">
            Select whether the participant has already paid for the ticket.
          </p>
        </div>

        {/* Error */}

        {error && (
          <div className="rounded-lg border border-red-900/50 bg-red-950/30 px-3 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Submit */}

        <button
          type="submit"
          disabled={loading}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}

          {loading ? "Creating Ticket..." : "Create Ticket"}
        </button>
      </div>
    </form>
  );
}
