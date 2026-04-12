import { jsPDF } from "jspdf";
import type { SearchResponse, SearchMatch } from "@/features/plagiarise-checker";

export type PlagiarismReportData = {
    result: SearchResponse;
    submittedImagePreview?: string | null;
    checkedAt?: Date;
};

function safeValue(value: unknown, fallback = "N/A"): string {
    if (value === null || value === undefined || value === "") return fallback;
    return String(value);
}

function shortenMiddle(value: string, head = 12, tail = 8): string {
    if (value.length <= head + tail + 3) return value;
    return `${value.slice(0, head)}...${value.slice(-tail)}`;
}

function splitSingleLine(doc: jsPDF, value: string, maxWidth: number): string {
    return doc.splitTextToSize(value, maxWidth)[0] ?? value;
}

function roundedRect(
    doc: jsPDF,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
    style: "S" | "F" | "DF" = "S"
) {
    doc.roundedRect(x, y, w, h, r, r, style);
}

function drawShieldBadge(doc: jsPDF, cx: number, cy: number, size: number) {
    const w = size * 0.72;
    const h = size * 0.88;
    const x = cx - w / 2;
    const y = cy - h / 2;

    doc.setFillColor(37, 99, 235);
    doc.setDrawColor(37, 99, 235);

    roundedRect(doc, x, y, w, h * 0.72, 2, "F");
    doc.triangle(x, y + h * 0.68, x + w, y + h * 0.68, cx, y + h, "F");
}

function drawStatusPill(
    doc: jsPDF,
    x: number,
    y: number,
    label: string,
    dotColor: [number, number, number],
    bgColor: [number, number, number],
    textColor: [number, number, number]
) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);

    const width = doc.getTextWidth(label) + 12;
    doc.setFillColor(...bgColor);
    roundedRect(doc, x, y, width, 6, 3, "F");

    doc.setFillColor(...dotColor);
    doc.circle(x + 4.2, y + 3, 1.3, "F");

    doc.setTextColor(...textColor);
    doc.text(label, x + 7.2, y + 4.1);
}

function drawSectionHeader(
    doc: jsPDF,
    x: number,
    y: number,
    w: number,
    label: string,
    accentColor: [number, number, number]
): number {
    doc.setFillColor(...accentColor);
    doc.rect(x, y, 2.5, 7, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...accentColor);
    doc.text(label.toUpperCase(), x + 5, y + 5.2);

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.line(x, y + 8, x + w, y + 8);

    return y + 12;
}

