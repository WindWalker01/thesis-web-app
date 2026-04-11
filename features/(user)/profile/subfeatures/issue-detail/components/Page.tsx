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
    ScrollText,
    ShieldAlert,
    ShieldX,
    UserRound,
    XCircle,
    Ban,
    Boxes,
    ExternalLink,
} from "lucide-react";

import { useIssueDetailPage } from "../hooks/useIssueDetailPage";
import type { ArtworkStatus } from "../../../types";
import { formatUploadDate } from "../../..";
import { SectionHeader } from "../../artwork-detail/components/SectionHeader";
import { EmptyState } from "./EmptyState";
import { HashRow } from "./HashRow";
import { InfoRow } from "./InfoRow";
import IssueDetailPageSkeleton from "./PageSkeleton";
import { TechnicalDetailsToggle } from "../../artwork-detail/components/TechnicalDetailsToggle";
import { ArtworkStatusBadge } from "@/features/(user)/profile/components/ArtworkStatusBadge";
import {
    getIssueExplanation,
    buildChainTxUrl,
    formatPercentage,
    formatIssueMetric,
} from "../utils";
import { MetricCard } from "./MetricCard";
import { SimilarityReportSection } from "@/features/(user)/profile/components/SimilarityReportSection";

type Props = {
    id: string;
};

function getStatusIcon(status: ArtworkStatus) {
    switch (status) {
        case "flagged":
            return <ShieldAlert className="w-4 h-4" />;
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
                        Back to profile
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

    const explanation = getIssueExplanation({
        status: issue.status,
        similarityReport: issue.similarityReport,
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

                            {issue.creator ? (
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
                            ) : null}
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
                                    label="Best Similarity"
                                    value={formatPercentage(issue.similarityReport?.bestMatch?.similarity ?? null)}
                                    icon={<Boxes className="w-4 h-4" />}
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
                                icon={<Hash className="w-4 h-4" />}
                                title="Stored Record Snapshot"
                            />
                            <div className="grid gap-3 p-4 md:p-5">
                                <InfoRow label="Ownership status" value={issue.ownershipStatus} />
                                <InfoRow label="Hash status" value={issue.hashStatus} />
                                <InfoRow label="Artwork status" value={issue.status} />
                                <InfoRow label="Uploaded" value={issue.uploadDate} />
                                <InfoRow label="Chain" value={issue.chain ?? "No chain recorded"} />
                                <InfoRow label="Work ID" value={issue.workId ?? "No work ID"} />
                                <InfoRow
                                    label="Transaction hash"
                                    value={issue.txHash ?? "No transaction hash"}
                                />

                                {txUrl ? (
                                    <a
                                        href={txUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex w-fit items-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/10 px-3.5 py-2 text-sm font-semibold text-blue-500 hover:bg-blue-500/15 transition-colors"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        View blockchain transaction
                                    </a>
                                ) : null}
                            </div>
                        </section>
                    </div>
                </div>

                <div className="mt-6">
                    <SimilarityReportSection
                        scan={issue.similarityScan}
                        report={issue.similarityReport}
                    />
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
                                            <div className="mb-2 flex flex-wrap items-center gap-2">
                                                <span className="inline-flex rounded-full border border-border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-foreground">
                                                    {report.reportType.replaceAll("_", " ")}
                                                </span>
                                                <span className="inline-flex rounded-full border border-border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                                                    {report.status}
                                                </span>
                                            </div>

                                            <p className="mb-1 text-sm font-semibold text-foreground">
                                                {report.title}
                                            </p>
                                            <p className="mb-3 text-sm leading-6 text-muted-foreground">
                                                {report.description}
                                            </p>

                                            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                                                <span>Created {formatUploadDate(report.createdAt)}</span>
                                                <span>
                                                    Resolved{" "}
                                                    {report.resolvedAt
                                                        ? formatUploadDate(report.resolvedAt)
                                                        : "Not yet"}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState text="No related reports were found for this artwork." />
                            )}
                        </div>
                    </section>

                    <TechnicalDetailsToggle
                        title="Artwork hashes and technical issue details"
                        description="Review the stored artwork hashes, evidence payload, and saved plagiarism metadata for this issue."
                    >
                        <div className="space-y-6">
                            <div>
                                <div className="mb-3 flex items-center gap-2">
                                    <Fingerprint className="w-4 h-4 text-primary" />
                                    <p className="text-sm font-bold text-foreground">Artwork hashes</p>
                                </div>

                                <div className="grid gap-3 md:grid-cols-2">
                                    <HashRow label="File hash" value={issue.fileHash || null} />
                                    <HashRow label="Perceptual hash" value={issue.perceptualHash || null} />
                                    <HashRow label="Author ID hash" value={issue.authorIdHash} />
                                    <HashRow label="Evidence hash" value={issue.evidenceHash} />
                                </div>
                            </div>

                            <div>
                                <div className="mb-3 flex items-center gap-2">
                                    <ScrollText className="w-4 h-4 text-primary" />
                                    <p className="text-sm font-bold text-foreground">Evidence payload</p>
                                </div>

                                {evidenceText ? (
                                    <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-2xl border border-border bg-background/60 p-4 text-xs text-muted-foreground">
                                        {evidenceText}
                                    </pre>
                                ) : (
                                    <EmptyState text="No stored evidence payload is available for this issue." />
                                )}
                            </div>

                            <div>
                                <div className="mb-3 flex items-center gap-2">
                                    <Hash className="w-4 h-4 text-primary" />
                                    <p className="text-sm font-bold text-foreground">
                                        Plagiarism hashes payload
                                    </p>
                                </div>

                                {plagiarismText ? (
                                    <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-2xl border border-border bg-background/60 p-4 text-xs text-muted-foreground">
                                        {plagiarismText}
                                    </pre>
                                ) : (
                                    <EmptyState text="No extra plagiarism hashes payload is stored for this issue." />
                                )}
                            </div>
                        </div>
                    </TechnicalDetailsToggle>
                </div>
            </div>
        </main>
    );
}