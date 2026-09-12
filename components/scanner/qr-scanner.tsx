"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  Loader2,
  RotateCcw,
  ScanLine,
  XCircle,
} from "lucide-react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";

type ScanResult = {
  success: boolean;
  code?: string;
  message: string;
  ticket?: {
    id?: string;
    ticketNumber: string;
    participantName: string;
    paymentStatus: string;
    checkInStatus: string;
    checkedInAt?: string | null;
    category: {
      id: string;
      name: string;
      code: string;
    };
  };
};

type ScannerState =
  | "idle"
  | "starting"
  | "scanning"
  | "processing"
  | "success"
  | "error";

const READER_ID = "event-ticket-qr-reader";

export function QrScanner() {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isStartingRef = useRef(false);
  const isProcessingRef = useRef(false);
  const lastScannedTokenRef = useRef<string | null>(null);

  const [state, setState] = useState<ScannerState>("idle");

  const [result, setResult] = useState<ScanResult | null>(null);

  const [manualToken, setManualToken] = useState("");

  const [cameraError, setCameraError] = useState("");

  const stopScanner = useCallback(async () => {
    const scanner = scannerRef.current;

    if (!scanner) {
      return;
    }

    try {
      if (scanner.isScanning) {
        await scanner.stop();
      }
    } catch (error) {
      console.error("Failed to stop QR scanner:", error);
    }

    try {
      scanner.clear();
    } catch (error) {
      console.error("Failed to clear QR scanner:", error);
    }

    scannerRef.current = null;
  }, []);

  const processToken = useCallback(
    async (qrToken: string) => {
      const token = qrToken.trim();

      if (!token || isProcessingRef.current) {
        return;
      }

      if (lastScannedTokenRef.current === token && state === "success") {
        return;
      }

      isProcessingRef.current = true;

      setState("processing");
      setCameraError("");
      setResult(null);

      try {
        const response = await fetch("/api/scanner/check-in", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            qrToken: token,
          }),
        });

        const data: ScanResult = await response.json();

        setResult(data);

        if (data.success) {
          lastScannedTokenRef.current = token;
          setState("success");

          await stopScanner();
        } else {
          setState("error");

          // Keep the scanner available after a rejected scan.
          lastScannedTokenRef.current = null;
        }
      } catch (error) {
        console.error("Failed to process QR token:", error);

        setResult({
          success: false,
          code: "NETWORK_ERROR",
          message: "Unable to contact the server. Please try again.",
        });

        setState("error");
      } finally {
        isProcessingRef.current = false;
      }
    },
    [state, stopScanner],
  );

  const startScanner = useCallback(async () => {
    if (isStartingRef.current || scannerRef.current) {
      return;
    }

    isStartingRef.current = true;

    setState("starting");
    setResult(null);
    setCameraError("");
    lastScannedTokenRef.current = null;

    try {
      const scanner = new Html5Qrcode(READER_ID, {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        verbose: false,
      });

      scannerRef.current = scanner;

      await scanner.start(
        {
          facingMode: "environment",
        },
        {
          fps: 10,
          qrbox: {
            width: 250,
            height: 250,
          },
          aspectRatio: 1,
        },
        (decodedText) => {
          void processToken(decodedText);
        },
        () => {
          // Ignore normal frame-by-frame scan failures.
        },
      );

      setState("scanning");
    } catch (error) {
      console.error("Failed to start camera scanner:", error);

      scannerRef.current = null;

      setState("error");

      setCameraError(
        "Unable to access the camera. Please allow camera permission and try again.",
      );
    } finally {
      isStartingRef.current = false;
    }
  }, [processToken]);

  const handleManualSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!manualToken.trim()) {
      return;
    }

    await processToken(manualToken);

    setManualToken("");
  };

  const resetScanner = async () => {
    await stopScanner();

    setResult(null);
    setCameraError("");
    setManualToken("");
    lastScannedTokenRef.current = null;
    isProcessingRef.current = false;

    setState("idle");
  };

  useEffect(() => {
    return () => {
      const scanner = scannerRef.current;

      if (scanner?.isScanning) {
        void scanner.stop();
      }

      try {
        scanner?.clear();
      } catch {
        // Ignore cleanup errors.
      }

      scannerRef.current = null;
    };
  }, []);

  const isBusy = state === "starting" || state === "processing";

  return (
    <div className="mx-auto w-full max-w-xl space-y-5">
      {/* Scanner */}
      <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
        <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
          <div className="flex items-center gap-2">
            <ScanLine className="h-4 w-4 text-red-500" />

            <span className="text-sm font-medium text-white">QR Scanner</span>
          </div>

          {state === "scanning" && (
            <span className="flex items-center gap-2 text-xs text-emerald-400">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              Camera active
            </span>
          )}
        </div>

        <div className="relative aspect-square w-full bg-black">
          <div id={READER_ID} className="h-full w-full" />

          {state === "idle" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900">
                <Camera className="h-7 w-7 text-zinc-500" />
              </div>

              <h2 className="mt-4 text-base font-medium text-white">
                Camera scanner is ready
              </h2>

              <p className="mt-1 max-w-xs text-sm text-zinc-500">
                Start the camera and point it at the participant&apos;s QR code.
              </p>

              <button
                type="button"
                onClick={() => void startScanner()}
                className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-red-600 px-5 text-sm font-medium text-white transition-colors hover:bg-red-700"
              >
                <Camera className="h-4 w-4" />
                Start Camera
              </button>
            </div>
          )}

          {state === "starting" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
              <Loader2 className="h-8 w-8 animate-spin text-red-500" />

              <p className="mt-3 text-sm text-zinc-300">Starting camera...</p>
            </div>
          )}

          {state === "processing" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
              <Loader2 className="h-8 w-8 animate-spin text-red-500" />

              <p className="mt-3 text-sm font-medium text-white">
                Verifying ticket...
              </p>

              <p className="mt-1 text-xs text-zinc-500">Please wait</p>
            </div>
          )}
        </div>

        {state === "scanning" && (
          <div className="border-t border-zinc-800 px-4 py-3 text-center">
            <p className="text-xs text-zinc-500">
              Position the QR code inside the scanning area.
            </p>
          </div>
        )}
      </div>

      {/* Camera error */}
      {cameraError && (
        <div className="flex gap-3 rounded-xl border border-red-900/60 bg-red-950/30 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />

          <div>
            <p className="text-sm font-medium text-red-400">Camera error</p>

            <p className="mt-1 text-sm text-red-300/70">{cameraError}</p>
          </div>
        </div>
      )}

      {/* Result */}
      {result && <ScanResultCard result={result} />}

      {/* Actions */}
      {(state === "success" || state === "error") && (
        <button
          type="button"
          onClick={() => void resetScanner()}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 text-sm font-medium text-zinc-200 transition-colors hover:bg-zinc-800 hover:text-white"
        >
          <RotateCcw className="h-4 w-4" />
          Scan Another Ticket
        </button>
      )}

      {/* Manual fallback */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
        <div className="mb-4">
          <h2 className="text-sm font-medium text-white">
            Manual Verification
          </h2>

          <p className="mt-1 text-xs text-zinc-500">
            Use this if the camera cannot read the QR code.
          </p>
        </div>

        <form
          onSubmit={handleManualSubmit}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <input
            type="text"
            value={manualToken}
            onChange={(event) => setManualToken(event.target.value)}
            placeholder="Enter QR token"
            disabled={isBusy}
            className="h-11 min-w-0 flex-1 rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-red-600 disabled:cursor-not-allowed disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={isBusy || !manualToken.trim()}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-zinc-800 px-5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isBusy && <Loader2 className="h-4 w-4 animate-spin" />}
            Verify
          </button>
        </form>
      </div>
    </div>
  );
}

