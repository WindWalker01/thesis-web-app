import Image from "next/image";
import type { ReactNode } from "react";
import {
  BadgeCheck,
  ExternalLink,
  ImageOff,
  ShieldAlert,
  ShieldCheck,
  User,
} from "lucide-react";

import { cn, formatDate, truncateHash } from "@/lib/client-utils";
import type {
  CertificateVerification,
  CertificateVerificationStatus,
} from "../types";
import { CopyField } from "./CopyField";

const STATUS_STYLES: Record<
  CertificateVerificationStatus,
  { pill: string; dot: string }
> = {
  Valid: {
    pill: "bg-green-500/15 text-green-700 ring-green-600/20 dark:text-green-300",
    dot: "bg-green-500",
  },
  Pending: {
    pill: "bg-amber-500/15 text-amber-700 ring-amber-600/20 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  Revoked: {
    pill: "bg-red-500/15 text-red-700 ring-red-600/20 dark:text-red-300",
    dot: "bg-red-500",
  },
};

function StatusPill({
  status,
  className,
}: {
  status: CertificateVerificationStatus;
  className?: string;
}) {
  const style = STATUS_STYLES[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold tracking-wide uppercase ring-1 backdrop-blur-sm",
        style.pill,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", style.dot)} />
      {status}
    </span>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-6 first:mt-0">
      <h3 className="mb-1.5 text-[11px] font-bold tracking-widest text-slate-400 uppercase dark:text-slate-500">
        {title}
      </h3>
      <dl>{children}</dl>
    </section>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-slate-100 py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4 dark:border-slate-800/80">
      <dt className="text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
        {label}
      </dt>
      <dd className="min-w-0 text-sm font-semibold text-slate-900 sm:text-right dark:text-white">
        {children}
      </dd>
    </div>
  );
}

/**
 * Unified certificate detail card. Everyone sees the claim-binding fields
 * (artwork, perceptual fingerprint, on-chain anchor); the owner additionally
 * sees private identity details — a strict superset of the public view.
 */
export function VerificationCard({ data }: { data: CertificateVerification }) {
  const {
    certificateStatus,
    artworkTitle,
    artworkImage,
    perceptualHash,
    workId,
    onChainVerified,
    revoked,
    blockchain,
    transactionHash,
    polygonScanUrl,
    issuedAt,
  } = data;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:rounded-3xl dark:border-slate-800 dark:bg-slate-900">
      {/* Artwork hero */}
      <div className="relative aspect-square w-full bg-slate-100 sm:aspect-16/10 dark:bg-slate-800">
        {artworkImage ? (
          <Image
            src={artworkImage}
            alt={artworkTitle || "Registered artwork"}
            fill
            sizes="(max-width: 640px) 100vw, 40rem"
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-400 dark:text-slate-600">
            <ImageOff className="h-10 w-10" />
          </div>
        )}

        {data.isOwner ? (
          <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-blue-600/90 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
            <User className="h-3.5 w-3.5" />
            Owner view
          </span>
        ) : null}

        <StatusPill
          status={certificateStatus}
          className="absolute top-3 right-3"
        />
      </div>

      <div className="p-5 sm:p-6">
        {/* Title + artist */}
        <h2 className="text-xl leading-tight font-black text-slate-900 sm:text-2xl dark:text-white">
          {artworkTitle || "Registered Artwork"}
        </h2>
        {data.isOwner ? (
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            by{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {data.artistName}
            </span>{" "}
            · {data.artistUsername}
          </p>
        ) : null}

        {/* Trust chips */}
        <div className="mt-4 flex flex-wrap gap-2">
          {onChainVerified ? (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-green-500/10 px-2.5 py-1.5 text-xs font-semibold text-green-700 dark:text-green-300">
              <ShieldCheck className="h-4 w-4" />
              Fingerprint verified on-chain
            </span>
          ) : null}
          {revoked ? (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-red-500/10 px-2.5 py-1.5 text-xs font-semibold text-red-700 dark:text-red-300">
              <ShieldAlert className="h-4 w-4" />
              Revoked on-chain
            </span>
          ) : null}
          {!revoked && data.valid ? (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-500/10 px-2.5 py-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300">
              <BadgeCheck className="h-4 w-4" />
              Anchored on Polygon
            </span>
          ) : null}
        </div>

        {/* Verification status */}
        <Section title="Verification">
          <Row label="Certificate Status">{certificateStatus}</Row>
          <Row label="Artwork Registration">{data.artworkRegistration}</Row>
          <Row label="Ownership Record">{data.ownershipStatus}</Row>
          <Row label="Issued">{formatDate(issuedAt)}</Row>
        </Section>

        {/* Fingerprint & chain */}
        <Section title="Fingerprint & Blockchain">
          {perceptualHash ? (
            <Row label="Perceptual Fingerprint">
              <CopyField
                value={perceptualHash}
                display={truncateHash(perceptualHash, 10, 8)}
                className="sm:justify-end"
              />
            </Row>
          ) : null}
          <Row label="Blockchain">Polygon {blockchain}</Row>
          {workId ? (
            <Row label="On-chain Work ID">
              <CopyField
                value={workId}
                display={`#${workId}`}
                className="sm:justify-end"
              />
            </Row>
          ) : null}
          {transactionHash ? (
            <Row label="Transaction">
              <span className="inline-flex items-center gap-2 sm:justify-end">
                <CopyField
                  value={transactionHash}
                  display={truncateHash(transactionHash)}
                />
                {polygonScanUrl ? (
                  <a
                    href={polygonScanUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="View transaction on PolygonScan"
                    className="text-blue-600 hover:text-blue-500 dark:text-blue-400"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                ) : null}
              </span>
            </Row>
          ) : null}
        </Section>

        {/* Anti-clone guidance */}
        {artworkImage && perceptualHash ? (
          <p className="mt-6 rounded-xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
            The perceptual fingerprint is anchored on-chain and identifies this
            exact artwork. If the work shown above doesn&apos;t match the
            document you scanned, treat the certificate as{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              not genuine
            </span>
            .
          </p>
        ) : null}

        {/* PolygonScan CTA */}
        {polygonScanUrl ? (
          <a
            href={polygonScanUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-500 sm:text-base"
          >
            View on PolygonScan
            <ExternalLink className="h-4 w-4" />
          </a>
        ) : null}
      </div>
    </div>
  );
}
