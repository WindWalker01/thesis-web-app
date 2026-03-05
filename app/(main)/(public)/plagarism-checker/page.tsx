"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CloudUpload,
  ImageUp,
  RotateCcw,
  Download,
  AlertTriangle,
  Search,
  ShieldCheck,
  Info,
  Globe,
  Images,
  ArrowLeftRight,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRef, useState, useEffect, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Stage = "upload" | "analyzing" | "result";
type Mode = "web" | "compare";

interface Region {
  id: string;
  type: string;
  confidence: number;
  status: string;
  color: string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const WEB_REGIONS: Region[] = [
  {
    id: "#REG-01 (Center)",
    type: "Structural & Texture",
    confidence: 92,
    status: "Critical Match",
    color: "#ef4444",
  },
  {
    id: "#REG-02 (Top Left)",
    type: "Color Histogram",
    confidence: 65,
    status: "Moderate Match",
    color: "#f59e0b",
  },
  {
    id: "#REG-03 (Bottom)",
    type: "Edge Pattern",
    confidence: 78,
    status: "High Match",
    color: "#f97316",
  },
];

const COMPARE_REGIONS: Region[] = [
  {
    id: "#REG-01 (Center)",
    type: "Structural & Texture",
    confidence: 88,
    status: "Critical Match",
    color: "#ef4444",
  },
  {
    id: "#REG-02 (Top Right)",
    type: "Color Histogram",
    confidence: 71,
    status: "High Match",
    color: "#f97316",
  },
  {
    id: "#REG-03 (Bottom Left)",
    type: "Edge Pattern",
    confidence: 45,
    status: "Moderate Match",
    color: "#f59e0b",
  },
  {
    id: "#REG-04 (Overall)",
    type: "Perceptual Hash",
    confidence: 83,
    status: "Critical Match",
    color: "#ef4444",
  },
];

// ─── Shared Sub-components ────────────────────────────────────────────────────

function CircleProgress({ value }: { value: number }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;
  const color = value >= 80 ? "#ef4444" : value >= 60 ? "#f59e0b" : "#22c55e";

  return (
    <svg width="140" height="140" viewBox="0 0 140 140">
      <circle
        cx="70"
        cy="70"
        r={r}
        fill="none"
        stroke="hsl(var(--muted))"
        strokeWidth="10"
      />
      <circle
        cx="70"
        cy="70"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 70 70)"
        style={{ transition: "stroke-dasharray 1s ease" }}
      />
      <text
        x="70"
        y="64"
        textAnchor="middle"
        fill="hsl(var(--foreground))"
        fontSize="28"
        fontWeight="700"
        fontFamily="inherit"
      >
        {value}%
      </text>
      <text
        x="70"
        y="82"
        textAnchor="middle"
        fill="hsl(var(--muted-foreground))"
        fontSize="11"
        fontFamily="inherit"
      >
        MATCH
      </text>
    </svg>
  );
}

function HashCollisionMap() {
  const bars = Array.from({ length: 24 }, (_, i) => ({
    h: Math.sin(i * 0.7) * 0.4 + 0.6,
    match: i % 3 !== 2,
  }));
  return (
    <div className="flex h-9 w-full items-end gap-[3px]">
      {bars.map((b, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm"
          style={{
            height: `${b.h * 100}%`,
            background: b.match
              ? "linear-gradient(180deg, hsl(var(--primary)), hsl(var(--primary)/0.6))"
              : "hsl(var(--muted))",
          }}
        />
      ))}
    </div>
  );
}

function ConfidenceBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex w-full items-center gap-3">
      <div className="bg-muted h-1.5 flex-1 overflow-hidden rounded-full">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{
            width: `${value}%`,
            background: `linear-gradient(90deg, ${color}88, ${color})`,
          }}
        />
      </div>
      <span
        className="min-w-[36px] font-mono text-xs font-semibold"
        style={{ color }}
      >
        {value}%
      </span>
    </div>
  );
}

function StepBadge({
  n,
  label,
  desc,
}: {
  n: string;
  label: string;
  desc: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="bg-background border-border text-primary mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border font-mono text-[10px] font-bold">
        {n}
      </div>
      <div>
        <p className="text-foreground text-sm font-semibold">{label}</p>
        <p className="text-muted-foreground mt-0.5 text-xs">{desc}</p>
      </div>
    </div>
  );
}

