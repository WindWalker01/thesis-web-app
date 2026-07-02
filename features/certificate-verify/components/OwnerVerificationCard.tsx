import Image from "next/image";
import { ExternalLink } from "lucide-react";

import { formatDate, truncateHash } from "@/lib/client-utils";
import type { OwnerCertificateVerification } from "../types";

function DetailRow({
  label,
  value,
  link,
  mono,
}: {
  label: string;
  value: string;
  link?: string | null;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-3 last:border-b-0 dark:border-slate-800">
      <span className="text-sm font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
        {label}
      </span>
      {link ? (
        <a
          href={link}
          target="_blank"
          rel="noreferrer"
          className={`inline-flex items-center gap-1.5 text-right text-base font-medium text-blue-600 hover:underline dark:text-blue-400 ${
            mono ? "font-mono text-sm" : ""
          }`}
        >
          {value}
          <ExternalLink className="h-3.5 w-3.5 shrink-0" />
        </a>
      ) : (
        <span
          className={`text-right text-base font-semibold text-slate-900 dark:text-white ${
            mono ? "font-mono text-sm" : ""
          }`}
        >
          {value}
        </span>
      )}
    </div>
  );
}

/** Full certificate details — rendered only when the signed-in user is the owner. */
export function OwnerVerificationCard({
  data,
}: {
  data: OwnerCertificateVerification;
}) {
  return (
    <div className="space-y-4">
      <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-sm font-semibold text-blue-600 dark:text-blue-400">
        Owner view
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {data.artworkImage ? (
          <div className="mt-5">
            <span className="mb-2 block text-sm font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
              Artwork Image
            </span>
            <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
              <Image
                src={data.artworkImage}
                alt={data.artworkTitle}
                fill
                sizes="(max-width: 768px) 100vw, 32rem"
                className="object-cover"
              />
            </div>
          </div>
        ) : null}

        <DetailRow label="Artwork" value={data.artworkTitle} />
        <DetailRow label="Artist" value={data.artistName} />
        <DetailRow
          label="Registration Date"
          value={formatDate(data.registrationDate)}
        />
        <DetailRow label="Ownership" value={data.ownershipStatus} />
        <DetailRow label="Blockchain" value={data.blockchain} />
        {data.transactionHash ? (
          <DetailRow
            label="Transaction"
            value={truncateHash(data.transactionHash)}
            link={data.polygonScanUrl}
            mono
          />
        ) : null}

        {data.polygonScanUrl ? (
          <a
            href={data.polygonScanUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-2.5 text-base font-semibold text-blue-600 transition-colors hover:bg-blue-500/15 dark:text-blue-400"
          >
            View on PolygonScan
            <ExternalLink className="h-4 w-4" />
          </a>
        ) : null}
      </div>
    </div>
  );
}
