"use client";
import Image from "next/image";
import {
    Boxes,
    CheckCircle2,
    ExternalLink,
    Globe,
    Hash,
    ImageIcon,
    Link2,
    ScanSearch,
    Shield,
} from "lucide-react";

import type {
    IssueSimilarityScan,
    SimilarityHashValue,
    SimilarityMatch,
    SimilarityReport,
} from "../types";
import { SectionHeader } from "../subfeatures/artwork-detail/components/SectionHeader";
import { InfoRow } from "../subfeatures/issue-detail/components/InfoRow";
import { HashRow } from "../subfeatures/issue-detail/components/HashRow";
import { EmptyState } from "../subfeatures/issue-detail/components/EmptyState";
import { LinkButton } from "../subfeatures/issue-detail/components/LinkButton";
import {
    formatSimilarityPercentage,
    getSimilarityLevel,
    getSimilaritySummary,
} from "../server/similarity-report";
import { TechnicalDetailsToggle } from "../subfeatures/artwork-detail/components/TechnicalDetailsToggle";

function SimilarityBadge({
    label,
    tone = "default",
}: {
    label: string;
    tone?: "default" | "success" | "warning" | "danger";
}) {
    const classes =
        tone === "success"
            ? "border-green-500/20 bg-green-500/10 text-green-600 dark:text-green-400"
            : tone === "warning"
                ? "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                : tone === "danger"
                    ? "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400"
                    : "border-border bg-background/70 text-foreground";

    return (
        <span
            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${classes}`}
        >
            {label}
        </span>
    );
}

function getToneFromSimilarity(
    value: number | null
): "default" | "success" | "warning" | "danger" {
    if (value === null) return "default";
    if (value >= 95) return "danger";
    if (value >= 50) return "warning";
    return "success";
}

function MatchCard({
    title,
    match,
}: {
    title: string;
    match: SimilarityMatch | null;
}) {
    if (!match) {
        return <EmptyState text={`No ${title.toLowerCase()} was saved for this scan.`} />;
    }

    const previewUrl =
        match.type === "database"
            ? match.imageUrl ?? null
            : match.url ?? null;

    return (
        <div className="rounded-2xl border border-border bg-background/60 p-4">
            <div className="mb-4 flex flex-wrap items-center gap-2">
                <SimilarityBadge
                    label={match.type === "internet" ? "Internet" : "Database"}
                    tone={match.type === "internet" ? "warning" : "success"}
                />
                <SimilarityBadge
                    label={getSimilarityLevel(match.similarity)}
                    tone={getToneFromSimilarity(match.similarity)}
                />
            </div>

            {previewUrl && match.type === "database" ? (
                <div className="relative mb-4 aspect-[16/10] overflow-hidden rounded-xl border border-border bg-muted">
                    <Image
                        src={previewUrl}
                        alt={match.title ?? `${title} preview`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1280px) 100vw, 40vw"
                    />
                </div>
            ) : null}

            <div className="grid gap-3 sm:grid-cols-2">
                <InfoRow label="Similarity" value={formatSimilarityPercentage(match.similarity)} />
                <InfoRow label="Source" value={match.source ?? "Unknown source"} />
                <InfoRow label="Match type" value={match.type} />

                {match.type === "internet" ? (
                    <InfoRow label="Matched image URL" value={match.url ?? "No target recorded"} />
                ) : null}
            </div>

            {(match.link || match.url || match.imageUrl) && (
                <div className="mt-4 flex flex-wrap gap-2">
                    {match.type === "internet" && match.link ? (
                        <LinkButton href={match.link} label="Open source page" />
                    ) : null}

                    {match.type === "internet" && match.url ? (
                        <LinkButton href={match.url} label="Open matched image" />
                    ) : null}

                    {match.type === "database" && match.imageUrl ? (
                        <LinkButton href={match.imageUrl} label="Open matched artwork image" />
                    ) : null}
                </div>
            )}
        </div>
    );
}

function HashGrid({
    title,
    values,
}: {
    title: string;
    values: Record<string, SimilarityHashValue> | null | undefined;
}) {
    if (!values || Object.keys(values).length === 0) {
        return <EmptyState text={`No ${title.toLowerCase()} hash values were stored.`} />;
    }

    return (
        <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {title}
            </p>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {Object.entries(values).map(([key, hashValue]) => (
                    <div
                        key={key}
                        className="rounded-2xl border border-border bg-background/60 p-4"
                    >
                        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-foreground">
                            {key.replaceAll("_", " ")}
                        </p>

                        <div className="space-y-3">
                            <HashRow label="dHash" value={hashValue.dhash ?? null} />
                            <HashRow label="pHash" value={hashValue.phash ?? null} />
                            <HashRow label="wHash" value={hashValue.whash ?? null} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

type Props = {
    scan: IssueSimilarityScan | null;
    report: SimilarityReport | null;
    compact?: boolean;
};

export function SimilarityReportSection({
    scan,
    report,
    compact = false,
}: Props) {
    const hashesText =
        report?.hashes !== null && report?.hashes !== undefined
            ? JSON.stringify(report.hashes, null, 2)
            : null;

    const rawScanText =
        report?.rawResponse !== null && report?.rawResponse !== undefined
            ? JSON.stringify(report.rawResponse, null, 2)
            : null;

    return (
        <section className="rounded-3xl border border-border/70 bg-card/85 backdrop-blur-xl overflow-hidden">
            <SectionHeader
                icon={<ScanSearch className="w-4 h-4" />}
                title="Similarity Report"
            />

            <div className="p-4 md:p-5 space-y-5">
                <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4">
                    <div className="flex items-start gap-3">
                        <div className="rounded-xl bg-blue-500/15 p-2 text-blue-500">
                            <Shield className="w-4 h-4" />
                        </div>

                        <div>
                            <p className="text-sm font-bold text-foreground mb-1">
                                Saved plagiarism review summary
                            </p>
                            <p className="text-sm leading-6 text-muted-foreground">
                                {getSimilaritySummary(report)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className={`grid gap-3 ${compact ? "md:grid-cols-2" : "md:grid-cols-2 xl:grid-cols-4"}`}>
                    <InfoRow label="Scan status" value={scan?.status ?? "No stored scan"} />
                    <InfoRow
                        label="Scan success"
                        value={scan ? (scan.success ? "Yes" : "No") : "No stored scan"}
                    />
                    <InfoRow
                        label="Total matches"
                        value={String(scan?.totalMatches ?? 0)}
                    />
                    <InfoRow
                        label="Best match"
                        value={
                            report?.bestMatch
                                ? `${report.bestMatch.type} • ${formatSimilarityPercentage(
                                    report.bestMatch.similarity
                                )}`
                                : "No best match recorded"
                        }
                    />
                </div>

                <div className="grid gap-5 xl:grid-cols-2">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Boxes className="w-4 h-4 text-primary" />
                            <p className="text-sm font-bold text-foreground">Database match</p>
                        </div>
                        <MatchCard title="Database Match" match={report?.dbMatch ?? null} />
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-primary" />
                            <p className="text-sm font-bold text-foreground">Internet match</p>
                        </div>
                        <MatchCard title="Internet Match" match={report?.webMatch ?? null} />
                    </div>
                </div>

                <div className="rounded-2xl border border-border bg-background/60 p-4">
                    <div className="mb-4 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                        <p className="text-sm font-bold text-foreground">Best match snapshot</p>
                    </div>

                    {report?.bestMatch ? (
                        <div className="grid gap-3 sm:grid-cols-2">
                            <InfoRow label="Best type" value={report.bestMatch.type} />
                            <InfoRow
                                label="Best similarity"
                                value={formatSimilarityPercentage(report.bestMatch.similarity)}
                            />
                            <InfoRow
                                label="Best source"
                                value={report.bestMatch.source ?? "Unknown source"}
                            />

                            {report.bestMatch.type === "internet" ? (
                                <InfoRow
                                    label="Matched target"
                                    value={report.bestMatch.url ?? "No target recorded"}
                                />
                            ) : null}
                        </div>
                    ) : (
                        <EmptyState text="No best-match snapshot was saved for this scan." />
                    )}

                    {(report?.bestMatch?.link || report?.bestMatch?.url) && (
                        <div className="mt-4 flex flex-wrap gap-2">
                            {report.bestMatch.type === "internet" && report.bestMatch.link ? (
                                <LinkButton href={report.bestMatch.link} label="Open best source page" />
                            ) : null}

                            {report.bestMatch.type === "database" && report.bestMatch.imageUrl ? (
                                <LinkButton
                                    href={report.bestMatch.imageUrl}
                                    label="Open best matched artwork image"
                                />
                            ) : null}

                            {report.bestMatch.type === "internet" && report.bestMatch.url ? (
                                <LinkButton
                                    href={report.bestMatch.url}
                                    label="Open best matched image"
                                />
                            ) : null}
                        </div>
                    )}
                </div>

                {scan?.errorMessage ? (
                    <div className="rounded-2xl border border-red-500/20 bg-red-500/8 p-4">
                        <p className="text-xs font-semibold uppercase tracking-widest text-red-500 mb-1">
                            Scan error
                        </p>
                        <p className="text-sm text-muted-foreground">{scan.errorMessage}</p>
                    </div>
                ) : null}

                <TechnicalDetailsToggle
                    title="Advanced similarity details"
                    description="View original scan hash values, transform hashes, block hashes, and the full stored API response."
                >
                    <div className="space-y-6">
                        <div className="grid gap-3 md:grid-cols-2">
                            <HashRow label="Original hash" value={report?.originalHash ?? null} />
                            <InfoRow label="Filename" value={report?.filename ?? "No filename recorded"} />
                        </div>

                        <HashGrid title="Transform hashes" values={report?.hashes?.transforms} />
                        <HashGrid title="Block hashes" values={report?.hashes?.blocks} />

                        {hashesText ? (
                            <div className="rounded-2xl border border-border bg-background/60 p-4">
                                <div className="mb-3 flex items-center gap-2">
                                    <Hash className="w-4 h-4 text-primary" />
                                    <p className="text-sm font-bold text-foreground">Stored hashes payload</p>
                                </div>
                                <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-xl bg-background p-3 text-xs text-muted-foreground">
                                    {hashesText}
                                </pre>
                            </div>
                        ) : null}

                        {rawScanText ? (
                            <div className="rounded-2xl border border-border bg-background/60 p-4">
                                <div className="mb-3 flex items-center gap-2">
                                    <ImageIcon className="w-4 h-4 text-primary" />
                                    <p className="text-sm font-bold text-foreground">Full stored API response</p>
                                </div>
                                <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-xl bg-background p-3 text-xs text-muted-foreground">
                                    {rawScanText}
                                </pre>
                            </div>
                        ) : (
                            <EmptyState text="No raw similarity response was stored." />
                        )}
                    </div>
                </TechnicalDetailsToggle>
            </div>
        </section>
    );
}