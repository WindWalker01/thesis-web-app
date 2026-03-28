"use client";

import * as React from "react";
import Link from "next/link";
import { LockKeyhole, ShieldAlert, Upload, ExternalLink, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import {
    RadioGroup,
    RadioGroupItem,
} from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

type IssueType =
    | "plagiarism"
    | "repost"
    | "tracing"
    | "commercial_use"
    | "counterfeit"
    | "ownership_dispute";

const STEPS = ["Details", "Evidence", "Review"] as const;

export default function ReportInfringementPageShadcn() {
    const [step, setStep] = React.useState<(typeof STEPS)[number]>("Details");

    // --- form state (simple state for now) ---
    const [reportKind, setReportKind] = React.useState<"copied" | "dispute">("copied");
    const [originalTitle, setOriginalTitle] = React.useState("");
    const [originalUrl, setOriginalUrl] = React.useState("");
    const [infringingUrl, setInfringingUrl] = React.useState("");
    const [platform, setPlatform] = React.useState<string>("");
    const [issueType, setIssueType] = React.useState<IssueType>("plagiarism");
    const [notes, setNotes] = React.useState("");

    const [evidenceLinks, setEvidenceLinks] = React.useState<string>("");
    const [hashScan, setHashScan] = React.useState<"idle" | "scanning" | "done">("idle");
    const [similarity, setSimilarity] = React.useState<number>(0);

    const [attest, setAttest] = React.useState(false);
    const [understand, setUnderstand] = React.useState(false);

    const stepIndex = STEPS.indexOf(step);
    const progress = Math.round(((stepIndex + 1) / STEPS.length) * 100);

    function next() {
        if (stepIndex < STEPS.length - 1) setStep(STEPS[stepIndex + 1]);
    }
    function back() {
        if (stepIndex > 0) setStep(STEPS[stepIndex - 1]);
    }

    async function runHashScan() {
        setHashScan("scanning");
        setSimilarity(0);

        // demo: simulate scanning
        await new Promise((r) => setTimeout(r, 700));
        setSimilarity(42);

        await new Promise((r) => setTimeout(r, 700));
        setSimilarity(76);

        await new Promise((r) => setTimeout(r, 600));
        setSimilarity(88);
        setHashScan("done");
    }

    const canSubmit = attest && understand;
    const canGoNextDetails =
        originalTitle.trim().length > 0 &&
        (originalUrl.trim().length > 0) &&
        (infringingUrl.trim().length > 0) &&
        platform.trim().length > 0;

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Page container */}
            <div className="mx-auto w-full max-w-6xl px-4 md:px-10 pb-8 relative pt-24">
                {/* Header */}
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between mb-6">
                    <div className="space-y-1">
                        <h1 className="text-2xl md:text-3xl font-bold">Report Infringement</h1>
                        <p className="text-sm md:text-base text-muted-foreground">
                            Submit a formal complaint. Reports can be saved as draft and are timestamped for integrity.
                        </p>
                    </div>

                    <div className="inline-flex items-center gap-2 rounded-full border px-4 py-2 bg-muted">
                        <LockKeyhole className="h-4 w-4" />
                        <span className="text-sm font-medium">Secure submission</span>
                    </div>
                </div>

                {/* Main split */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Left (75%) */}
                    <div className="lg:col-span-3 space-y-4">
                        {/* Step header */}
                        <Card>
                            <CardHeader className="space-y-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            {step === "Details" && <>Details</>}
                                            {step === "Evidence" && <>Evidence</>}
                                            {step === "Review" && <>Review</>}
                                            <Badge variant="secondary">{stepIndex + 1}/{STEPS.length}</Badge>
                                        </CardTitle>
                                        <CardDescription>
                                            {step === "Details" && "Tell us what happened and where it occurred."}
                                            {step === "Evidence" && "Upload or link proof. Run similarity scan if available."}
                                            {step === "Review" && "Confirm and submit your report for review and tracking."}
                                        </CardDescription>
                                    </div>

                                    <div className="w-40">
                                        <Progress value={progress} />
                                        <p className="mt-1 text-xs text-muted-foreground text-right">{progress}%</p>
                                    </div>
                                </div>

                                <Separator />

                                {/* Stepper pills */}
                                <div className="flex flex-wrap gap-2">
                                    {STEPS.map((s) => {
                                        const active = s === step;
                                        const done = STEPS.indexOf(s) < stepIndex;
                                        return (
                                            <Button
                                                key={s}
                                                type="button"
                                                variant={active ? "default" : "secondary"}
                                                className="rounded-full"
                                                onClick={() => setStep(s)}
                                            >
                                                {done ? <CheckCircle2 className="mr-2 h-4 w-4" /> : null}
                                                {s}
                                            </Button>
                                        );
                                    })}
                                </div>
                            </CardHeader>
                        </Card>

                        {/* Step content */}
                        {step === "Details" && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Report details</CardTitle>
                                    <CardDescription>Start with the basic facts. You can refine later.</CardDescription>
                                </CardHeader>

                                <CardContent className="space-y-6">
                                    {/* Report kind */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">What are you reporting?</Label>
                                        <RadioGroup
                                            value={reportKind}
                                            onValueChange={(v) => setReportKind(v as any)}
                                            className="grid grid-cols-1 md:grid-cols-2 gap-3"
                                        >
                                            <label className="flex items-start gap-3 rounded-lg border p-3 cursor-pointer">
                                                <RadioGroupItem value="copied" className="mt-1" />
                                                <div>
                                                    <p className="font-medium">My artwork was copied</p>
                                                    <p className="text-sm text-muted-foreground">Plagiarism, reposting, tracing, unauthorized use.</p>
                                                </div>
                                            </label>

                                            <label className="flex items-start gap-3 rounded-lg border p-3 cursor-pointer">
                                                <RadioGroupItem value="dispute" className="mt-1" />
                                                <div>
                                                    <p className="font-medium">Ownership dispute</p>
                                                    <p className="text-sm text-muted-foreground">Someone claims my work, or I need to contest a claim.</p>
                                                </div>
                                            </label>
                                        </RadioGroup>
                                    </div>

                                    <Separator />

                                    {/* Original artwork */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Original artwork title</Label>
                                            <Input
                                                value={originalTitle}
                                                onChange={(e) => setOriginalTitle(e.target.value)}
                                                placeholder="e.g., “Moonlit Alley”"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Link to original artwork</Label>
                                            <Input
                                                value={originalUrl}
                                                onChange={(e) => setOriginalUrl(e.target.value)}
                                                placeholder="https://..."
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Tip: use your portfolio link or the post URL where you first published it.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Infringing source */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Infringing URL</Label>
                                            <Input
                                                value={infringingUrl}
                                                onChange={(e) => setInfringingUrl(e.target.value)}
                                                placeholder="https://..."
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Platform</Label>
                                            <Select value={platform} onValueChange={setPlatform}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select platform" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="facebook">Facebook</SelectItem>
                                                    <SelectItem value="instagram">Instagram</SelectItem>
                                                    <SelectItem value="tiktok">TikTok</SelectItem>
                                                    <SelectItem value="x">X (Twitter)</SelectItem>
                                                    <SelectItem value="artstation">ArtStation</SelectItem>
                                                    <SelectItem value="deviantart">DeviantArt</SelectItem>
                                                    <SelectItem value="other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Issue type + notes */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Type of issue</Label>
                                            <Select
                                                value={issueType}
                                                onValueChange={(v) => setIssueType(v as IssueType)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select issue type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="plagiarism">Plagiarism / Copy</SelectItem>
                                                    <SelectItem value="repost">Repost without credit</SelectItem>
                                                    <SelectItem value="tracing">Tracing</SelectItem>
                                                    <SelectItem value="commercial_use">Unauthorized commercial use</SelectItem>
                                                    <SelectItem value="counterfeit">Counterfeit / impersonation</SelectItem>
                                                    <SelectItem value="ownership_dispute">Ownership dispute</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Notes (optional)</Label>
                                            <Textarea
                                                value={notes}
                                                onChange={(e) => setNotes(e.target.value)}
                                                placeholder="Add any context that helps reviewers understand the case."
                                                className="min-h-24"
                                            />
                                        </div>
                                    </div>

                                    <div className="rounded-lg border p-3 bg-muted/50 flex items-start gap-3">
                                        <ShieldAlert className="h-5 w-5 mt-0.5" />
                                        <div className="text-sm">
                                            <p className="font-medium">Reminder</p>
                                            <p className="text-muted-foreground">
                                                This platform helps document and verify. It does not replace formal legal procedures.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>

                                <CardFooter className="flex items-center justify-between">
                                    <div />
                                    <Button onClick={next} disabled={!canGoNextDetails}>
                                        Continue to Evidence
                                    </Button>
                                </CardFooter>
                            </Card>
                        )}

                        {step === "Evidence" && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Evidence</CardTitle>
                                    <CardDescription>Add proof and optionally run a similarity scan.</CardDescription>
                                </CardHeader>

                                <CardContent className="space-y-6">
                                    {/* Upload area (placeholder) */}
                                    <div className="rounded-xl border border-dashed p-6 flex flex-col items-center justify-center text-center gap-2">
                                        <Upload className="h-6 w-6" />
                                        <p className="font-medium">Upload screenshots / proof</p>
                                        <p className="text-sm text-muted-foreground">
                                            (Demo UI) Integrate Cloudinary/Supabase storage here.
                                        </p>
                                        <Button variant="secondary" type="button">Choose files</Button>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Evidence links (optional)</Label>
                                        <Textarea
                                            value={evidenceLinks}
                                            onChange={(e) => setEvidenceLinks(e.target.value)}
                                            placeholder={"Paste links (one per line)\nhttps://...\nhttps://..."}
                                            className="min-h-28"
                                        />
                                    </div>

                                    <Separator />

                                    {/* Similarity scan */}
                                    <div className="rounded-xl border p-4 space-y-3">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="font-medium">Similarity scan</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Uses perceptual hashing to find visually similar works (robust to cropping/color shifts).
                                                </p>
                                            </div>

                                            <Button
                                                type="button"
                                                onClick={runHashScan}
                                                disabled={hashScan === "scanning"}
                                            >
                                                {hashScan === "scanning" ? "Scanning..." : "Run scan"}
                                            </Button>
                                        </div>

                                        <div className="space-y-1">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">Similarity score</span>
                                                <span className="font-medium">{similarity}%</span>
                                            </div>
                                            <Progress value={similarity} />
                                            <p className="text-xs text-muted-foreground">
                                                Tip: reviewers will use this as an indicator, plus your evidence and links.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>

                                <CardFooter className="flex items-center justify-between">
                                    <Button variant="secondary" onClick={back}>Back</Button>
                                    <Button onClick={next}>Continue to Review</Button>
                                </CardFooter>
                            </Card>
                        )}

                        {step === "Review" && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Review & Submit</CardTitle>
                                    <CardDescription>Check details. Submitting generates a case ID and status tracking.</CardDescription>
                                </CardHeader>

                                <CardContent className="space-y-6">
                                    {/* Summary */}
                                    <div className="rounded-xl border p-4 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <p className="font-medium">Summary</p>
                                            <Badge variant="secondary">{reportKind === "copied" ? "Copied work" : "Ownership dispute"}</Badge>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                            <div className="space-y-1">
                                                <p className="text-muted-foreground">Original</p>
                                                <p className="font-medium">{originalTitle || "—"}</p>
                                                <a className="text-blue-600 inline-flex items-center gap-1" href={originalUrl} target="_blank" rel="noreferrer">
                                                    Open link <ExternalLink className="h-3.5 w-3.5" />
                                                </a>
                                            </div>

                                            <div className="space-y-1">
                                                <p className="text-muted-foreground">Infringing source</p>
                                                <p className="font-medium">{platform || "—"}</p>
                                                <a className="text-blue-600 inline-flex items-center gap-1" href={infringingUrl} target="_blank" rel="noreferrer">
                                                    Open link <ExternalLink className="h-3.5 w-3.5" />
                                                </a>
                                            </div>

                                            <div className="space-y-1">
                                                <p className="text-muted-foreground">Issue type</p>
                                                <p className="font-medium">{issueType.replaceAll("_", " ")}</p>
                                            </div>

                                            <div className="space-y-1">
                                                <p className="text-muted-foreground">Similarity scan</p>
                                                <p className="font-medium">{similarity}%</p>
                                            </div>
                                        </div>

                                        {notes ? (
                                            <div className="pt-2 text-sm">
                                                <p className="text-muted-foreground">Notes</p>
                                                <p className="whitespace-pre-wrap">{notes}</p>
                                            </div>
                                        ) : null}
                                    </div>

                                    {/* Confirmations */}
                                    <div className="space-y-3">
                                        <label className="flex items-start gap-3">
                                            <Checkbox checked={attest} onCheckedChange={(v) => setAttest(Boolean(v))} />
                                            <span className="text-sm">
                                                I attest that the information provided is accurate to the best of my knowledge.
                                            </span>
                                        </label>

                                        <label className="flex items-start gap-3">
                                            <Checkbox checked={understand} onCheckedChange={(v) => setUnderstand(Boolean(v))} />
                                            <span className="text-sm">
                                                I understand this system provides documentation and verification support, not legal advice.
                                            </span>
                                        </label>
                                    </div>
                                </CardContent>

                                <CardFooter className="flex items-center justify-between">
                                    <Button variant="secondary" onClick={back}>Back</Button>
                                    <Button disabled={!canSubmit}>
                                        Submit report
                                    </Button>
                                </CardFooter>
                            </Card>
                        )}
                    </div>

                    {/* Right (25%) */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-6">
                            <CardHeader>
                                <CardTitle className="text-base">Recent reports</CardTitle>
                                <CardDescription className="flex items-center justify-between">
                                    Track ongoing cases
                                    <Link href="/recent-reports" className="text-blue-600 text-sm hover:underline">
                                        View all
                                    </Link>
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                <ScrollArea className="h-64 pr-3">
                                    <div className="space-y-3">
                                        {/* Demo items */}
                                        <div className="rounded-lg border p-3">
                                            <div className="flex items-center justify-between">
                                                <p className="font-medium text-sm">Case #A19F</p>
                                                <Badge variant="secondary">Under review</Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">Plagiarism · Instagram</p>
                                        </div>

                                        <div className="rounded-lg border p-3">
                                            <div className="flex items-center justify-between">
                                                <p className="font-medium text-sm">Case #B02C</p>
                                                <Badge>Submitted</Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">Repost · Facebook</p>
                                        </div>

                                        <div className="rounded-lg border p-3">
                                            <div className="flex items-center justify-between">
                                                <p className="font-medium text-sm">Case #C77D</p>
                                                <Badge variant="outline">Resolved</Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">Commercial use · Other</p>
                                        </div>
                                    </div>
                                </ScrollArea>

                                <Separator />

                                <div className="text-sm space-y-2">
                                    <p className="font-medium">Tips for strong reports</p>
                                    <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                                        <li>Include direct URLs and screenshots.</li>
                                        <li>Provide your earliest post/source link.</li>
                                        <li>Explain modifications (crop, recolor, trace).</li>
                                    </ul>
                                </div>
                            </CardContent>

                            <CardFooter>
                                <Button variant="secondary" className="w-full">
                                    Save as draft
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}