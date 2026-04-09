"use client";

import Image from "next/image";
import Link from "next/link";
import {
    AlertTriangle,
    ArrowLeft,
    Calendar,
    FileWarning,
    Fingerprint,
    Hash,
    Link2,
    ScanSearch,
    ScrollText,
    ShieldAlert,
    ShieldX,
    UserRound,
    XCircle,
    Ban,
    Boxes,
} from "lucide-react";


import { useIssueDetailPage } from "../hooks/useIssueDetailPage";
import type { ArtworkStatus } from "../../../types";
import { formatUploadDate } from "../../..";
import { SectionHeader } from "../../artwork-detail/components/SectionHeader";
import { EmptyState } from "./EmptyState";
import { LinkButton } from "./LinkButton";
import { HashRow } from "./HashRow";
import { InfoRow } from "./InfoRow";
import IssueDetailPageSkeleton from "./PageSkeleton";
import { TechnicalDetailsToggle } from "../../artwork-detail/components/TechnicalDetailsToggle";
import { ArtworkStatusBadge } from "@/features/(user)/profile/components/ArtworkStatusBadge";
import {
    getIssueExplanation,
    buildChainTxUrl,
    formatPercentage,
    formatIssueMetric
} from "../utils";
import { MetricCard } from "./MetricCard";

type Props = {
    id: string;
};

