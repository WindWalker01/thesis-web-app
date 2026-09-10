"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/client-utils";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Globe,
  MinusCircle,
  RotateCcw,
  SearchX,
} from "lucide-react";
import type { SearchResponse, WebDiagnosticsStatus } from "../types";

type ResolvedStatus = WebDiagnosticsStatus | "legacy";

function resolveStatus(result: SearchResponse): ResolvedStatus {
  return result.web_diagnostics?.status ?? "legacy";
}

const CHIP: Record<
  ResolvedStatus,
  { label: string; className: string; icon: typeof Globe }
> = {
  ok: {
    label: "Verified",
    className: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    icon: CheckCircle2,
  },
  no_matches: {
    label: "No similar images",
    className: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    icon: CheckCircle2,
  },
  no_candidates: {
    label: "No candidates",
    className: "text-sky-400 border-sky-500/30 bg-sky-500/10",
    icon: SearchX,
  },
  degraded: {
    label: "Check incomplete",
    className: "text-amber-400 border-amber-500/30 bg-amber-500/10",
    icon: AlertTriangle,
  },
  not_attempted: {
    label: "Check incomplete",
    className: "text-amber-400 border-amber-500/30 bg-amber-500/10",
    icon: AlertTriangle,
  },
  legacy: {
    label: "Online check",
    className: "text-muted-foreground border-border bg-muted/50",
    icon: Globe,
  },
};

/** Small "Online check" status chip rendered near the web section header. */
export function OnlineCheckChip({ result }: { result: SearchResponse }) {
  const status = resolveStatus(result);
  const cfg = CHIP[status];
  const Icon = cfg.icon;
  return (
    <Badge
      variant="outline"
      data-testid="online-check-chip"
      data-status={status}
      className={cn("text-[10px]", cfg.className)}
    >
      <Icon size={9} className="mr-1" />
      {cfg.label}
    </Badge>
  );
}

