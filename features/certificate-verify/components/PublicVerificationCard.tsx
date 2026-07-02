import { ExternalLink } from "lucide-react";

import { formatDate, truncateHash } from "@/lib/client-utils";

type Row = {
  label: string;
  value: string;
  link?: string | null;
  mono?: boolean;
};

function DetailRow({ label, value, link, mono }: Row) {
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

type Props = {
  certificateStatus: string;
  artworkRegistration: string;
  ownershipStatus: string;
  blockchain: string;
  transactionHash: string | null;
  polygonScanUrl: string | null;
  issuedAt: string;
};

/** Limited certificate details shown to anonymous or non-owner visitors. */
export function PublicVerificationCard({
  certificateStatus,
  artworkRegistration,
  ownershipStatus,
  blockchain,
  transactionHash,
  polygonScanUrl,
  issuedAt,
}: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <DetailRow label="Certificate Status" value={certificateStatus} />
      <DetailRow label="Artwork Registration" value={artworkRegistration} />
      <DetailRow label="Ownership Record" value={ownershipStatus} />
      <DetailRow label="Blockchain" value={blockchain} />
      {transactionHash ? (
        <DetailRow
          label="Transaction"
          value={truncateHash(transactionHash)}
          link={polygonScanUrl}
          mono
        />
      ) : null}
      <DetailRow label="Issued" value={formatDate(issuedAt)} />

      {polygonScanUrl ? (
        <a
          href={polygonScanUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-2.5 text-base font-semibold text-blue-600 transition-colors hover:bg-blue-500/15 dark:text-blue-400"
        >
          View on PolygonScan
          <ExternalLink className="h-4 w-4" />
        </a>
      ) : null}
    </div>
  );
}
