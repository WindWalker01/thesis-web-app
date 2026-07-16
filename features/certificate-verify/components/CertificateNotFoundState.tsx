import Link from "next/link";
import { ArrowLeft, FileX2 } from "lucide-react";

/** Shown when the artwork UUID is unknown or malformed. */
export function CertificateNotFoundState() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:rounded-3xl sm:p-8 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 ring-8 ring-red-500/10 sm:h-16 sm:w-16">
        <FileX2 className="h-8 w-8 text-red-600 sm:h-9 sm:w-9 dark:text-red-400" />
      </div>
      <h1 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl dark:text-white">
        Certificate Not Found
      </h1>
      <p className="max-w-md text-sm text-slate-500 sm:text-base dark:text-slate-400">
        We could not find a certificate for this identifier. The QR code may be
        invalid, or the artwork may not exist in the ArtForgeLab system.
      </p>
      <Link
        href="/"
        className="mt-2 inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>
    </div>
  );
}