function drawInfoRow(
    doc: jsPDF,
    x: number,
    y: number,
    w: number,
    label: string,
    value: string,
    options?: {
        mono?: boolean;
        isLast?: boolean;
        link?: string;
        valueColor?: [number, number, number];
    }
): number {
    const mono = options?.mono ?? false;
    const isLast = options?.isLast ?? false;
    const link = options?.link;
    const valueColor = options?.valueColor;

    doc.setFillColor(248, 250, 252);
    doc.rect(x, y - 0.5, w, 6.5, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(label, x + 1.5, y + 4);

    const valueX = x + w - 1.5;

    if (mono) {
        doc.setFont("courier", "normal");
        doc.setFontSize(6);
    } else {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(6.5);
    }

    if (link) {
        doc.setTextColor(37, 99, 235);
    } else if (valueColor) {
        doc.setTextColor(...valueColor);
    } else {
        doc.setTextColor(15, 23, 42);
    }

    const text = splitSingleLine(doc, value, w * 0.58);
    doc.text(text, valueX, y + 4, { align: "right" });

    if (link) {
        const textWidth = doc.getTextWidth(text);
        const textY = y + 4;

        doc.setDrawColor(37, 99, 235);
        doc.setLineWidth(0.15);
        doc.line(valueX - textWidth, textY + 0.6, valueX, textY + 0.6);
        doc.link(valueX - textWidth, textY - 3.5, textWidth, 4.5, { url: link });
    }

    if (!isLast) {
        doc.setDrawColor(241, 245, 249);
        doc.setLineWidth(0.15);
        doc.line(x, y + 6, x + w, y + 6);
    }

    return y + 6.5;
}

function getSimilarityStatus(similarity: number | null): {
    label: string;
    dot: [number, number, number];
    bg: [number, number, number];
    text: [number, number, number];
    accent: [number, number, number];
} {
    const s = similarity ?? 0;

    if (s >= 90) {
        return {
            label: "CRITICAL SIMILARITY",
            dot: [220, 38, 38],
            bg: [127, 29, 29],
            text: [254, 202, 202],
            accent: [220, 38, 38],
        };
    }

    if (s >= 70) {
        return {
            label: "HIGH SIMILARITY",
            dot: [234, 88, 12],
            bg: [124, 45, 18],
            text: [254, 215, 170],
            accent: [234, 88, 12],
        };
    }

    if (s >= 50) {
        return {
            label: "MODERATE SIMILARITY",
            dot: [245, 158, 11],
            bg: [120, 53, 15],
            text: [253, 230, 138],
            accent: [245, 158, 11],
        };
    }

    return {
        label: "LOW SIMILARITY",
        dot: [22, 163, 74],
        bg: [20, 83, 45],
        text: [187, 247, 208],
        accent: [22, 163, 74],
    };
}

async function imageUrlToDataUrl(url: string): Promise<string | null> {
    try {
        const response = await fetch(url);
        if (!response.ok) return null;

        const blob = await response.blob();

        return await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () =>
                resolve(typeof reader.result === "string" ? reader.result : null);
            reader.readAsDataURL(blob);
        });
    } catch {
        return null;
    }
}

async function previewToDataUrl(preview: string): Promise<string | null> {
    if (preview.startsWith("data:")) return preview;
    return imageUrlToDataUrl(preview);
}

function getImageFormat(dataUrl: string): "PNG" | "JPEG" | "WEBP" {
    if (dataUrl.startsWith("data:image/png")) return "PNG";
    if (dataUrl.startsWith("data:image/webp")) return "WEBP";
    return "JPEG";
}

function addImageContain(
    doc: jsPDF,
    dataUrl: string,
    x: number,
    y: number,
    boxW: number,
    boxH: number
) {
    const format = getImageFormat(dataUrl);

    const props = doc.getImageProperties(dataUrl);
    const imgW = props.width;
    const imgH = props.height;

    if (!imgW || !imgH) return;

    const scale = Math.min(boxW / imgW, boxH / imgH);
    const renderW = imgW * scale;
    const renderH = imgH * scale;
    const renderX = x + (boxW - renderW) / 2;
    const renderY = y + (boxH - renderH) / 2;

    doc.addImage(dataUrl, format, renderX, renderY, renderW, renderH);
}

function getSourceUrl(match: SearchMatch | null | undefined): string | undefined {
    if (!match) return undefined;
    if (match.type === "database") return match.url || undefined;
    return match.link || match.url || undefined;
}

function getDisplayUrl(match: SearchMatch | null | undefined): string {
    if (!match) return "N/A";
    if (match.type === "database") return safeValue(match.url);
    return safeValue(match.link ?? match.url);
}

function drawMatchSummaryCard(
    doc: jsPDF,
    x: number,
    y: number,
    w: number,
    title: string,
    match: SearchMatch | null,
    accent: [number, number, number]
): number {
    const h = 28;

    doc.setFillColor(255, 255, 255);
    roundedRect(doc, x, y, w, h, 3, "F");
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    roundedRect(doc, x, y, w, h, 3, "S");

    doc.setFillColor(...accent);
    doc.rect(x, y, 2.5, h, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(...accent);
    doc.text(title.toUpperCase(), x + 5, y + 5.5);

    if (!match) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(100, 116, 139);
        doc.text("No match detected", x + 5, y + 12);
        return y + h;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(`${match.similarity.toFixed(1)}%`, x + 5, y + 13);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    doc.text(splitSingleLine(doc, safeValue(match.source), w - 12), x + 22, y + 13);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(5.8);
    doc.setTextColor(100, 116, 139);
    doc.text("TYPE", x + 5, y + 20);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.3);
    doc.setTextColor(15, 23, 42);
    doc.text(safeValue(match.type).toUpperCase(), x + 5, y + 24.5);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(5.8);
    doc.setTextColor(100, 116, 139);
    doc.text("SOURCE", x + w / 2, y + 20);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.3);
    doc.setTextColor(15, 23, 42);
    doc.text(splitSingleLine(doc, safeValue(match.source), w / 2 - 8), x + w / 2, y + 24.5);

    return y + h;
}

