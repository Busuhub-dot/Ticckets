type TicketDetailsPageProps = {
  params: Promise<{
    ticketId: string;
  }>;
};

export default async function TicketDetailsPage({
  params,
}: TicketDetailsPageProps) {
  const { ticketId } = await params;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Ticket Details</h1>
        <p className="mt-1 text-sm text-zinc-500">Ticket ID: {ticketId}</p>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-8">
        <p className="text-sm text-zinc-500">
          Ticket details will be loaded from the database.
        </p>
      </div>
    </div>
  );
}