function RegionsLog({ regions }: { regions: Region[] }) {
  return (
    <div className="bg-card border-border overflow-hidden rounded-2xl border">
      <div className="border-border flex items-center justify-between border-b px-6 py-4">
        <p className="text-foreground font-semibold">Detected Regions Log</p>
        <Button variant="ghost" size="sm" className="text-primary h-7 text-xs">
          View Full Report →
        </Button>
      </div>
      <div className="border-muted/30 grid grid-cols-[1fr_1fr_1.2fr_auto] gap-4 border-b px-6 py-2.5">
        {["REGION ID", "SIMILARITY TYPE", "CONFIDENCE", "STATUS"].map((h) => (
          <p
            key={h}
            className="text-muted-foreground text-[10px] font-bold tracking-widest"
          >
            {h}
          </p>
        ))}
      </div>
      {regions.map((region, i) => (
        <div
          key={region.id}
          className={`hover:bg-muted/30 grid grid-cols-[1fr_1fr_1.2fr_auto] items-center gap-4 px-6 py-4 transition-colors ${i < regions.length - 1 ? "border-border/50 border-b" : ""}`}
        >
          <p className="text-foreground font-mono text-sm font-medium">
            {region.id}
          </p>
          <p className="text-muted-foreground text-sm">{region.type}</p>
          <ConfidenceBar value={region.confidence} color={region.color} />
          <Badge
            variant="outline"
            className="text-[11px] whitespace-nowrap"
            style={{
              color: region.color,
              borderColor: `${region.color}40`,
              background: `${region.color}12`,
            }}
          >
            {region.status}
          </Badge>
        </div>
      ))}
    </div>
  );
}

function ScoreCard({
  value,
  label,
  description,
  onReport,
}: {
  value: number;
  label: string;
  description: string;
  onReport?: () => void;
}) {
  return (
    <div className="bg-card border-border flex w-44 flex-col items-center gap-4 rounded-2xl border p-5">
      <CircleProgress value={value} />
      <div className="bg-destructive/10 border-destructive/25 w-full rounded-lg border px-3 py-2 text-center">
        <p className="text-destructive text-xs font-bold">{label}</p>
      </div>
      <p className="text-muted-foreground text-center text-[11px] leading-relaxed">
        {description}
      </p>
      <div className="w-full space-y-2">
        <p className="text-muted-foreground text-[10px] font-bold tracking-widest">
          HASH COLLISION MAP
        </p>
        <HashCollisionMap />
      </div>
      <Button
        variant="destructive"
        size="sm"
        className="w-full gap-1.5 text-xs"
        onClick={onReport}
      >
        <AlertTriangle size={12} /> Report Plagiarism
      </Button>
    </div>
  );
}

// ─── Upload Zone ──────────────────────────────────────────────────────────────

interface UploadZoneProps {
  onUpload: (file: File) => void;
  label?: string;
  preview?: string | null;
  onClear?: () => void;
  compact?: boolean;
}