function ScanResultCard({ result }: { result: ScanResult }) {
  if (result.success && result.ticket) {
    return (
      <div className="overflow-hidden rounded-2xl border border-emerald-900/60 bg-emerald-950/20">
        <div className="flex items-center gap-3 border-b border-emerald-900/60 px-5 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
            <CheckCircle2 className="h-6 w-6 text-emerald-500" />
          </div>

          <div>
            <h2 className="font-semibold text-emerald-400">
              Check-in Successful
            </h2>

            <p className="text-xs text-emerald-400/60">
              Ticket verified and checked in.
            </p>
          </div>
        </div>

        <div className="grid gap-px bg-emerald-900/40 sm:grid-cols-2">
          <ResultField label="Ticket" value={result.ticket.ticketNumber} />

          <ResultField
            label="Participant"
            value={result.ticket.participantName}
          />

          <ResultField
            label="Category"
            value={`${result.ticket.category.name} (${result.ticket.category.code})`}
          />

          <ResultField
            label="Payment"
            value={formatStatus(result.ticket.paymentStatus)}
          />
        </div>
      </div>
    );
  }

  const isAlreadyCheckedIn = result.code === "ALREADY_CHECKED_IN";

  const isUnpaid = result.code === "NOT_PAID";

  return (
    <div
      className={`overflow-hidden rounded-2xl border ${
        isAlreadyCheckedIn
          ? "border-yellow-900/60 bg-yellow-950/20"
          : isUnpaid
            ? "border-orange-900/60 bg-orange-950/20"
            : "border-red-900/60 bg-red-950/20"
      }`}
    >
      <div className="flex items-start gap-3 p-5">
        {isAlreadyCheckedIn ? (
          <AlertCircle className="mt-0.5 h-6 w-6 shrink-0 text-yellow-500" />
        ) : isUnpaid ? (
          <AlertCircle className="mt-0.5 h-6 w-6 shrink-0 text-orange-500" />
        ) : (
          <XCircle className="mt-0.5 h-6 w-6 shrink-0 text-red-500" />
        )}

        <div className="min-w-0">
          <h2
            className={`font-semibold ${
              isAlreadyCheckedIn
                ? "text-yellow-400"
                : isUnpaid
                  ? "text-orange-400"
                  : "text-red-400"
            }`}
          >
            {isAlreadyCheckedIn
              ? "Already Checked In"
              : isUnpaid
                ? "Payment Required"
                : "Check-in Failed"}
          </h2>

          <p className="mt-1 text-sm text-zinc-400">{result.message}</p>
        </div>
      </div>

      {result.ticket && (
        <div className="grid gap-px bg-zinc-800/60 sm:grid-cols-2">
          <ResultField label="Ticket" value={result.ticket.ticketNumber} />

          <ResultField
            label="Participant"
            value={result.ticket.participantName}
          />

          <ResultField
            label="Category"
            value={`${result.ticket.category.name} (${result.ticket.category.code})`}
          />

          <ResultField
            label="Payment"
            value={formatStatus(result.ticket.paymentStatus)}
          />

          {result.ticket.checkedInAt && (
            <ResultField
              label="Checked In At"
              value={new Date(result.ticket.checkedInAt).toLocaleString()}
            />
          )}
        </div>
      )}
    </div>
  );
}

function ResultField({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-zinc-950/80 px-4 py-3">
      <p className="text-[11px] uppercase tracking-wide text-zinc-600">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-medium text-white">{value}</p>
    </div>
  );
}

function formatStatus(status: string) {
  return status
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}