export async function generatePlagiarismReportPdf(data: PlagiarismReportData) {
    const { result, submittedImagePreview, checkedAt = new Date() } = data;

    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
    });

    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();

    const best = result.best_match;
    const bestSimilarity = best?.similarity ?? null;
    const status = getSimilarityStatus(bestSimilarity);

    const isBestDatabase = best?.type === "database";
    const dbMatch = result.db;
    const webMatch = result.web;

    const bestSourceLabel = isBestDatabase ? "DATABASE MATCH" : "WEB MATCH";
    const bestSourceUrl = getSourceUrl(best);

    const txDate = checkedAt.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    // Global spacing rhythm
    const SECTION_GAP = 6;
    const SUMMARY_TOP_GAP = 8;
    const SUMMARY_CARD_GAP = 5;
    const SUMMARY_CARD_H = 28;
    const DECLARATION_TOP_GAP = 8;
    const DECLARATION_TO_DISCLAIMER_GAP = 3;
    const BOTTOM_SAFE_GAP = 4;

    // Background
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, W, 68, "F");

    doc.setFillColor(30, 58, 138);
    doc.rect(0, 0, W, 3, "F");

    doc.setFillColor(248, 250, 252);
    doc.rect(0, 68, W, H - 68, "F");

    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(0.25);
    doc.circle(W - 18, 10, 38, "S");
    doc.circle(W - 18, 10, 28, "S");

    doc.setFillColor(37, 99, 235);
    doc.rect(0, 3, 4, 65, "F");

    // Header
    drawShieldBadge(doc, 22, 26, 18);

    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.8);
    doc.line(18.5, 26.5, 20.8, 29.2);
    doc.line(20.8, 29.2, 25.5, 23.5);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(147, 197, 253);
    doc.text("ARTFORGELAB  ·  INTELLECTUAL PROPERTY RIGHTS MANAGEMENT SYSTEM", 34, 19);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.text("Plagiarism Analysis Report", 34, 30);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
        "Digital Artists IPR Management System using Perceptual Hashing & Similarity Matching",
        34,
        38
    );

    drawStatusPill(doc, 34, 42, status.label, status.dot, status.bg, status.text);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(`Generated: ${txDate}`, W - 12, 57, { align: "right" });
    doc.text(
        `Ref: #${safeValue(result.filename).replace(/\.[^.]+$/, "").slice(0, 12).toUpperCase()}`,
        W - 12,
        62,
        { align: "right" }
    );

    // Main summary card
    const cardX = 12;
    const cardY = 55;
    const cardW = W - 24;
    const cardH = 54;

    doc.setFillColor(203, 213, 225);
    roundedRect(doc, cardX + 1, cardY + 1.5, cardW, cardH, 4, "F");

    doc.setFillColor(255, 255, 255);
    roundedRect(doc, cardX, cardY, cardW, cardH, 4, "F");
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    roundedRect(doc, cardX, cardY, cardW, cardH, 4, "S");

    // Uploaded image preview
    const imgBoxX = cardX + 4;
    const imgBoxY = cardY + 4;
    const imgBoxSize = cardH - 8;

    doc.setFillColor(241, 245, 249);
    roundedRect(doc, imgBoxX, imgBoxY, imgBoxSize, imgBoxSize, 3, "F");
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.2);
    roundedRect(doc, imgBoxX, imgBoxY, imgBoxSize, imgBoxSize, 3, "S");

    if (submittedImagePreview) {
        const imgData = await previewToDataUrl(submittedImagePreview);
        if (imgData) {
            try {
                addImageContain(
                    doc,
                    imgData,
                    imgBoxX + 0.5,
                    imgBoxY + 0.5,
                    imgBoxSize - 1,
                    imgBoxSize - 1
                );
            } catch {
                doc.setFont("helvetica", "normal");
                doc.setFontSize(7);
                doc.setTextColor(148, 163, 184);
                doc.text(
                    "Preview unavailable",
                    imgBoxX + imgBoxSize / 2,
                    imgBoxY + imgBoxSize / 2,
                    { align: "center" }
                );
            }
        }
    } else {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(148, 163, 184);
        doc.text("No preview", imgBoxX + imgBoxSize / 2, imgBoxY + imgBoxSize / 2, {
            align: "center",
        });
    }

    // Summary content
    const infoX = imgBoxX + imgBoxSize + 6;
    const infoW = cardX + cardW - infoX - 4;
    let iy = cardY + 10;

    doc.setFillColor(239, 246, 255);
    doc.setDrawColor(191, 219, 254);
    doc.setLineWidth(0.2);

    const labelText = bestSourceLabel;
    const labelW = Math.min(doc.getTextWidth(labelText) + 10, 52);
    roundedRect(doc, infoX, iy - 3.5, labelW, 5.5, 2.5, "DF");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(6);
    doc.setTextColor(37, 99, 235);
    doc.text(labelText, infoX + labelW / 2, iy + 0.5, { align: "center" });

    iy += 5;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    const bestTitle = best
        ? `${best.similarity.toFixed(1)}% similarity detected`
        : "No significant match detected";
    const titleLines = doc.splitTextToSize(bestTitle, infoW).slice(0, 2);
    doc.text(titleLines, infoX, iy + 4);

    iy += titleLines.length * 6 + 2;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(
        best ? `Best source: ${safeValue(best.source)}` : "No best match source available",
        infoX,
        iy
    );

    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(splitSingleLine(doc, safeValue(result.filename), infoW), infoX, iy + 4.5);

    iy += 10;

    const stats = [
        {
            label: "Best Match",
            value: best ? `${best.similarity.toFixed(1)}%` : "N/A",
        },
        {
            label: "Database",
            value: dbMatch ? `${dbMatch.similarity.toFixed(1)}%` : "N/A",
        },
        {
            label: "Web",
            value: webMatch ? `${webMatch.similarity.toFixed(1)}%` : "N/A",
        },
    ];

    stats.forEach((stat, i) => {
        const sx = infoX + i * (infoW / 3);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(6);
        doc.setTextColor(100, 116, 139);
        doc.text(stat.label.toUpperCase(), sx, iy);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.5);
        doc.setTextColor(15, 23, 42);
        doc.text(splitSingleLine(doc, stat.value, infoW / 3 - 3), sx, iy + 4.5);
    });

    // Two-column metadata
    const sectionTop = cardY + cardH + 8;
    const colGap = 5;
    const colW = (W - 24 - colGap) / 2;
    const col1X = 12;
    const col2X = col1X + colW + colGap;

    // LEFT COLUMN
    let ly = sectionTop;
    ly = drawSectionHeader(doc, col1X, ly, colW, "Scan Metadata", [37, 99, 235]);

    const leftRows = [
        ["Filename", safeValue(result.filename), false],
        ["Scan Date", txDate, false],
        ["Original Hash", shortenMiddle(safeValue(result.original_hash), 12, 8), true],
        ["Best Match Type", safeValue(best?.type).toUpperCase(), false],
        ["Best Source", safeValue(best?.source), false],
        ["Best Similarity", best ? `${best.similarity.toFixed(1)}%` : "N/A", false],
    ] as const;

    leftRows.forEach(([label, value, mono], i) => {
        ly = drawInfoRow(doc, col1X, ly, colW, label, value, {
            mono,
            isLast: i === leftRows.length - 1,
        });
    });

    ly += SECTION_GAP;
    ly = drawSectionHeader(doc, col1X, ly, colW, "Match Endpoints", [99, 102, 241]);

    ly = drawInfoRow(doc, col1X, ly, colW, "Best Match URL", shortenMiddle(getDisplayUrl(best), 18, 12), {
        mono: true,
        link: bestSourceUrl,
        isLast: !webMatch,
    });

    if (webMatch) {
        ly = drawInfoRow(doc, col1X, ly, colW, "Web URL", shortenMiddle(getDisplayUrl(webMatch), 18, 12), {
            mono: true,
            link: getSourceUrl(webMatch),
            isLast: true,
        });
    }

    // RIGHT COLUMN
    let ry = sectionTop;
    ry = drawSectionHeader(doc, col2X, ry, colW, "Similarity Fingerprints", [16, 185, 129]);

    const transformEntries = Object.entries(result.hashes.transforms ?? {});
    const blockEntries = Object.entries(result.hashes.blocks ?? {});

    const selectedHashes = [
        ...transformEntries.slice(0, 3).map(([key, value]) => [key, value.phash] as const),
        ...blockEntries.slice(0, 3).map(([key, value]) => [key, value.phash] as const),
    ];

    if (selectedHashes.length === 0) {
        ry = drawInfoRow(doc, col2X, ry, colW, "Hash Data", "No perceptual hashes returned", {
            isLast: true,
        });
    } else {
        selectedHashes.forEach(([label, value], i) => {
            ry = drawInfoRow(doc, col2X, ry, colW, label, shortenMiddle(safeValue(value), 12, 8), {
                mono: true,
                isLast: i === selectedHashes.length - 1,
            });
        });
    }

    ry += SECTION_GAP;

    doc.setFillColor(240, 253, 250);
    doc.setDrawColor(167, 243, 208);
    doc.setLineWidth(0.3);
    const noticeH = 24;
    roundedRect(doc, col2X, ry, colW, noticeH, 3, "DF");

    doc.setFillColor(...status.accent);
    doc.rect(col2X, ry, 2.5, noticeH, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(6, 95, 70);
    doc.text("ANALYSIS NOTICE", col2X + 5, ry + 5.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);
    doc.setTextColor(20, 83, 45);

    const noticeText = doc.splitTextToSize(
        best
            ? `The uploaded image produced a best-match similarity score of ${best.similarity.toFixed(
                1
            )}%. This output is intended to support platform-level review and should be interpreted together with source context, artwork history, and manual inspection.`
            : "No strong best-match result was returned by the analysis engine. This report still documents the scan metadata and generated perceptual fingerprints for review.",
        colW - 8
    );

    doc.text(noticeText, col2X + 5, ry + 10.5);

    // Lower section with consistent spacing
    const contentBottom = Math.max(ly, ry + noticeH);
    const summaryY = contentBottom + SUMMARY_TOP_GAP;
    const summaryCardW = (W - 24 - SUMMARY_CARD_GAP) / 2;

    drawMatchSummaryCard(doc, 12, summaryY, summaryCardW, "Database Match", dbMatch, [99, 102, 241]);
    drawMatchSummaryCard(
        doc,
        12 + summaryCardW + SUMMARY_CARD_GAP,
        summaryY,
        summaryCardW,
        "Web Match",
        webMatch,
        [14, 165, 233]
    );

    const declarationText = best
        ? `This report documents the plagiarism analysis performed for "${safeValue(
            result.filename
        )}". The system generated perceptual-hash fingerprints, compared them against internal and web sources, and identified a best-match similarity result of ${best.similarity.toFixed(
            1
        )}% from ${safeValue(best.source)}.`
        : `This report documents the plagiarism analysis performed for "${safeValue(
            result.filename
        )}". The system generated perceptual-hash fingerprints and completed the scan flow, but no dominant best-match result was identified in the returned analysis output.`;

    const disclaimerText =
        "This document is system-generated for platform review and documentation. Similarity percentages indicate visual similarity based on perceptual hashing and related matching outputs. The report does not, by itself, establish legal infringement or formal copyright liability.";

    // Measure disclaimer
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);
    const disclaimerLines = doc.splitTextToSize(disclaimerText, W - 32);
    const disclaimerH = Math.max(12, 6 + disclaimerLines.length * 2.9 + 1.5);

    // Measure declaration
    const declarationFontSize = 6.8;
    const declarationLineHeight = 1.35;
    const declarationTextWidth = W - 24 - 14;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(declarationFontSize);

    const declLines = doc.splitTextToSize(declarationText, declarationTextWidth);
    const lineHeightMm = declarationFontSize * declarationLineHeight * 0.352778;
    const declTextHeight = declLines.length * lineHeightMm;

    const declHeaderOffset = 10;
    const declBottomPadding = 4;
    const declH = Math.max(24, declHeaderOffset + declTextHeight + declBottomPadding);

    const footerTop = H - 14;
    const declY = summaryY + SUMMARY_CARD_H + DECLARATION_TOP_GAP;
    const disclaimerY = declY + declH + DECLARATION_TO_DISCLAIMER_GAP;

    let finalDeclY = declY;
    const finalDeclH = declH;
    let finalDisclaimerY = disclaimerY;
    const finalDisclaimerH = disclaimerH;

    const overflow = finalDisclaimerY + finalDisclaimerH + BOTTOM_SAFE_GAP - footerTop;

    if (overflow > 0) {
        finalDeclY -= overflow;

        const minDeclY = summaryY + SUMMARY_CARD_H + 5;
        if (finalDeclY < minDeclY) {
            finalDeclY = minDeclY;
        }

        finalDisclaimerY = finalDeclY + finalDeclH + DECLARATION_TO_DISCLAIMER_GAP;
    }

    // Declaration
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    roundedRect(doc, 12, finalDeclY, W - 24, finalDeclH, 3, "DF");

    doc.setFillColor(37, 99, 235);
    doc.rect(12, finalDeclY, 3, finalDeclH, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.2);
    doc.setTextColor(37, 99, 235);
    doc.text("DECLARATION", 19, finalDeclY + 5.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(declarationFontSize);
    doc.setTextColor(51, 65, 85);
    doc.text(declLines, 19, finalDeclY + 10.5, {
        lineHeightFactor: declarationLineHeight,
        maxWidth: declarationTextWidth,
    });

    // Disclaimer
    doc.setFillColor(248, 250, 252);
    roundedRect(doc, 12, finalDisclaimerY, W - 24, finalDisclaimerH, 3, "F");
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.2);
    roundedRect(doc, 12, finalDisclaimerY, W - 24, finalDisclaimerH, 3, "S");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(6);
    doc.setTextColor(100, 116, 139);
    doc.text("DISCLAIMER", 16, finalDisclaimerY + 4.2);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);
    doc.setTextColor(100, 116, 139);
    doc.text(disclaimerLines, 16, finalDisclaimerY + 8.2);

    // Footer
    doc.setFillColor(15, 23, 42);
    doc.rect(0, H - 14, W, 14, "F");

    doc.setFillColor(37, 99, 235);
    doc.rect(0, H - 14, W, 1, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text("ArtForgeLab — Digital Artists IPR Management System", 14, H - 6.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Generated on ${checkedAt.toLocaleString()}`, W - 14, H - 6.5, {
        align: "right",
    });

    // Save
    const safeName = safeValue(result.filename)
        .replace(/\.[^.]+$/, "")
        .replace(/[^a-z0-9]/gi, "_")
        .replace(/_+/g, "_")
        .toLowerCase();

    doc.save(`plagiarism_report_${safeName || "scan"}.pdf`);
}