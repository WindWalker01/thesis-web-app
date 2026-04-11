"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
    BrainCircuit,
    CheckCircle2,
    FileImage,
    ImageIcon,
    Info,
    Loader2,
    RefreshCcw,
    ScanSearch,
    Sparkles,
    Trash2,
    UploadCloud,
} from "lucide-react";

import NavBar from "@/components/blocks/navbar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useClassification } from "@/features/classify/hooks/useClassification";
import { CLASSIFY_ACCEPT_ATTR } from "@/features/classify/schemas/classification-schema";
import type { ClassificationLabel } from "@/features/classify/types";

function formatRawPercent(score: number) {
    return `${(score * 100).toFixed(4)}%`;
}

function FeatureStat({
    title,
    value,
}: {
    title: string;
    value: string;
}) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-300">{title}</p>
            <p className="mt-2 text-sm font-semibold text-white">{value}</p>
        </div>
    );
}

function normalizeResults(results: ClassificationLabel[]) {
    const total = results.reduce((sum, item) => sum + item.score, 0);

    if (total <= 0) {
        return results.map((item) => ({
            ...item,
            displayPercent: 0,
        }));
    }

    return results.map((item) => ({
        ...item,
        displayPercent: (item.score / total) * 100,
    }));
}

function getMatchStrength(results: ClassificationLabel[]) {
    if (!results.length) return "No result";

    const [first, second] = results;

    if (!second || second.score <= 0) return "Strongest match";

    const ratio = first.score / second.score;

    if (ratio >= 2) return "Strongest match";
    if (ratio >= 1.2) return "Likely match";
    return "Mixed style";
}

function buildInterpretation(results: ClassificationLabel[]) {
    if (!results.length) {
        return "Upload an image to view its predicted genre profile.";
    }

    const [first, second, third] = results;
    const related = [second?.label, third?.label].filter(Boolean);

    if (related.length === 0) {
        return `The uploaded artwork is primarily identified as ${first.label}.`;
    }

    if (related.length === 1) {
        return `The uploaded artwork is primarily identified as ${first.label}, with some visual similarity to ${related[0]}.`;
    }

    return `The uploaded artwork is primarily identified as ${first.label}, with related visual traits from ${related[0]} and ${related[1]}.`;
}

