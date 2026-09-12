import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Settings</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Configure the event ticket system.
        </p>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-8">
        <div className="flex items-center gap-3">
          <Settings className="h-5 w-5 text-zinc-500" />
          <h2 className="font-medium text-white">System Settings</h2>
        </div>
      </div>
    </div>
  );
}
