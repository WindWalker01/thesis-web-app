import { jsPDF } from "jspdf";
import type { CertificateArtwork } from "./types";

function safeValue(value: unknown, fallback = "N/A"): string {
    if (value === null || value === undefined || value === "") return fallback;
    return String(value);
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

function shortenMiddle(value: string, head = 10, tail = 8): string {
    if (value.length <= head + tail + 3) return value;
    return `${value.slice(0, head)}...${value.slice(-tail)}`;
}

function splitSingleLine(doc: jsPDF, value: string, maxWidth: number): string {
    return doc.splitTextToSize(value, maxWidth)[0] ?? value;
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
        /** When provided, renders the value as a blue underlined clickable link */
        link?: string;
    }
): number {
    const mono = options?.mono ?? false;
    const isLast = options?.isLast ?? false;
    const link = options?.link;

    doc.setFillColor(248, 250, 252);
    doc.rect(x, y - 0.5, w, 6.5, "F");

    // Label
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(label, x + 1.5, y + 4);

    // Value
    const valueX = x + w - 1.5;

    if (mono) {
        doc.setFont("courier", "normal");
        doc.setFontSize(6);
    } else {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(6.5);
    }

    // Blue color for links, default dark for plain values
    if (link) {
        doc.setTextColor(37, 99, 235);
    } else {
        doc.setTextColor(15, 23, 42);
    }

    const text = splitSingleLine(doc, value, w * 0.58);
    doc.text(text, valueX, y + 4, { align: "right" });

    if (link) {
        const textWidth = doc.getTextWidth(text);
        const textY = y + 4;

        // Underline beneath the value text
        doc.setDrawColor(37, 99, 235);
        doc.setLineWidth(0.15);
        doc.line(valueX - textWidth, textY + 0.6, valueX, textY + 0.6);

        // Clickable hotspot — PDF viewers open this in a new tab by default
        doc.link(valueX - textWidth, textY - 3.5, textWidth, 4.5, { url: link });
    }

    if (!isLast) {
        doc.setDrawColor(241, 245, 249);
        doc.setLineWidth(0.15);
        doc.line(x, y + 6, x + w, y + 6);
    }

    return y + 6.5;
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

export async function generateArtworkCertificatePdf(artwork: CertificateArtwork) {
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
    });

    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();

    const isVerified = artwork.ownershipStatus === "verified";
    const txHash = safeValue(artwork.txHash);
    const hasChain = txHash !== "N/A";

    // Full Polygonscan URL — only set when a real hash exists
    const polygonscanUrl = hasChain
        ? `https://amoy.polygonscan.com/tx/${txHash}`
        : undefined;

    const title = safeValue(artwork.title);
    const category = safeValue(artwork.category);
    const creatorName = safeValue(artwork.creator?.fullName);
    const creatorUsername = artwork.creator?.username
        ? `@${artwork.creator.username}`
        : "N/A";

    // ── Backgrounds ──────────────────────────────────────────────
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

    // ── Header ───────────────────────────────────────────────────
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
    doc.text("Certificate of Artwork Registration", 34, 30);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
        "Digital Artists IPR Management System using Perceptual Hashing & Blockchain Technology",
        34,
        38
    );

    if (isVerified) {
        drawStatusPill(doc, 34, 42, "OWNERSHIP VERIFIED", [22, 163, 74], [20, 83, 45], [134, 239, 172]);
    } else {
        drawStatusPill(doc, 34, 42, "PENDING VERIFICATION", [234, 88, 12], [69, 26, 3], [253, 186, 116]);
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(`Ref: #${safeValue(artwork.id).slice(0, 12).toUpperCase()}`, W - 12, 62, { align: "right" });
    doc.text(
        `Generated: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`,
        W - 12,
        57,
        { align: "right" }
    );

    // ── Main title card ──────────────────────────────────────────
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

    // Artwork image
    const imgBoxX = cardX + 4;
    const imgBoxY = cardY + 4;
    const imgBoxSize = cardH - 8;

    doc.setFillColor(241, 245, 249);
    roundedRect(doc, imgBoxX, imgBoxY, imgBoxSize, imgBoxSize, 3, "F");
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.2);
    roundedRect(doc, imgBoxX, imgBoxY, imgBoxSize, imgBoxSize, 3, "S");

    if (artwork.img) {
        const imgData = await imageUrlToDataUrl(artwork.img);
        if (imgData) {
            try {
                doc.addImage(imgData, "JPEG", imgBoxX + 0.5, imgBoxY + 0.5, imgBoxSize - 1, imgBoxSize - 1);
            } catch {
                doc.setFont("helvetica", "normal");
                doc.setFontSize(7);
                doc.setTextColor(148, 163, 184);
                doc.text("No Image", imgBoxX + imgBoxSize / 2, imgBoxY + imgBoxSize / 2, { align: "center" });
            }
        }
    } else {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(148, 163, 184);
        doc.text("No Image", imgBoxX + imgBoxSize / 2, imgBoxY + imgBoxSize / 2, { align: "center" });
    }

    // Artwork info
    const infoX = imgBoxX + imgBoxSize + 6;
    const infoW = cardX + cardW - infoX - 4;
    let iy = cardY + 10;

    doc.setFillColor(239, 246, 255);
    doc.setDrawColor(191, 219, 254);
    doc.setLineWidth(0.2);
    const catLabel = category.toUpperCase();
    const catW = Math.min(doc.getTextWidth(catLabel) + 8, 48);
    roundedRect(doc, infoX, iy - 3.5, catW, 5.5, 2.5, "DF");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(6);
    doc.setTextColor(37, 99, 235);
    doc.text(catLabel, infoX + catW / 2, iy + 0.5, { align: "center" });

    iy += 5;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    const titleLines = doc.splitTextToSize(title, infoW).slice(0, 2);
    doc.text(titleLines, infoX, iy + 4);

    iy += titleLines.length * 6 + 2;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(`by ${creatorName}`, infoX, iy);

    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(creatorUsername, infoX, iy + 4.5);
    iy += 10;

    const stats = [
        { label: "Registered", value: safeValue(artwork.uploadDate) },
        { label: "Blockchain", value: hasChain ? "On-chain" : "Off-chain" },
        { label: "Status", value: isVerified ? "Verified" : "Pending" },
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

    // ── Two-column metadata ──────────────────────────────────────
    const sectionTop = cardY + cardH + 8;
    const colGap = 5;
    const colW = (W - 24 - colGap) / 2;
    const col1X = 12;
    const col2X = col1X + colW + colGap;

    // LEFT COLUMN
    let ly = sectionTop;
    ly = drawSectionHeader(doc, col1X, ly, colW, "Registration Metadata", [37, 99, 235]);

    const leftRows: Array<[string, string, boolean?]> = [
        ["Artwork ID", shortenMiddle(safeValue(artwork.id), 10, 8), true],
        ["Category", category],
        ["System Status", safeValue(artwork.status)],
        ["Registered On", safeValue(artwork.uploadDate)],
        ["Work ID", shortenMiddle(safeValue(artwork.workId), 10, 8), true],
        ["Ownership", isVerified ? "Verified" : "Pending"],
    ];

    leftRows.forEach(([label, value, mono], i) => {
        ly = drawInfoRow(doc, col1X, ly, colW, label, value, {
            mono: mono === true,
            isLast: i === leftRows.length - 1,
        });
    });

    ly += 6;
    ly = drawSectionHeader(doc, col1X, ly, colW, "Blockchain Record", [99, 102, 241]);

    // Transaction Hash row gets a clickable link when a real hash exists
    const chainRows: Array<{
        label: string;
        value: string;
        mono?: boolean;
        link?: string;
        isLast?: boolean;
    }> = [
            { label: "Chain", value: safeValue(artwork.chain) },
            {
                label: "Block Number",
                value:
                    artwork.blockNumber !== null && artwork.blockNumber !== undefined
                        ? String(artwork.blockNumber)
                        : "N/A",
            },
            {
                label: "Transaction Hash",
                value: shortenMiddle(txHash, 10, 8),
                mono: true,
                link: polygonscanUrl, // undefined when no chain data → renders as plain text
                isLast: true,
            },
        ];

    chainRows.forEach((row) => {
        ly = drawInfoRow(doc, col1X, ly, colW, row.label, row.value, {
            mono: row.mono,
            isLast: row.isLast,
            link: row.link,
        });
    });

    // RIGHT COLUMN
    let ry = sectionTop;
    ry = drawSectionHeader(doc, col2X, ry, colW, "Cryptographic Fingerprints", [16, 185, 129]);

    const hashRows: Array<[string, string]> = [
        ["File Hash", shortenMiddle(safeValue(artwork.fileHash), 12, 8)],
        ["Perceptual Hash", shortenMiddle(safeValue(artwork.perceptualHash), 12, 8)],
        ["Author ID Hash", shortenMiddle(safeValue(artwork.authorIdHash), 12, 8)],
        ["Evidence Hash", shortenMiddle(safeValue(artwork.evidenceHash), 12, 8)],
    ];

    hashRows.forEach(([label, value], i) => {
        ry = drawInfoRow(doc, col2X, ry, colW, label, value, {
            mono: true,
            isLast: i === hashRows.length - 1,
        });
    });

    // Integrity notice
    ry += 6;
    doc.setFillColor(240, 253, 250);
    doc.setDrawColor(167, 243, 208);
    doc.setLineWidth(0.3);
    const noticeH = 24;
    roundedRect(doc, col2X, ry, colW, noticeH, 3, "DF");

    doc.setFillColor(16, 185, 129);
    doc.rect(col2X, ry, 2.5, noticeH, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(6, 95, 70);
    doc.text("INTEGRITY NOTICE", col2X + 5, ry + 5.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);
    doc.setTextColor(20, 83, 45);
    const noticeText = doc.splitTextToSize(
        "All hashes are computed at upload time and stored immutably. The evidence hash seals the full submission payload including file metadata, perceptual hash, and user identity hash.",
        colW - 8
    );
    doc.text(noticeText, col2X + 5, ry + 10.5);

    // ── Declaration ──────────────────────────────────────────────
    const contentBottom = Math.max(ly, ry + noticeH);
    const declY = contentBottom + 8;

    const declarationText = `This certifies that the artwork "${title}" has been registered in the Digital Artists IPR Management System with the metadata, cryptographic fingerprints, and ownership record shown above. The record includes cryptographic hashes, perceptual hashes, and blockchain-linked identifiers to support proof of authorship, registration traceability, and ownership verification within the system.`;

    const declarationFontSize = 7;
    const declarationLineHeight = 1.45;
    const declarationTextWidth = W - 24 - 14; // safer inner width with padding

    doc.setFont("helvetica", "normal");
    doc.setFontSize(declarationFontSize);

    const declLines = doc.splitTextToSize(declarationText, declarationTextWidth);

    // More reliable text block height calculation
    const lineHeightMm =
        (declarationFontSize * declarationLineHeight * 0.352778);
    const declTextHeight = declLines.length * lineHeightMm;

    const declHeaderOffset = 12;
    const declBottomPadding = 5;
    const declH = Math.max(30, declHeaderOffset + declTextHeight + declBottomPadding);

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    roundedRect(doc, 12, declY, W - 24, declH, 3, "DF");

    doc.setFillColor(37, 99, 235);
    doc.rect(12, declY, 3, declH, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(37, 99, 235);
    doc.text("DECLARATION", 19, declY + 6);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(declarationFontSize);
    doc.setTextColor(51, 65, 85);
    doc.text(declLines, 19, declY + 12, {
        lineHeightFactor: declarationLineHeight,
        maxWidth: declarationTextWidth,
    });

    // ── Disclaimer ───────────────────────────────────────────────
    let disclaimerY = declY + declH + 4;

    const disclaimerText =
        "This document is system-generated as proof of registration and stored metadata within the platform. It supports documentation and verification inside the proposed system and does not replace formal government copyright registration or legal adjudication under applicable law.";

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);
    const disclaimerLines = doc.splitTextToSize(disclaimerText, W - 32);
    const disclaimerH = Math.max(14, 7 + disclaimerLines.length * 3.2 + 2);

    const footerTop = H - 14;
    if (disclaimerY + disclaimerH > footerTop - 4) {
        disclaimerY = footerTop - 4 - disclaimerH;
    }

    doc.setFillColor(248, 250, 252);
    roundedRect(doc, 12, disclaimerY, W - 24, disclaimerH, 3, "F");
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.2);
    roundedRect(doc, 12, disclaimerY, W - 24, disclaimerH, 3, "S");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(6);
    doc.setTextColor(100, 116, 139);
    doc.text("DISCLAIMER", 16, disclaimerY + 4.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);
    doc.setTextColor(100, 116, 139);
    doc.text(disclaimerLines, 16, disclaimerY + 9);

    // ── Footer ───────────────────────────────────────────────────
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
    doc.text(`Generated on ${new Date().toLocaleString()}`, W - 14, H - 6.5, { align: "right" });

    // ── Save ─────────────────────────────────────────────────────
    const safeTitle = title
        .replace(/[^a-z0-9]/gi, "_")
        .replace(/_+/g, "_")
        .toLowerCase();

    doc.save(`${safeTitle || "artwork"}_certificate.pdf`);
}