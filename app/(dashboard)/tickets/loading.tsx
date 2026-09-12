export default function TicketsLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-8 w-32 animate-pulse rounded-md bg-zinc-900" />
        <div className="h-4 w-64 animate-pulse rounded-md bg-zinc-900" />
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">
        <div className="space-y-4">
          <div className="h-10 w-full animate-pulse rounded-lg bg-zinc-900" />
          <div className="h-10 w-full animate-pulse rounded-lg bg-zinc-900" />
          <div className="h-10 w-full animate-pulse rounded-lg bg-zinc-900" />
          <div className="h-10 w-full animate-pulse rounded-lg bg-zinc-900" />
        </div>
      </div>
    </div>
  );
}
