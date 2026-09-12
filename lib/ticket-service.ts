import crypto from "crypto";

import { prisma } from "@/lib/prisma";

export async function createTicket({
  participantName,
  categoryId,
  createdById,
  paymentStatus,
}: {
  participantName: string;
  categoryId: string;
  createdById: string;
  paymentStatus: "UNPAID" | "PAID";
}) {
  return prisma.$transaction(async (tx) => {
    // ----------------------------------------------------------
    // Get category
    // ----------------------------------------------------------

    const category = await tx.category.findUnique({
      where: {
        id: categoryId,
      },
      select: {
        id: true,
        code: true,
        name: true,
      },
    });

    if (!category) {
      throw new Error("CATEGORY_NOT_FOUND");
    }

    // ----------------------------------------------------------
    // Atomically allocate the next ticket number
    // ----------------------------------------------------------

    const sequence = await tx.ticketSequence.update({
      where: {
        categoryId: category.id,
      },
      data: {
        nextNumber: {
          increment: 1,
        },
      },
      select: {
        nextNumber: true,
      },
    });

    const ticketNumber = sequence.nextNumber - 1;

    const formattedTicketNumber = `${category.code}${ticketNumber
      .toString()
      .padStart(3, "0")}`;

    // ----------------------------------------------------------
    // Generate secure QR token
    // ----------------------------------------------------------

    const qrToken = crypto.randomBytes(32).toString("base64url");

    // ----------------------------------------------------------
    // Create ticket
    // ----------------------------------------------------------

    const ticket = await tx.ticket.create({
      data: {
        ticketNumber: formattedTicketNumber,
        participantName: participantName.trim(),
        qrToken,
        paymentStatus,
        categoryId: category.id,

        createdById,
      },
      include: {
        category: true,
      },
    });

    // ----------------------------------------------------------
    // Audit log
    // ----------------------------------------------------------

    await tx.auditLog.create({
      data: {
        action: "TICKET_CREATED",

        ticketId: ticket.id,

        userId: createdById,

        metadata: {
          ticketNumber: ticket.ticketNumber,
          participantName: ticket.participantName,
          category: category.code,
          paymentStatus: ticket.paymentStatus,
        },
      },
    });

    return ticket;
  });
}