export default function ClassificationPage() {
    const {
        form,
        inputRef,
        dragOver,
        setDragOver,
        isPending,
        watchedFile,
        previewUrl,
        result,
        serverMessage,
        handleFileSelect,
        handleRemoveFile,
        handleDrop,
        onSubmit,
    } = useClassification();

    const file = watchedFile;
    const normalizedResults = result ? normalizeResults(result) : [];
    const topPrediction = normalizedResults[0] ?? null;
    const topThree = normalizedResults.slice(0, 3);
    const matchStrength = getMatchStrength(result ?? []);
    const interpretation = buildInterpretation(result ?? []);
    const hasCompletedClassification = Boolean(result && result.length > 0);

    return (
        <main className="min-h-screen bg-background">
            <section className="border-b bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-20 text-white">
                <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
                    <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
                        <div className="space-y-4">
                            <Badge
                                variant="secondary"
                                className="w-fit gap-2 bg-white/10 text-white hover:bg-white/10"
                            >
                                <BrainCircuit className="h-3.5 w-3.5" />
                                Art Genre Classification
                            </Badge>

                            <div className="space-y-3">
                                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                                    Classify an artwork in seconds
                                </h1>
                                <p className="max-w-2xl text-sm text-slate-300 sm:text-base">
                                    Upload an image to get instant visual analysis and predicted results in a simple, easy-to-read format.
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                            <FeatureStat title="Input" value="Single image upload" />
                            <FeatureStat title="Output" value="Ranked genre labels" />
                            <FeatureStat title="Storage" value="Preview only" />
                        </div>
                    </div>
                </div>
            </section>

            <section className="container mx-auto px-4 py-8 md:px-6 md:py-10">
                <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35 }}
                    >
                        <Card className="overflow-hidden">
                            <CardHeader className="border-b bg-muted/30">
                                <CardTitle className="flex items-center gap-2">
                                    <UploadCloud className="h-5 w-5 text-primary" />
                                    Upload artwork image
                                </CardTitle>
                                <CardDescription>
                                    Supported formats: PNG, JPG, JPEG, Maximum file size: 5MB.
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-6 p-6">
                                <Form {...form}>
                                    <form
                                        onSubmit={form.handleSubmit(onSubmit)}
                                        className="space-y-6"
                                    >
                                        <FormField
                                            control={form.control}
                                            name="file"
                                            render={() => (
                                                <FormItem>
                                                    <FormControl>
                                                        <div
                                                            role="button"
                                                            tabIndex={0}
                                                            onClick={() => {
                                                                if (!hasCompletedClassification) {
                                                                    inputRef.current?.click();
                                                                }
                                                            }}
                                                            onDrop={(e) => {
                                                                if (hasCompletedClassification) return;
                                                                handleDrop(e);
                                                            }}
                                                            onDragOver={(e) => {
                                                                if (hasCompletedClassification) return;
                                                                e.preventDefault();
                                                                setDragOver(true);
                                                            }}
                                                            onDragLeave={() => setDragOver(false)}
                                                            onKeyDown={(e) => {
                                                                if (hasCompletedClassification) return;

                                                                if (e.key === "Enter" || e.key === " ") {
                                                                    e.preventDefault();
                                                                    inputRef.current?.click();
                                                                }
                                                            }}
                                                            className={[
                                                                "group rounded-2xl border-2 border-dashed p-6 transition-all outline-none",
                                                                hasCompletedClassification
                                                                    ? "cursor-not-allowed border-border bg-muted/20 opacity-80"
                                                                    : dragOver
                                                                        ? "border-primary bg-primary/5"
                                                                        : "border-border hover:border-primary/60 hover:bg-muted/40",
                                                            ].join(" ")}
                                                            aria-disabled={hasCompletedClassification}
                                                        >
                                                            {!file ? (
                                                                <div className="flex min-h-[280px] flex-col items-center justify-center gap-4 text-center">
                                                                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                                                                        <UploadCloud className="h-8 w-8 text-primary" />
                                                                    </div>

                                                                    <div className="space-y-1">
                                                                        <p className="text-base font-semibold">
                                                                            Drag and drop an image here
                                                                        </p>
                                                                        <p className="text-sm text-muted-foreground">
                                                                            Or click to choose an artwork from your device
                                                                        </p>
                                                                    </div>

                                                                    <div className="flex flex-wrap items-center justify-center gap-2">
                                                                        {["PNG", "JPG", "JPEG"].map((type) => (
                                                                            <Badge key={type} variant="outline">
                                                                                {type}
                                                                            </Badge>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="space-y-4">
                                                                    <div className="overflow-hidden rounded-xl border bg-muted">
                                                                        {previewUrl ? (
                                                                            <div className="relative aspect-[4/3] w-full">
                                                                                <Image
                                                                                    src={previewUrl}
                                                                                    alt={file.name}
                                                                                    fill
                                                                                    unoptimized
                                                                                    className="object-contain"
                                                                                />
                                                                            </div>
                                                                        ) : (
                                                                            <div className="flex aspect-[4/3] items-center justify-center">
                                                                                <ImageIcon className="h-16 w-16 text-muted-foreground" />
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    <div className="flex items-start gap-3 rounded-xl border p-4">
                                                                        <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-600" />
                                                                        <div className="min-w-0 flex-1">
                                                                            <p className="truncate text-sm font-medium">
                                                                                {file.name}
                                                                            </p>
                                                                            <p className="text-xs text-muted-foreground">
                                                                                {(file.size / 1024 / 1024).toFixed(2)} MB
                                                                            </p>
                                                                        </div>
                                                                    </div>

                                                                    {hasCompletedClassification ? (
                                                                        <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm text-muted-foreground">
                                                                            Classification is complete. Start a fresh run to
                                                                            upload another image.
                                                                        </div>
                                                                    ) : null}
                                                                </div>
                                                            )}

                                                            <input
                                                                ref={inputRef}
                                                                type="file"
                                                                accept={CLASSIFY_ACCEPT_ATTR}
                                                                className="hidden"
                                                                disabled={hasCompletedClassification}
                                                                onChange={(e) => handleFileSelect(e.target.files?.[0])}
                                                            />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage className="mt-3" />
                                                </FormItem>
                                            )}
                                        />

                                        {form.formState.errors.root?.message ? (
                                            <Alert variant="destructive">
                                                <Info className="h-4 w-4" />
                                                <AlertTitle>Classification failed</AlertTitle>
                                                <AlertDescription>
                                                    {form.formState.errors.root.message}
                                                </AlertDescription>
                                            </Alert>
                                        ) : null}

                                        <div className="flex flex-wrap gap-3">
                                            <Button
                                                type="submit"
                                                disabled={!file || isPending || hasCompletedClassification}
                                            >
                                                {isPending ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Classifying...
                                                    </>
                                                ) : hasCompletedClassification ? (
                                                    <>
                                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                                        Classification completed
                                                    </>
                                                ) : (
                                                    <>
                                                        <ScanSearch className="mr-2 h-4 w-4" />
                                                        Classify artwork
                                                    </>
                                                )}
                                            </Button>

                                            {!hasCompletedClassification ? (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    disabled={!file || isPending}
                                                    onClick={handleRemoveFile}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Remove image
                                                </Button>
                                            ) : (
                                                <Button asChild type="button" variant="outline">
                                                    <a href="/classify">
                                                        <RefreshCcw className="mr-2 h-4 w-4" />
                                                        Classify another photo
                                                    </a>
                                                </Button>
                                            )}
                                        </div>
                                    </form>
                                </Form>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.05 }}
                        className="space-y-6"
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-accent" />
                                    Classification result
                                </CardTitle>
                                <CardDescription>
                                    Results are shown as relative match scores to make the prediction easier to understand.
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-5">
                                {!result ? (
                                    <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed bg-muted/30 px-6 text-center">
                                        <FileImage className="mb-4 h-10 w-10 text-muted-foreground" />
                                        <p className="text-sm font-medium">
                                            No classification result yet
                                        </p>
                                        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                                            Upload an image and run classification to see the predicted
                                            art genres here.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {topPrediction ? (
                                            <div className="rounded-2xl border bg-primary/5 p-5">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                                                        Top predicted genre
                                                    </p>
                                                    <Badge variant="secondary">{matchStrength}</Badge>
                                                </div>

                                                <div className="mt-3 flex flex-wrap items-center gap-3">
                                                    <h3 className="text-2xl font-black">
                                                        {topPrediction.label}
                                                    </h3>
                                                    <Badge className="bg-primary text-primary-foreground">
                                                        {topPrediction.displayPercent.toFixed(1)}% relative match
                                                    </Badge>
                                                </div>

                                                <p className="mt-3 text-sm text-muted-foreground">
                                                    {interpretation}
                                                </p>
                                            </div>
                                        ) : null}

                                        <div className="grid gap-3 sm:grid-cols-3">
                                            {topThree.map((item, index) => (
                                                <div
                                                    key={`${item.label}-${index}`}
                                                    className="rounded-2xl border bg-card p-4"
                                                >
                                                    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                                                        {index === 0
                                                            ? "Best match"
                                                            : index === 1
                                                                ? "Second match"
                                                                : "Third match"}
                                                    </p>
                                                    <h4 className="mt-2 text-lg font-bold">
                                                        {item.label}
                                                    </h4>
                                                    <p className="mt-1 text-sm text-muted-foreground">
                                                        {item.displayPercent.toFixed(1)}% relative match
                                                    </p>
                                                    <div className="mt-3">
                                                        <Progress
                                                            value={Math.max(
                                                                0,
                                                                Math.min(item.displayPercent, 100),
                                                            )}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <Separator />

                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between gap-3">
                                                <div>
                                                    <h4 className="text-sm font-semibold">
                                                        Full ranked results
                                                    </h4>
                                                    <p className="text-xs text-muted-foreground">
                                                        Includes relative match score and raw API score.
                                                    </p>
                                                </div>

                                                <Button asChild type="button" variant="outline">
                                                    <a href="/classify">
                                                        <RefreshCcw className="mr-2 h-4 w-4" />
                                                        Classify another photo
                                                    </a>
                                                </Button>
                                            </div>

                                            <div className="space-y-3">
                                                {normalizedResults.map((item, index) => (
                                                    <div
                                                        key={`${item.label}-${index}`}
                                                        className="rounded-xl border p-4"
                                                    >
                                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                                            <div className="flex items-center gap-2">
                                                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-bold">
                                                                    {index + 1}
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-semibold">
                                                                        {item.label}
                                                                    </p>
                                                                    <p className="text-xs text-muted-foreground">
                                                                        Raw score: {formatRawPercent(item.score)}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <div className="text-right">
                                                                <p className="text-sm font-semibold">
                                                                    {item.displayPercent.toFixed(1)}%
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    relative match
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="mt-3">
                                                            <Progress
                                                                value={Math.max(
                                                                    0,
                                                                    Math.min(item.displayPercent, 100),
                                                                )}
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {serverMessage ? (
                                            <Alert>
                                                <Info className="h-4 w-4" />
                                                <AlertTitle>Run status</AlertTitle>
                                                <AlertDescription>{serverMessage}</AlertDescription>
                                            </Alert>
                                        ) : null}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="border-orange-200 bg-orange-500/5 dark:border-orange-900/60">
                            <CardHeader>
                                <CardTitle className="text-base">Temporary analysis only</CardTitle>
                                <CardDescription>
                                    This page is meant for quick genre prediction, not registration.
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-3 text-sm text-muted-foreground">
                                <p>
                                    The uploaded image is processed only to generate on-screen results for this session.
                                </p>
                                <p>
                                    No files or results from this page are kept as part of your main records or saved content.
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </section>
        </main>
    );
}