export default function IssueDetailPage({ id }: Props) {
    const { issue, isLoading, error, refetch } = useIssueDetailPage(id);

    if (isLoading) {
        return <IssueDetailPageSkeleton />;
    }

    if (error || !issue) {
        return (
            <main className="min-h-screen bg-background text-foreground mt-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                    <Link
                        href="/profile/issues"
                        className="group inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors mb-10"
                    >
                        <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
                        Back to issues
                    </Link>

                    <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-xl p-8">
                        <p className="text-sm font-semibold text-foreground mb-2">
                            Failed to load issue detail.
                        </p>
                        <p className="text-sm text-muted-foreground mb-4">
                            {error ?? "Issue record not found."}
                        </p>

                        <button
                            type="button"
                            onClick={() => refetch()}
                            className="inline-flex items-center rounded-xl border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/15 transition-colors"
                        >
                            Try again
                        </button>
                    </div>
                </div>
            </main>
        );
    }

    const similarity = issue.similarityScan;
    const reports = issue.reports;
    const latestReport = reports[0] ?? null;

    const evidenceText =
        issue.evidence !== null && issue.evidence !== undefined
            ? JSON.stringify(issue.evidence, null, 2)
            : null;

    const plagiarismText =
        issue.plagiarismHashes !== null && issue.plagiarismHashes !== undefined
            ? JSON.stringify(issue.plagiarismHashes, null, 2)
            : null;

    const similarityHashesText =
        similarity?.hashes !== null && similarity?.hashes !== undefined
            ? JSON.stringify(similarity.hashes, null, 2)
            : null;

    const rawScanText =
        similarity?.rawResponse !== null && similarity?.rawResponse !== undefined
            ? JSON.stringify(similarity.rawResponse, null, 2)
            : null;

    const explanation = getIssueExplanation({
        status: issue.status,
        similarityPercentage: similarity?.bestSimilarityPercentage ?? null,
        totalMatches: similarity?.totalMatches ?? 0,
        latestReport,
        hasTxHash: !!issue.txHash,
    });

    const hasChainLink = !!issue.txHash && !!issue.chain;
    const txUrl = hasChainLink ? buildChainTxUrl(issue.chain!, issue.txHash!) : null;

    return (
        <main className="relative min-h-screen overflow-hidden bg-background text-foreground mt-12">
            <div className="pointer-events-none absolute inset-0 z-0 opacity-[0.03] bg-[radial-gradient(circle_at_top,_var(--color-primary)_0%,_transparent_45%),linear-gradient(to_right,_currentColor_1px,_transparent_1px),linear-gradient(to_bottom,_currentColor_1px,_transparent_1px)] [background-size:auto,36px_36px,36px_36px]" />

            <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                <Link
                    href="/profile/issues"
                    className="group inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors mb-8"
                >
                    <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
                    Back to issues
                </Link>

                <div className="grid gap-6 lg:grid-cols-[1.12fr_0.88fr]">
                    <section className="rounded-3xl border border-border/70 bg-card/85 backdrop-blur-xl overflow-hidden">
                        <div className="relative aspect-[4/3] w-full bg-muted">
                            {issue.img ? (
                                <Image
                                    src={issue.img}
                                    alt={issue.title}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 1024px) 100vw, 56vw"
                                    priority
                                />
                            ) : (
                                <div className="flex h-full items-center justify-center">
                                    <FileWarning className="w-12 h-12 text-muted-foreground/50" />
                                </div>
                            )}
                        </div>

                        <div className="p-5 md:p-6">
                            <div className="mb-4 flex flex-wrap items-center gap-2">
                                <ArtworkStatusBadge status={issue.status} />
                                <span className="inline-flex items-center rounded-full border border-border bg-background/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                                    {issue.category}
                                </span>
                                <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                                    <Calendar className="w-3 h-3" />
                                    {issue.uploadDate}
                                </span>
                            </div>

                            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground mb-2">
                                {issue.title}
                            </h1>

                            <p className="text-sm leading-6 text-muted-foreground mb-5">
                                {issue.description?.trim() || "No artwork description provided."}
                            </p>

                            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/8 p-4 md:p-5">
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5 rounded-xl bg-amber-500/15 p-2 text-amber-500">
                                        <AlertTriangle className="w-4 h-4" />
                                    </div>

                                    <div>
                                        <p className="text-sm font-bold text-foreground mb-1">
                                            Why this artwork appears in Review & Issues
                                        </p>
                                        <p className="text-sm leading-6 text-muted-foreground">
                                            {explanation}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {issue.creator && (
                                <div className="mt-5 rounded-2xl border border-border bg-background/60 p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-xl border border-border bg-card p-2">
                                            <UserRound className="w-4 h-4 text-muted-foreground" />
                                        </div>

                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                                                Creator
                                            </p>
                                            <p className="text-sm font-semibold text-foreground">
                                                {issue.creator.fullName}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {issue.creator.username}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    <div className="space-y-6">
                        <section className="rounded-3xl border border-border/70 bg-card/85 backdrop-blur-xl overflow-hidden">
                            <SectionHeader
                                icon={<ShieldAlert className="w-4 h-4" />}
                                title="Issue Summary"
                            />
                            <div className="grid grid-cols-2 gap-3 p-4 md:p-5">
                                <MetricCard
                                    label="Issue Status"
                                    value={formatIssueMetric(issue.status)}
                                    icon={getStatusIcon(issue.status)}
                                />
                                <MetricCard
                                    label="Similarity"
                                    value={formatPercentage(similarity?.bestSimilarityPercentage ?? null)}
                                    icon={<ScanSearch className="w-4 h-4" />}
                                />
                                <MetricCard
                                    label="Matches Found"
                                    value={String(similarity?.totalMatches ?? 0)}
                                    icon={<Boxes className="w-4 h-4" />}
                                />
                                <MetricCard
                                    label="Reports"
                                    value={String(reports.length)}
                                    icon={<ScrollText className="w-4 h-4" />}
                                />
                            </div>
                        </section>

                        <section className="rounded-3xl border border-border/70 bg-card/85 backdrop-blur-xl overflow-hidden">
                            <SectionHeader
                                icon={<ScanSearch className="w-4 h-4" />}
                                title="Similarity Scan"
                            />
                            <div className="p-4 md:p-5 space-y-3">
                                <InfoRow label="Scan status" value={similarity?.status ?? "No stored scan"} />
                                <InfoRow
                                    label="Scan success"
                                    value={
                                        similarity ? (similarity.success ? "Yes" : "No") : "No stored scan"
                                    }
                                />
                                <InfoRow
                                    label="Best source"
                                    value={similarity?.bestSource ?? "No source recorded"}
                                />
                                <InfoRow
                                    label="Best matched pair"
                                    value={similarity?.bestMatchPair ?? "No pair recorded"}
                                />
                                <InfoRow
                                    label="Original hash"
                                    value={similarity?.originalHash ?? "No original hash"}
                                />

                                <div className="flex gap-2">
                                    {similarity?.bestLink && (
                                        <LinkButton href={similarity.bestLink} label="Open best match link" />
                                    )}

                                    {similarity?.bestUrl && (
                                        <LinkButton href={similarity.bestUrl} label="Open best match URL" />
                                    )}
                                </div>


                                {similarity?.errorMessage && (
                                    <div className="rounded-xl border border-red-500/20 bg-red-500/8 p-3">
                                        <p className="text-xs font-semibold uppercase tracking-widest text-red-500 mb-1">
                                            Scan error
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {similarity.errorMessage}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                </div>

                <div className="grid gap-6 mt-6 lg:grid-cols-2">
                    <section className="rounded-3xl border border-border/70 bg-card/85 backdrop-blur-xl overflow-hidden">
                        <SectionHeader
                            icon={<ScrollText className="w-4 h-4" />}
                            title="Report History"
                        />
                        <div className="p-4 md:p-5">
                            {reports.length > 0 ? (
                                <div className="space-y-3">
                                    {reports.map((report) => (
                                        <div
                                            key={report.id}
                                            className="rounded-2xl border border-border bg-background/60 p-4"
                                        >
                                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                                <span className="inline-flex rounded-full border border-border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-foreground">
                                                    {report.reportType.replaceAll("_", " ")}
                                                </span>
                                                <span className="inline-flex rounded-full border border-border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                                                    {report.status}
                                                </span>
                                            </div>

                                            <p className="text-sm font-semibold text-foreground mb-1">
                                                {report.title}
                                            </p>
                                            <p className="text-sm leading-6 text-muted-foreground">
                                                {report.description}
                                            </p>

                                            <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
                                                <span>Created: {formatUploadDate(report.createdAt)}</span>
                                                {report.resolvedAt && (
                                                    <span>Resolved: {formatUploadDate(report.resolvedAt)}</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState text="No related reports were found for this artwork." />
                            )}
                        </div>
                    </section>

                    <section className="rounded-3xl border border-border/70 bg-card/85 backdrop-blur-xl overflow-hidden">
                        <SectionHeader
                            icon={<Hash className="w-4 h-4" />}
                            title="Hashes & Ownership Evidence"
                        />
                        <div className="p-4 md:p-5 space-y-3">
                            <HashRow label="File Hash" value={issue.fileHash} />
                            <HashRow label="Perceptual Hash" value={issue.perceptualHash} />
                            <HashRow label="Author ID Hash" value={issue.authorIdHash} />
                            <HashRow label="Evidence Hash" value={issue.evidenceHash} />
                        </div>
                    </section>
                </div>

                <div className="grid gap-6 mt-6 lg:grid-cols-2 items-start">
                    <section className="rounded-3xl border border-border/70 bg-card/85 backdrop-blur-xl overflow-hidden">
                        <SectionHeader
                            icon={<Link2 className="w-4 h-4" />}
                            title="Blockchain Record"
                        />
                        <div className="p-4 md:p-5 space-y-3">
                            <InfoRow label="Chain" value={issue.chain ?? "No chain recorded"} />
                            <InfoRow label="Transaction Hash" value={issue.txHash ?? "No transaction hash"} />
                            <InfoRow
                                label="Block Number"
                                value={issue.blockNumber !== null ? String(issue.blockNumber) : "No block number"}
                            />
                            <InfoRow label="Work ID" value={issue.workId ?? "No work ID"} />

                            {txUrl && <LinkButton href={txUrl} label="View on chain" />}
                        </div>
                    </section>

                    <section className="rounded-3xl border border-border/70 bg-card/85 backdrop-blur-xl overflow-hidden">
                        <SectionHeader
                            icon={<Fingerprint className="w-4 h-4" />}
                            title="Stored Technical Payloads"
                        />
                        <div className="p-4 md:p-5 space-y-3">
                            <TechnicalDetailsToggle
                                title="Evidence JSON"
                                description="Stored ownership or supporting evidence payload."
                            >
                                {evidenceText && (
                                    <div className="p-2">
                                        <pre className="rounded-xl border border-border bg-background/70 p-4 text-[11px] text-muted-foreground overflow-auto whitespace-pre-wrap leading-6 max-h-80">
                                            {evidenceText}
                                        </pre>
                                    </div>
                                )}
                            </TechnicalDetailsToggle>

                            <TechnicalDetailsToggle
                                title="Plagiarism Hashes"
                                description="Saved plagiarism-related payload stored on the artwork record."
                            >
                                {plagiarismText && (
                                    <div className="p-2">
                                        <pre className="rounded-xl border border-border bg-background/70 p-4 text-[11px] text-muted-foreground overflow-auto whitespace-pre-wrap leading-6 max-h-80">
                                            {plagiarismText}
                                        </pre>
                                    </div>
                                )}
                            </TechnicalDetailsToggle>

                            <TechnicalDetailsToggle
                                title="Similarity Hashes"
                                description="Hash payload returned by the similarity scan."
                            >
                                {similarityHashesText && (
                                    <div className="p-2">
                                        <pre className="rounded-xl border border-border bg-background/70 p-4 text-[11px] text-muted-foreground overflow-auto whitespace-pre-wrap leading-6 max-h-80">
                                            {similarityHashesText}
                                        </pre>
                                    </div>
                                )}
                            </TechnicalDetailsToggle>

                            <TechnicalDetailsToggle
                                title="Raw Similarity Response"
                                description="Raw response of the saved similarity scan."
                            >
                                {rawScanText && (
                                    <div className="p-2">
                                        <pre className="rounded-xl border border-border bg-background/70 p-4 text-[11px] text-muted-foreground overflow-auto whitespace-pre-wrap leading-6 max-h-80">
                                            {rawScanText}
                                        </pre>
                                    </div>
                                )}
                            </TechnicalDetailsToggle>
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
}

function getStatusIcon(status: ArtworkStatus) {
    switch (status) {
        case "flagged":
            return <AlertTriangle className="w-4 h-4" />;
        case "removed":
            return <ShieldX className="w-4 h-4" />;
        case "blockchain_failed":
            return <XCircle className="w-4 h-4" />;
        case "revoked":
            return <Ban className="w-4 h-4" />;
        default:
            return <ShieldAlert className="w-4 h-4" />;
    }
}