function UploadZone({
  onUpload,
  label = "Drop artwork to verify",
  preview,
  onClear,
  compact,
}: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file?.type.startsWith("image/")) onUpload(file);
    },
    [onUpload],
  );

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
    e.target.value = "";
  };

  if (preview) {
    return (
      <div className="border-border group relative overflow-hidden rounded-xl border">
        <Image
          src={preview}
          alt="Uploaded artwork"
          width={480}
          height={compact ? 180 : 240}
          className={`w-full object-cover ${compact ? "h-44" : "h-56"}`}
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-200 group-hover:bg-black/30">
          <div className="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              onClick={() => inputRef.current?.click()}
              className="bg-background/90 text-foreground border-border hover:bg-background rounded-lg border px-3 py-1.5 text-xs font-medium backdrop-blur transition-colors"
            >
              Replace
            </button>
            {onClear && (
              <button
                onClick={onClear}
                className="bg-destructive/90 hover:bg-destructive flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-white backdrop-blur transition-colors"
              >
                <X size={11} /> Remove
              </button>
            )}
          </div>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="hidden"
        />
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed transition-all duration-200 ${compact ? "px-6 py-10" : "px-8 py-16"} ${dragging ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/50 hover:bg-primary/[0.02]"}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />
      <div
        className={`${compact ? "h-12 w-12" : "h-16 w-16"} bg-background border-border shadow-primary/10 flex items-center justify-center rounded-2xl border shadow-lg`}
      >
        <ImageUp size={compact ? 20 : 28} className="text-primary" />
      </div>
      <div className="text-center">
        <p
          className={`${compact ? "text-base" : "text-lg"} text-foreground font-semibold`}
        >
          {label}
        </p>
        <p className="text-muted-foreground mt-1 text-xs">
          Drag & drop or click to browse
        </p>
      </div>
      <Button
        variant="default"
        size={compact ? "sm" : "lg"}
        className="pointer-events-none rounded-lg"
      >
        <CloudUpload size={compact ? 14 : 18} /> Upload Image
      </Button>
      <p className="text-muted-foreground text-xs">JPG, PNG, WEBP · Max 50MB</p>
    </div>
  );
}

// ─── Mode Toggle ──────────────────────────────────────────────────────────────

function ModeToggle({
  mode,
  onChange,
}: {
  mode: Mode;
  onChange: (m: Mode) => void;
}) {
  return (
    <div className="bg-muted flex items-center gap-1 rounded-xl p-1">
      {(
        [
          { key: "web", icon: Globe, label: "Search Web" },
          { key: "compare", icon: Images, label: "Compare Two Images" },
        ] as const
      ).map(({ key, icon: Icon, label }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
            mode === key
              ? "bg-background text-foreground border-border border shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Icon size={14} />
          {label}
        </button>
      ))}
    </div>
  );
}

// ─── Analyzing Screen ─────────────────────────────────────────────────────────

function AnalyzingScreen({ progress, mode }: { progress: number; mode: Mode }) {
  const steps =
    mode === "web"
      ? [
          "Extracting features",
          "Web crawling",
          "Hash comparison",
          "Building report",
        ]
      : [
          "Extracting features",
          "Hash comparison",
          "Region mapping",
          "Building report",
        ];

  return (
    <div className="bg-card border-border flex flex-col items-center gap-6 rounded-2xl border p-16 text-center">
      <div className="bg-primary shadow-primary/30 flex h-20 w-20 animate-pulse items-center justify-center rounded-full shadow-2xl">
        {mode === "web" ? (
          <Globe size={34} className="text-primary-foreground" />
        ) : (
          <ArrowLeftRight size={34} className="text-primary-foreground" />
        )}
      </div>
      <div>
        <h2 className="text-foreground text-xl font-bold">
          {mode === "web" ? "Searching the Web" : "Comparing Images"}
        </h2>
        <p className="text-muted-foreground mt-1.5 text-sm">
          {mode === "web"
            ? "Cross-referencing against millions of records online…"
            : "Running perceptual hash comparison between both images…"}
        </p>
      </div>
      <div className="w-full max-w-sm space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">pHash fingerprinting</span>
          <span className="text-primary font-mono">{progress}%</span>
        </div>
        <div className="bg-muted h-1.5 overflow-hidden rounded-full">
          <div
            className="bg-primary shadow-primary/50 h-full rounded-full shadow-sm transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {steps.map((step, i) => (
          <Badge
            key={step}
            variant={progress > i * 25 ? "default" : "outline"}
            className="text-[11px] transition-all duration-300"
          >
            {step}
          </Badge>
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PlagiarismCheckerPage() {
  const [mode, setMode] = useState<Mode>("web");
  const [stage, setStage] = useState<Stage>("upload");
  const [progress, setProgress] = useState(0);

  const [webPreview, setWebPreview] = useState<string | null>(null);
  const [comparePreviewA, setComparePreviewA] = useState<string | null>(null);
  const [comparePreviewB, setComparePreviewB] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (webPreview) URL.revokeObjectURL(webPreview);
      if (comparePreviewA) URL.revokeObjectURL(comparePreviewA);
      if (comparePreviewB) URL.revokeObjectURL(comparePreviewB);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const runAnalysis = () => {
    setStage("analyzing");
    setProgress(0);
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 12 + 4;
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
        setTimeout(() => setStage("result"), 400);
      }
      setProgress(Math.min(Math.floor(p), 100));
    }, 180);
  };

  const handleWebUpload = (file: File) => {
    if (webPreview) URL.revokeObjectURL(webPreview);
    setWebPreview(URL.createObjectURL(file));
    runAnalysis();
  };

  const handleCompareUploadA = (file: File) => {
    if (comparePreviewA) URL.revokeObjectURL(comparePreviewA);
    setComparePreviewA(URL.createObjectURL(file));
  };

  const handleCompareUploadB = (file: File) => {
    if (comparePreviewB) URL.revokeObjectURL(comparePreviewB);
    setComparePreviewB(URL.createObjectURL(file));
  };

  const handleReset = () => {
    setStage("upload");
    setProgress(0);
    if (webPreview) {
      URL.revokeObjectURL(webPreview);
      setWebPreview(null);
    }
    if (comparePreviewA) {
      URL.revokeObjectURL(comparePreviewA);
      setComparePreviewA(null);
    }
    if (comparePreviewB) {
      URL.revokeObjectURL(comparePreviewB);
      setComparePreviewB(null);
    }
  };

  const handleModeChange = (m: Mode) => {
    handleReset();
    setMode(m);
  };

  const canCompare = !!comparePreviewA && !!comparePreviewB;

  return (
    <main className="bg-background min-h-screen">
      {/* ── Header ── */}
      <div className="border-border bg-background/95 sticky top-0 z-10 border-b backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <span className="text-muted-foreground text-xs">Dashboard</span>
              <span className="text-muted-foreground/40 text-xs">›</span>
              <span className="text-primary text-xs font-medium">
                Plagiarism Analysis
              </span>
            </div>
            <h1 className="text-foreground text-2xl font-bold tracking-tight">
              Plagiarism Detection Analysis
            </h1>
            <p className="text-muted-foreground mt-0.5 text-sm">
              Perceptual hash comparison using pHash algorithm v4.2
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="gap-1.5"
            >
              <RotateCcw size={13} /> New Analysis
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Download size={13} /> Export PDF
            </Button>
            {stage === "result" && (
              <Button variant="destructive" size="sm" className="gap-1.5">
                <AlertTriangle size={13} /> Flag for Review
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl space-y-6 px-6 py-8">
        {/* ── Mode Toggle ── */}
        <div className="flex items-center justify-between">
          <ModeToggle mode={mode} onChange={handleModeChange} />
          <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
            {mode === "web" ? (
              <>
                <Globe size={12} /> Scans millions of web records
              </>
            ) : (
              <>
                <ArrowLeftRight size={12} /> Direct image-to-image comparison
              </>
            )}
          </p>
        </div>

        {/* ══════════════════════════════════════════════
            SEARCH WEB MODE
        ══════════════════════════════════════════════ */}
        {mode === "web" && (
          <>
            {stage === "upload" && (
              <>
                <div className="grid grid-cols-2 gap-5">
                  <div className="bg-card border-border space-y-5 rounded-2xl border p-6">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
                        <Globe size={17} className="text-primary-foreground" />
                      </div>
                      <div>
                        <p className="text-foreground text-sm font-semibold">
                          Artwork to Verify
                        </p>
                        <p className="text-muted-foreground text-xs">
                          Upload a single digital artwork
                        </p>
                      </div>
                    </div>
                    <UploadZone onUpload={handleWebUpload} />
                  </div>

                  <div className="space-y-4">
                    <div className="bg-card border-border space-y-4 rounded-2xl border p-6">
                      <p className="text-foreground text-sm font-semibold">
                        How it works
                      </p>
                      <div className="space-y-4">
                        <StepBadge
                          n="01"
                          label="Upload Artwork"
                          desc="Submit your digital artwork for fingerprinting"
                        />
                        <StepBadge
                          n="02"
                          label="Web Crawl"
                          desc="System searches millions of indexed pages and marketplaces"
                        />
                        <StepBadge
                          n="03"
                          label="Region Mapping"
                          desc="Suspected regions flagged with confidence scores"
                        />
                        <StepBadge
                          n="04"
                          label="Report"
                          desc="Export full analysis PDF or flag for legal review"
                        />
                      </div>
                    </div>
                    <div className="bg-primary/5 border-primary/20 flex items-start gap-3 rounded-xl border p-4">
                      <Info
                        size={16}
                        className="text-primary mt-0.5 shrink-0"
                      />
                      <p className="text-muted-foreground text-xs leading-relaxed">
                        All uploads are processed securely. Your artwork data is
                        encrypted and never stored beyond the analysis session.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-card border-border rounded-2xl border p-6">
                  <p className="text-foreground mb-10 text-sm font-semibold">
                    Analysis Results Log
                  </p>
                  <div className="flex flex-col items-center gap-3 py-8">
                    <Search size={36} className="text-muted-foreground/30" />
                    <p className="text-muted-foreground text-sm font-medium">
                      Ready to analyze
                    </p>
                    <p className="text-muted-foreground/60 text-xs">
                      Upload an artwork to start the web search process.
                    </p>
                  </div>
                </div>
              </>
            )}

            {stage === "analyzing" && (
              <AnalyzingScreen progress={progress} mode="web" />
            )}

            {stage === "result" && webPreview && (
              <>
                <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-4">
                  {/* Original */}
                  <div className="bg-card border-border overflow-hidden rounded-2xl border">
                    <div className="border-border flex items-center justify-between border-b px-5 py-3.5">
                      <div>
                        <p className="text-foreground text-sm font-semibold">
                          Original Registered Artwork
                        </p>
                        <p className="text-muted-foreground mt-0.5 font-mono text-[11px]">
                          ID: ORG-2291 · Uploaded: Oct 12, 2023
                        </p>
                      </div>
                      <Badge className="border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/10">
                        <ShieldCheck size={11} className="mr-1" /> Protected
                      </Badge>
                    </div>
                    <div className="relative">
                      <Image
                        src={webPreview}
                        alt="Original"
                        width={480}
                        height={220}
                        className="h-52 w-full object-cover"
                      />
                      <div className="absolute right-2 bottom-2 rounded-lg border border-white/10 bg-black/60 px-2.5 py-1 font-mono text-[11px] text-slate-300 backdrop-blur-sm">
                        4096 × 3112
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 p-5">
                      <div>
                        <p className="text-muted-foreground mb-1 text-[10px] font-bold tracking-widest">
                          ARTIST
                        </p>
                        <p className="text-foreground text-sm font-medium">
                          Elena Void
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1 text-[10px] font-bold tracking-widest">
                          RESOLUTION
                        </p>
                        <p className="text-foreground text-sm font-medium">
                          4096 × 3112 px
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-muted-foreground mb-1 text-[10px] font-bold tracking-widest">
                          DIGITAL SIGNATURE
                        </p>
                        <p className="text-primary font-mono text-xs">
                          0x7f83...a2b5
                        </p>
                      </div>
                    </div>
                  </div>

                  <ScoreCard
                    value={85}
                    label="High Probability"
                    description="Structural similarity index exceeds threshold of 75%"
                  />

                  {/* Suspected */}
                  <div className="bg-card border-destructive/20 overflow-hidden rounded-2xl border">
                    <div className="border-destructive/15 bg-destructive/[0.02] flex items-center justify-between border-b px-5 py-3.5">
                      <div>
                        <p className="text-foreground text-sm font-semibold">
                          Suspected Infringement
                        </p>
                        <p className="text-muted-foreground mt-0.5 text-[11px]">
                          Found: Today, 09:41 AM
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className="border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/10"
                      >
                        Unverified
                      </Badge>
                    </div>
                    <div className="relative">
                      <Image
                        src={webPreview}
                        alt="Suspected copy"
                        width={480}
                        height={220}
                        className="h-52 w-full object-cover"
                        style={{
                          filter:
                            "hue-rotate(40deg) saturate(1.3) brightness(0.9)",
                        }}
                      />
                      <div className="bg-destructive/15 border-destructive/30 text-destructive absolute top-2 right-2 flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] backdrop-blur-sm">
                        <div className="bg-destructive h-1.5 w-1.5 animate-pulse rounded-full" />
                        Highlight Overlap
                      </div>
                      <div className="absolute right-2 bottom-2 rounded-lg border border-white/10 bg-black/60 px-2.5 py-1 font-mono text-[11px] text-slate-300 backdrop-blur-sm">
                        1024 × 768
                      </div>
                    </div>
                    <div className="space-y-4 p-5">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-muted-foreground mb-1 text-[10px] font-bold tracking-widest">
                            SOURCE
                          </p>
                          <p className="text-destructive font-mono text-xs">
                            nft-marketplace-clone.com
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1 text-[10px] font-bold tracking-widest">
                            RESOLUTION
                          </p>
                          <p className="text-foreground text-xs">
                            1024 × 768 px (Downscaled)
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-2 text-[10px] font-bold tracking-widest">
                          MODIFICATIONS DETECTED
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {["Cropped", "Color Shift", "+Other"].map((m) => (
                            <Badge
                              key={m}
                              variant="outline"
                              className="border-amber-500/30 bg-amber-500/10 text-[11px] text-amber-400"
                            >
                              {m}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <RegionsLog regions={WEB_REGIONS} />
              </>
            )}
          </>
        )}

        {/* ══════════════════════════════════════════════
            COMPARE TWO IMAGES MODE
        ══════════════════════════════════════════════ */}
        {mode === "compare" && (
          <>
            {stage === "upload" && (
              <>
                <div className="grid grid-cols-2 gap-5">
                  {/* Image A */}
                  <div className="bg-card border-border space-y-4 rounded-2xl border p-6">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                        <span className="text-primary-foreground text-xs font-bold">
                          A
                        </span>
                      </div>
                      <div>
                        <p className="text-foreground text-sm font-semibold">
                          Original Artwork
                        </p>
                        <p className="text-muted-foreground text-xs">
                          The artwork you own or created
                        </p>
                      </div>
                      {comparePreviewA && (
                        <Badge className="ml-auto border-emerald-500/20 bg-emerald-500/10 text-[10px] text-emerald-400">
                          <ShieldCheck size={9} className="mr-1" /> Loaded
                        </Badge>
                      )}
                    </div>
                    <UploadZone
                      onUpload={handleCompareUploadA}
                      label="Upload Image A"
                      preview={comparePreviewA}
                      onClear={() => {
                        if (comparePreviewA) {
                          URL.revokeObjectURL(comparePreviewA);
                          setComparePreviewA(null);
                        }
                      }}
                      compact
                    />
                  </div>

                  {/* Image B */}
                  <div className="bg-card border-border space-y-4 rounded-2xl border p-6">
                    <div className="flex items-center gap-3">
                      <div className="bg-destructive/80 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                        <span className="text-xs font-bold text-white">B</span>
                      </div>
                      <div>
                        <p className="text-foreground text-sm font-semibold">
                          Suspected Copy
                        </p>
                        <p className="text-muted-foreground text-xs">
                          The image you want to compare against
                        </p>
                      </div>
                      {comparePreviewB && (
                        <Badge
                          variant="outline"
                          className="ml-auto border-amber-500/30 bg-amber-500/10 text-[10px] text-amber-400"
                        >
                          Loaded
                        </Badge>
                      )}
                    </div>
                    <UploadZone
                      onUpload={handleCompareUploadB}
                      label="Upload Image B"
                      preview={comparePreviewB}
                      onClear={() => {
                        if (comparePreviewB) {
                          URL.revokeObjectURL(comparePreviewB);
                          setComparePreviewB(null);
                        }
                      }}
                      compact
                    />
                  </div>
                </div>

                {/* Compare CTA */}
                <div className="flex items-center gap-4">
                  <Button
                    size="lg"
                    className="gap-2 px-8"
                    disabled={!canCompare}
                    onClick={runAnalysis}
                  >
                    <ArrowLeftRight size={16} /> Compare Images
                  </Button>
                  {!canCompare ? (
                    <p className="text-muted-foreground text-sm">
                      {!comparePreviewA && !comparePreviewB
                        ? "Upload both images to begin comparison"
                        : !comparePreviewA
                          ? "Upload Image A to continue"
                          : "Upload Image B to continue"}
                    </p>
                  ) : (
                    <p className="flex items-center gap-1.5 text-sm text-emerald-400">
                      <ShieldCheck size={14} /> Both images loaded — ready to
                      compare
                    </p>
                  )}
                </div>

                <div className="bg-card border-border rounded-2xl border p-6">
                  <p className="text-foreground mb-10 text-sm font-semibold">
                    Comparison Results Log
                  </p>
                  <div className="flex flex-col items-center gap-3 py-8">
                    <ArrowLeftRight
                      size={36}
                      className="text-muted-foreground/30"
                    />
                    <p className="text-muted-foreground text-sm font-medium">
                      Awaiting images
                    </p>
                    <p className="text-muted-foreground/60 text-xs">
                      Upload both images above to run a direct comparison.
                    </p>
                  </div>
                </div>
              </>
            )}

            {stage === "analyzing" && (
              <AnalyzingScreen progress={progress} mode="compare" />
            )}

            {stage === "result" && comparePreviewA && comparePreviewB && (
              <>
                <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-4">
                  {/* Image A result */}
                  <div className="bg-card border-border overflow-hidden rounded-2xl border">
                    <div className="border-border flex items-center justify-between border-b px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="bg-primary flex h-6 w-6 items-center justify-center rounded-md">
                          <span className="text-primary-foreground text-[10px] font-bold">
                            A
                          </span>
                        </div>
                        <div>
                          <p className="text-foreground text-sm font-semibold">
                            Original Artwork
                          </p>
                          <p className="text-muted-foreground mt-0.5 font-mono text-[11px]">
                            Uploaded by user
                          </p>
                        </div>
                      </div>
                      <Badge className="border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/10">
                        <ShieldCheck size={11} className="mr-1" /> Source
                      </Badge>
                    </div>
                    <div className="relative">
                      <Image
                        src={comparePreviewA}
                        alt="Image A"
                        width={480}
                        height={220}
                        className="h-52 w-full object-cover"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4 p-5">
                      <div>
                        <p className="text-muted-foreground mb-1 text-[10px] font-bold tracking-widest">
                          FILE
                        </p>
                        <p className="text-foreground text-sm font-medium">
                          image-a.jpg
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1 text-[10px] font-bold tracking-widest">
                          pHASH
                        </p>
                        <p className="text-primary font-mono text-xs">
                          a3f8...91cd
                        </p>
                      </div>
                    </div>
                  </div>

                  <ScoreCard
                    value={83}
                    label="High Similarity"
                    description="Direct hash distance of 12 bits — highly similar"
                  />

                  {/* Image B result */}
                  <div className="bg-card border-destructive/20 overflow-hidden rounded-2xl border">
                    <div className="border-destructive/15 bg-destructive/[0.02] flex items-center justify-between border-b px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="bg-destructive/80 flex h-6 w-6 items-center justify-center rounded-md">
                          <span className="text-[10px] font-bold text-white">
                            B
                          </span>
                        </div>
                        <div>
                          <p className="text-foreground text-sm font-semibold">
                            Suspected Copy
                          </p>
                          <p className="text-muted-foreground mt-0.5 text-[11px]">
                            Uploaded for comparison
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/10"
                      >
                        Unverified
                      </Badge>
                    </div>
                    <div className="relative">
                      <Image
                        src={comparePreviewB}
                        alt="Image B"
                        width={480}
                        height={220}
                        className="h-52 w-full object-cover"
                      />
                      <div className="bg-destructive/15 border-destructive/30 text-destructive absolute top-2 right-2 flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] backdrop-blur-sm">
                        <div className="bg-destructive h-1.5 w-1.5 animate-pulse rounded-full" />
                        Highlight Overlap
                      </div>
                    </div>
                    <div className="space-y-4 p-5">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-muted-foreground mb-1 text-[10px] font-bold tracking-widest">
                            FILE
                          </p>
                          <p className="text-foreground text-xs font-medium">
                            image-b.jpg
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1 text-[10px] font-bold tracking-widest">
                            pHASH
                          </p>
                          <p className="text-destructive font-mono text-xs">
                            a3f2...88c1
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-2 text-[10px] font-bold tracking-widest">
                          MODIFICATIONS DETECTED
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {["Cropped", "Color Shift", "Resized"].map((m) => (
                            <Badge
                              key={m}
                              variant="outline"
                              className="border-amber-500/30 bg-amber-500/10 text-[11px] text-amber-400"
                            >
                              {m}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <RegionsLog regions={COMPARE_REGIONS} />
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
}
