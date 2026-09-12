import { requireCategoryStaff } from "@/lib/auth-helpers";
import { QrScanner } from "@/components/scanner/qr-scanner";

export default async function ScannerPage() {
  await requireCategoryStaff();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Scanner</h1>

        <p className="mt-1 text-sm text-zinc-500">
          Scan participant QR codes at the event entrance.
        </p>
      </div>

      <QrScanner />
    </div>
  );
}