function FailureReasons({
  reasons,
  attempted,
}: {
  reasons: Record<string, number>;
  attempted?: number;
}) {
  const [open, setOpen] = useState(false);
  const entries = Object.entries(reasons);
  if (entries.length === 0) return null;
  const failed = entries.reduce((sum, [, n]) => sum + n, 0);
  const scope =
    attempted !== undefined
      ? `${failed} of ${attempted} online images couldn't be checked`
      : `${failed} online image${failed === 1 ? "" : "s"} couldn't be checked`;
  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        data-testid="failure-reasons-toggle"
        className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs transition-colors"
      >
        {open ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
        <MinusCircle size={12} className="shrink-0" />
        <span>{scope} (expand for reasons)</span>
      </button>
      {open && (
        <ul
          data-testid="failure-reasons-list"
          className="mt-1.5 space-y-1 rounded-lg border border-border bg-muted/40 p-2.5"
        >
          {entries.map(([cause, count]) => (
            <li
              key={cause}
              className="flex items-baseline justify-between gap-3 font-mono text-[11px]"
            >
              <span className="text-muted-foreground break-all">{cause}</span>
              <span className="text-foreground shrink-0 font-semibold">
                × {count}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function TechnicalDetails({ result }: { result: SearchResponse }) {
  const [open, setOpen] = useState(false);
  const d = result.web_diagnostics;
  if (!d) return null;
  const rows: Array<[string, string]> = [];
  if (d.cloudinary_ready !== undefined)
    rows.push(["cloudinary_ready", String(d.cloudinary_ready)]);
  if (d.readiness_attempts !== undefined)
    rows.push(["readiness_attempts", String(d.readiness_attempts)]);
  if (d.readiness_status !== undefined && d.readiness_status !== null)
    rows.push(["readiness_status", String(d.readiness_status)]);
  if (d.readiness_ms !== undefined)
    rows.push(["readiness_ms", `${d.readiness_ms}ms`]);
  if (d.list_key !== undefined) rows.push(["list_key", d.list_key]);
  if (d.serp_returned !== undefined)
    rows.push(["serp_returned", String(d.serp_returned)]);
  if (d.attempted !== undefined) rows.push(["attempted", String(d.attempted)]);
  if (d.hashed_ok !== undefined) rows.push(["hashed_ok", String(d.hashed_ok)]);
  if (d.hashed_failed !== undefined)
    rows.push(["hashed_failed", String(d.hashed_failed)]);
  if (d.error) rows.push(["error", d.error]);
  if (rows.length === 0) return null;
  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        data-testid="technical-details-toggle"
        className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs transition-colors"
      >
        {open ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
        Technical details
      </button>
      {open && (
        <dl
          data-testid="technical-details"
          className="mt-1.5 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 rounded-lg border border-border bg-muted/40 p-2.5 font-mono text-[11px]"
        >
          {rows.map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="text-muted-foreground">{k}</dt>
              <dd className="text-foreground break-all">{v}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

/**
 * Status-driven online (web) branch messaging.
 * Replaces the old ambiguous `web === null` branch.
 * Never blocks the db section.
 */
export function WebOnlineStatus({
  result,
  onRetry,
}: {
  result: SearchResponse;
  onRetry?: () => void;
}) {
  const status = result.web_diagnostics?.status ?? "legacy";
  const d = result.web_diagnostics;
  const warning = result.web_warning ?? null;
  const hashedFailed = d?.hashed_failed ?? 0;
  const attempted = d?.attempted;
  const hashedOk = d?.hashed_ok;
  const failureReasons = d?.failure_reasons;

  if (status === "ok") return null;
  if (status === "legacy") return null;

  if (status === "no_matches") {
    return (
      <div
        data-testid="web-status-no-matches"
        className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 px-5 py-3.5"
      >
        <p className="text-sm text-emerald-400">
          Checked {hashedOk ?? attempted ?? 0} online images, none similar.
          {warning ? ` ${warning}` : ""}
        </p>
        {hashedFailed > 0 && failureReasons && (
          <FailureReasons reasons={failureReasons} attempted={attempted} />
        )}
      </div>
    );
  }

  if (status === "no_candidates") {
    return (
      <div
        data-testid="web-status-no-candidates"
        className="rounded-2xl border border-border bg-card px-5 py-3.5"
      >
        <p className="text-sm text-muted-foreground">
          Reverse image search returned no online candidates
          {d?.list_key ? ` (list_key=${d.list_key})` : ""}. Database result
          stands — no footprint found, not proof of originality.
          {warning ? ` ${warning}` : ""}
        </p>
      </div>
    );
  }

  const cloudinaryNotReady = d?.cloudinary_ready === false;
  return (
    <div
      data-testid="web-status-degraded"
      className="rounded-2xl border border-amber-500/30 bg-amber-500/5 px-5 py-4"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-2.5">
          <AlertTriangle size={15} className="mt-0.5 shrink-0 text-amber-400" />
          <div>
            <p className="text-sm font-semibold text-amber-400">
              Online check incomplete — database result below is still valid.
            </p>
            {warning && (
              <p className="mt-1 text-sm text-amber-500/90">{warning}</p>
            )}
            {cloudinaryNotReady && (
              <p className="mt-1 text-sm text-amber-500/90">
                Online check skipped — temporary image wasn&apos;t fetchable yet
                {d?.readiness_status !== undefined &&
                d?.readiness_status !== null
                  ? ` (status=${d.readiness_status}`
                  : " ("}
                {d?.readiness_attempts !== undefined
                  ? `, attempts=${d.readiness_attempts})`
                  : ")"}
                {d?.error === "cloudinary_url_not_ready"
                  ? " Please retry in a few seconds."
                  : ""}
              </p>
            )}
            {hashedFailed > 0 && failureReasons && (
              <div className="text-amber-500/90">
                <FailureReasons
                  reasons={failureReasons}
                  attempted={attempted}
                />
              </div>
            )}
            <div className="text-amber-500/90">
              <TechnicalDetails result={result} />
            </div>
          </div>
        </div>
        {onRetry && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRetry}
            data-testid="web-retry-button"
            className="gap-1.5 shrink-0 border-amber-500/30 text-amber-400 hover:bg-amber-500/10 hover:text-amber-300"
          >
            <RotateCcw size={12} /> Retry online check
          </Button>
        )}
      </div>
    </div>
  );
}
