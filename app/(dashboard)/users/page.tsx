import { requireAdmin } from "@/lib/auth-helpers";
import { Users } from "lucide-react";

export default async function UsersPage() {
  await requireAdmin();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Users</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Manage administrators and category staff.
        </p>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-10 text-center">
        <Users className="mx-auto h-10 w-10 text-zinc-700" />
        <h2 className="mt-4 font-medium text-white">User Management</h2>
        <p className="mt-1 text-sm text-zinc-500">
          User management will be connected to Prisma.
        </p>
      </div>
    </div>
  );
}
