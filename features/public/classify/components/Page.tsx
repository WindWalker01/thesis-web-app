"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  BrainCircuit,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileImage,
  ImageIcon,
  Info,
  Loader2,
  RefreshCcw,
  ScanSearch,
  Sparkles,
  Trash2,
  Trophy,
  UploadCloud,
} from "lucide-react";

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
import { Separator } from "@/components/ui/separator";
import { useClassification } from "@/features/classify/hooks/useClassification";
import { CLASSIFY_ACCEPT_ATTR } from "@/features/classify/schemas/classification-schema";
import type { ClassificationLabel } from "@/features/classify/types";

/** How many results to show before the "Show more" button appears. */
const VISIBLE_LIMIT = 10;

type ConfidenceTone = "strongMatch" | "high" | "medium" | "low";

function confidenceByRank(rank: number): {
  label: string;
  tone: ConfidenceTone;
} {
  if (rank === 0) return { label: "Strong Match", tone: "strongMatch" };
  if (rank === 1) return { label: "Good Match", tone: "high" };
  if (rank === 2) return { label: "Possible Match", tone: "medium" };
  return { label: "Weak Match", tone: "low" };
}

const TONE_STYLES: Record<ConfidenceTone, { badge: string }> = {
  strongMatch: {
    badge:
      "bg-emerald-600 text-white dark:bg-emerald-500/20 dark:text-emerald-300",
  },
  high: {
    badge:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  },
  medium: {
    badge:
      "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  },
  low: {
    badge:
      "bg-slate-100 text-slate-600 dark:bg-slate-500/10 dark:text-slate-400",
  },
};

function FeatureStat({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm sm:p-4">
      <p className="text-sm tracking-[0.2em] text-slate-300 uppercase sm:text-base">
        {title}
      </p>
      <p className="mt-1 text-base font-semibold text-white sm:mt-2 sm:text-base">
        {value}
      </p>
    </div>
  );
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

  const [showAll, setShowAll] = useState(false);

  const file = watchedFile;

  const orderedResults: ClassificationLabel[] = result
    ? [...result].sort((a, b) => b.score - a.score)
    : [];

  const topPrediction = orderedResults[0] ?? null;
  const otherResults = orderedResults.slice(1);

  // Reserve one visible slot for the top pick, so the total shown
  // (top pick + others) never exceeds VISIBLE_LIMIT until expanded.
  const visibleOthers = showAll
    ? otherResults
    : otherResults.slice(0, VISIBLE_LIMIT - 1);
  const hiddenCount = otherResults.length - visibleOthers.length;

  const hasCompletedClassification = Boolean(result && result.length > 0);

  return (
    <main className="bg-background min-h-screen">
      <section className="border-b bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-16 text-white sm:pt-20">
        <div className="container mx-auto px-4 py-8 sm:py-12 md:px-6 md:py-16">
          <div className="grid gap-6 md:gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
            <div className="space-y-4">
              <Badge
                variant="secondary"
                className="w-fit gap-2 bg-white/10 text-white hover:bg-white/10"
              >
                <BrainCircuit className="h-3.5 w-3.5" />
                Art Genre Classification
              </Badge>

              <div className="space-y-3">
                <h1 className="text-2xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                  Classify an artwork in seconds
                </h1>
                <p className="max-w-2xl text-base text-slate-300 sm:text-base">
                  Upload an image and we&apos;ll tell you, in plain language,
                  what art genre it most likely belongs to.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              <FeatureStat title="Input" value="Single image upload" />
              <FeatureStat title="Output" value="Best-guess genre" />
              <FeatureStat title="Storage" value="Preview only" />
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-6 sm:py-8 md:px-6 md:py-10">
        <div className="grid gap-6 md:gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <Card className="overflow-hidden">
              <CardHeader className="bg-muted/30 border-b p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <UploadCloud className="text-primary h-5 w-5" />
                  Upload artwork image
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Supported formats: PNG, JPG, JPEG, WEBP, AVIF, GIF, BMP, TIFF,
                  and SVG. Maximum file size: 5MB.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6 p-4 sm:p-6">
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
                                "group rounded-2xl border-2 border-dashed p-4 transition-all outline-none sm:p-6",
                                hasCompletedClassification
                                  ? "border-border bg-muted/20 cursor-not-allowed opacity-80"
                                  : dragOver
                                    ? "border-primary bg-primary/5"
                                    : "border-border hover:border-primary/60 hover:bg-muted/40",
                              ].join(" ")}
                              aria-disabled={hasCompletedClassification}
                            >
                              {!file ? (
                                <div className="flex min-h-[180px] flex-col items-center justify-center gap-4 px-2 text-center sm:min-h-[280px]">
                                  <div className="bg-primary/10 flex h-14 w-14 items-center justify-center rounded-2xl sm:h-16 sm:w-16">
                                    <UploadCloud className="text-primary h-7 w-7 sm:h-8 sm:w-8" />
                                  </div>

                                  <div className="space-y-1 px-2">
                                    <p className="text-base font-semibold sm:text-base">
                                      Drag and drop an image here
                                    </p>
                                    <p className="text-muted-foreground text-sm sm:text-base">
                                      Or click to choose an artwork from your
                                      device
                                    </p>
                                  </div>

                                  <div className="flex max-w-xs flex-wrap items-center justify-center gap-1.5 sm:max-w-none">
                                    {[
                                      "PNG",
                                      "JPG",
                                      "JPEG",
                                      "WEBP",
                                      "AVIF",
                                      "GIF",
                                      "BMP",
                                      "TIFF",
                                      "SVG",
                                    ].map((type) => (
                                      <Badge
                                        key={type}
                                        variant="outline"
                                        className="px-1.5 py-0 text-[10px] sm:text-sm"
                                      >
                                        {type}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-4">
                                  <div className="bg-muted overflow-hidden rounded-xl border">
                                    {previewUrl ? (
                                      <div className="relative aspect-[4/3] min-h-[180px] w-full sm:min-h-0">
                                        <Image
                                          src={previewUrl}
                                          alt={file.name}
                                          fill
                                          unoptimized
                                          sizes="(max-width:640px) 100vw, 50vw"
                                          className="object-contain p-2"
                                        />
                                      </div>
                                    ) : (
                                      <div className="flex aspect-[4/3] items-center justify-center">
                                        <ImageIcon className="text-muted-foreground h-12 w-12 sm:h-16 sm:w-16" />
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex items-start gap-3 rounded-xl border p-3 sm:p-4">
                                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                                    <div className="min-w-0 flex-1">
                                      <p className="text-base font-medium break-all">
                                        {file.name}
                                      </p>
                                      <p className="text-muted-foreground text-sm sm:text-base">
                                        {(file.size / 1024 / 1024).toFixed(2)}{" "}
                                        MB
                                      </p>
                                    </div>
                                  </div>

                                  {hasCompletedClassification ? (
                                    <div className="border-primary/20 bg-primary/5 text-muted-foreground rounded-xl border p-3 text-sm sm:text-base">
                                      Classification is complete. Start a fresh
                                      run to upload another image.
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
                                onChange={(e) =>
                                  handleFileSelect(e.target.files?.[0])
                                }
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

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <Button
                        type="submit"
                        className="order-1 w-full sm:order-none sm:w-auto"
                        disabled={
                          !file || isPending || hasCompletedClassification
                        }
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
                          className="w-full sm:w-auto"
                          disabled={!file || isPending}
                          onClick={handleRemoveFile}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove image
                        </Button>
                      ) : (
                        <Button
                          asChild
                          type="button"
                          variant="outline"
                          className="w-full sm:w-auto"
                        >
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
              <CardHeader className="px-4 pt-4 pb-2 sm:px-6 sm:pt-6 sm:pb-3">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Sparkles className="text-accent h-5 w-5" />
                  Classification result
                </CardTitle>
                <CardDescription className="text-base">
                  Here&apos;s what we found, from most to least likely.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-5 px-4 pt-0 pb-4 sm:px-6 sm:pb-6">
                {!result ? (
                  <div className="bg-muted/30 flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed px-4 text-center sm:min-h-[320px] sm:px-6">
                    <FileImage className="text-muted-foreground mb-3 h-8 w-8 sm:h-10 sm:w-10" />
                    <p className="text-base font-medium sm:text-base">
                      No classification result yet
                    </p>
                    <p className="text-muted-foreground mt-1 max-w-sm text-sm sm:text-base">
                      Upload an image and run classification to see the
                      predicted art genre here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {topPrediction ? (
                      <div className="border-primary/20 bg-primary/5 rounded-2xl border p-4 sm:p-5">
                        <div className="text-primary flex items-center gap-2 text-sm font-semibold tracking-[0.18em] uppercase">
                          <Trophy className="h-3.5 w-3.5" />
                          Best match
                        </div>

                        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <h3 className="max-w-full text-xl font-black break-words sm:text-2xl">
                            {topPrediction.label}
                          </h3>
                          <Badge
                            className={[
                              TONE_STYLES[confidenceByRank(0).tone].badge,
                              "w-fit px-2.5 py-0.5 text-sm",
                            ].join(" ")}
                          >
                            {confidenceByRank(0).label}
                          </Badge>
                        </div>
                      </div>
                    ) : null}

                    {otherResults.length > 0 ? (
                      <>
                        <Separator />

                        <div className="space-y-4">
                          <div>
                            <h4 className="text-base font-semibold sm:text-base">
                              Other possibilities
                            </h4>
                            <p className="text-muted-foreground text-sm sm:text-base">
                              Ranked from most to least likely.
                            </p>
                          </div>

                          <div className="space-y-2.5">
                            {visibleOthers.map((item, index) => {
                              const rank = index + 1; // 0 is the top pick
                              const { label, tone } = confidenceByRank(rank);
                              return (
                                <div
                                  key={`${item.label}-${index}`}
                                  className="rounded-xl border p-3 sm:p-4"
                                >
                                  <div className="xs:flex-row xs:items-center xs:justify-between flex flex-col gap-2">
                                    <div className="flex min-w-0 items-center gap-2">
                                      <div className="bg-muted flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold sm:h-7 sm:w-7 sm:text-base">
                                        {rank + 1}
                                      </div>
                                      <p className="text-base font-semibold break-words">
                                        {item.label}
                                      </p>
                                    </div>

                                    <Badge
                                      className={[
                                        TONE_STYLES[tone].badge,
                                        "flex-shrink-0 text-[11px] sm:text-sm",
                                      ].join(" ")}
                                    >
                                      {label}
                                    </Badge>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {hiddenCount > 0 || showAll ? (
                            <div className="flex justify-center">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-sm sm:text-base"
                                onClick={() => setShowAll((prev) => !prev)}
                              >
                                {showAll ? (
                                  <>
                                    <ChevronUp className="mr-2 h-4 w-4" />
                                    Show less
                                  </>
                                ) : (
                                  <>
                                    <ChevronDown className="mr-2 h-4 w-4" />
                                    Show {hiddenCount} more genre
                                    {hiddenCount === 1 ? "" : "s"}
                                  </>
                                )}
                              </Button>
                            </div>
                          ) : null}
                        </div>
                      </>
                    ) : null}

                    <div className="flex justify-stretch sm:justify-end">
                      <Button
                        asChild
                        type="button"
                        variant="outline"
                        className="w-full sm:w-auto"
                      >
                        <a href="/classify">
                          <RefreshCcw className="mr-2 h-4 w-4" />
                          Classify another photo
                        </a>
                      </Button>
                    </div>

                    {serverMessage ? (
                      <p className="text-muted-foreground text-sm sm:text-base">
                        {serverMessage}
                      </p>
                    ) : null}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
