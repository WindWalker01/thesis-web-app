import Link from "next/link";
import { FileX2 } from "lucide-react";

/** Shown when the artwork UUID is unknown or malformed. */
export function CertificateNotFoundState() {
  return (
    <div className="mt-50 flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
        <FileX2 className="h-9 w-9 text-red-600 dark:text-red-400" />
      </div>
      <h1 className="text-2xl font-black text-slate-900 dark:text-white">
        Certificate Not Found
      </h1>
      <p className="max-w-md text-base text-slate-500 dark:text-slate-400">
        We could not find a certificate for this identifier. The QR code may be
        invalid, or the artwork may not exist in the ArtForgeLab system.
      </p>
      <Link
        href="/"
        className="mt-2 inline-flex items-center gap-2 text-base font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400"
      >
        ← Back to Home
      </Link>
    </div>
  );
}
