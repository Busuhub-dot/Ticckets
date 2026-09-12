export default function Loading() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-8 w-48 animate-pulse rounded-md bg-zinc-800" />
        <div className="mt-2 h-4 w-72 animate-pulse rounded-md bg-zinc-900" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-32 animate-pulse rounded-xl border border-zinc-800 bg-zinc-950"
          />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-80 animate-pulse rounded-xl border border-zinc-800 bg-zinc-950" />
        <div className="h-80 animate-pulse rounded-xl border border-zinc-800 bg-zinc-950" />
      </div>
    </div>
  );
}
