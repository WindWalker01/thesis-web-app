"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  CloudUpload,
  Database,
  ExternalLink,
  FileImage,
  Globe,
  ImageIcon,
  Loader2,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";

import NavBar from "@/components/blocks/navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ACCEPT_ATTR } from "@/features/(user)/upload-artwork/schemas/artwork-schema";
import { useUploadArtworkForm } from "@/features/(user)/upload-artwork/hooks/use-upload-artwork-form";
import { useArtworkFilePreview } from "@/features/(user)/upload-artwork/hooks/use-artwork-file-preview";
import { StatusProgress } from "@/features/(user)/upload-artwork/components/status-progress";
import { UploadArtworkProgress } from "@/features/(user)/upload-artwork/components/upload-artwork-progress";
import { ConfirmUploadModal } from "./confirm-upload-modal";

export default function UploadArtworkPage() {
  const {
    form,
    inputRef,
    dragOver,
    setDragOver,
    isSubmitting,
    watchedFile,
    watchedDescription,
    completion,
    processingState,
    processingMessage,
    steps,
    similarityReport,
    resetProgressState,
    handleFileSelect,
    handleDrop,
    handleRemoveFile,
    openConfirmation,
    closeConfirmation,
    confirmUpload,
    pendingValues,
    confirmOpen,
  } = useUploadArtworkForm();

  const previewUrl = useArtworkFilePreview(watchedFile);
  const file = watchedFile;
  const showProgressView =
    processingState === "processing" ||
    processingState === "success" ||
    processingState === "error";

  const similarityValue =
    typeof similarityReport?.similarityPercentage === "number"
      ? `${similarityReport.similarityPercentage.toFixed(2)}%`
      : "N/A";

  const matchTypeLabel =
    similarityReport?.type === "database"
      ? "Database match"
      : similarityReport?.type === "internet"
        ? "Web match"
        : "Detected match";

  const matchPreviewUrl = similarityReport?.previewImageUrl ?? null;

  console.log("SIMILARITY REPORT UI DEBUG", similarityReport);
  console.log("MATCH PREVIEW URL UI DEBUG", matchPreviewUrl);

  return (
    <main className="bg-background min-h-screen">
      <NavBar />

      <section className="border-b bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-20 text-white">
        <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
          <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
            <div className="space-y-4">
              <Badge
                variant="secondary"
                className="w-fit gap-2 bg-white/10 text-white hover:bg-white/10"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                Artwork Registration
              </Badge>

              <div className="space-y-3">
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                  Upload and protect your artwork
                </h1>
                <p className="max-w-2xl text-sm text-slate-300 sm:text-base">
                  Submit your original artwork for uniqueness checking, genre
                  classification, secure storage, and blockchain-backed
                  registration.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              <StatCard title="Duplicate Check" value="pHash + Threshold" />
              <StatCard title="Integrity" value="Crypto Hash" />
              <StatCard title="Ledger" value="DB + Blockchain" />
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
              <CardHeader className="bg-muted/30 border-b">
                <CardTitle className="flex items-center gap-2">
                  <CloudUpload className="text-primary h-5 w-5" />
                  Artwork file
                </CardTitle>
                <CardDescription>
                  Upload the source artwork you want to register.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6 p-6">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => !showProgressView && inputRef.current?.click()}
                  onDrop={showProgressView ? undefined : handleDrop}
                  onDragOver={(e) => {
                    if (showProgressView) return;
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onKeyDown={(e) => {
                    if (showProgressView) return;
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      inputRef.current?.click();
                    }
                  }}
                  className={[
                    "group rounded-xl border-2 border-dashed p-6 transition-all",
                    showProgressView
                      ? "cursor-default"
                      : "cursor-pointer outline-none",
                    dragOver
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/60 hover:bg-muted/40",
                  ].join(" ")}
                >
                  {!file ? (
                    <div className="flex min-h-[280px] flex-col items-center justify-center gap-4 text-center">
                      <div className="bg-primary/10 flex h-16 w-16 items-center justify-center rounded-2xl">
                        <CloudUpload className="text-primary h-8 w-8" />
                      </div>

                      <div className="space-y-1">
                        <p className="text-base font-semibold">
                          Drag and drop your artwork here
                        </p>
                        <p className="text-muted-foreground text-sm">
                          Or click to browse from your device
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center justify-center gap-2">
                        {["PNG", "JPG"].map((format) => (
                          <Badge key={format} variant="outline">
                            {format}
                          </Badge>
                        ))}
                      </div>

                      <p className="text-muted-foreground text-xs">
                        Maximum file size: 5MB
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-muted overflow-hidden rounded-lg border">
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
                            <ImageIcon className="text-muted-foreground h-16 w-16" />
                          </div>
                        )}
                      </div>

                      <div className="flex items-start gap-3 rounded-lg border p-4">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-600" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {file.name}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>

                        {!showProgressView && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveFile();
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  <input
                    ref={inputRef}
                    type="file"
                    accept={ACCEPT_ATTR}
                    className="hidden"
                    onChange={(e) => handleFileSelect(e.target.files?.[0])}
                    disabled={showProgressView}
                  />
                </div>

                {form.formState.errors.file && (
                  <p className="text-destructive text-sm font-medium">
                    {form.formState.errors.file.message}
                  </p>
                )}

                <Alert>
                  <FileImage className="h-4 w-4" />
                  <AlertTitle>Supported formats</AlertTitle>
                  <AlertDescription>
                    PNG, JPG are accepted. Use the highest quality source file
                    available for better similarity detection.
                  </AlertDescription>
                </Alert>

                <Alert className="border-amber-500/30 bg-amber-500/5 text-amber-950 dark:text-amber-100">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Legal notice</AlertTitle>
                  <AlertDescription>
                    By continuing, you confirm that this is your original work
                    or that you are authorized to register it. See our{" "}
                    <Link
                      href="/terms-of-use"
                      className="font-medium underline underline-offset-4"
                    >
                      Terms of Use
                    </Link>
                    .
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
          >
            {!showProgressView ? (
              <Card>
                <CardHeader className="bg-muted/30 border-b">
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="text-primary h-5 w-5" />
                    Registration details
                  </CardTitle>
                  <CardDescription>
                    Only the required user-provided fields are collected here.
                    Hashes, duplicate checks, classification, storage, and
                    blockchain recording happen in your backend flow.
                  </CardDescription>
                </CardHeader>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(openConfirmation)}>
                    <CardContent className="space-y-6 p-6">
                      {form.formState.errors.root?.message && (
                        <Alert variant="destructive">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertTitle>Registration failed</AlertTitle>
                          <AlertDescription>
                            {form.formState.errors.root.message}
                          </AlertDescription>
                        </Alert>
                      )}

                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Artwork title</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g. Starry Night Reimagined"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description (optional)</FormLabel>
                            <FormControl>
                              <Textarea
                                rows={7}
                                placeholder="Describe the artwork, concept, inspiration, medium, or context."
                                {...field}
                              />
                            </FormControl>
                            <div className="flex items-center justify-end">
                              <span className="text-muted-foreground text-xs">
                                {watchedDescription.length}/1000
                              </span>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="rightsConfirmed"
                        render={({ field }) => (
                          <FormItem className="rounded-lg border p-4">
                            <div className="flex items-start gap-3">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={(checked) =>
                                    field.onChange(Boolean(checked))
                                  }
                                />
                              </FormControl>
                              <div className="space-y-1">
                                <FormLabel className="text-sm leading-none">
                                  I confirm that I own this artwork or I am
                                  authorized to register it.
                                </FormLabel>
                                <FormDescription>
                                  This is not necessarily stored in the table,
                                  but it is important for the submission flow.
                                </FormDescription>
                              </div>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <StatusProgress
                        value={completion}
                        label="Form completion"
                        className="max-w-full"
                      />
                    </CardContent>

                    <CardFooter className="bg-muted/20 flex flex-col gap-3 border-t p-6 sm:flex-row">
                      <Button
                        type="button"
                        variant="outline"
                        asChild
                        className="w-full sm:w-auto"
                      >
                        <Link href="/">Cancel</Link>
                      </Button>

                      <Button
                        type="submit"
                        className="w-full sm:flex-1"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Starting registration...
                          </>
                        ) : (
                          <>
                            <CloudUpload className="mr-2 h-4 w-4" />
                            Publish & Protect
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </form>
                </Form>
              </Card>
            ) : (
              <div className="space-y-4">
                <UploadArtworkProgress
                  steps={steps}
                  currentMessage={processingMessage}
                />

                {(processingState === "success" || processingState === "error") &&
                  similarityReport ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                        Similarity report
                      </CardTitle>
                      <CardDescription>
                        This shows the strongest detected match from either your
                        internal artwork database or an online source.
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="grid gap-3 sm:grid-cols-3">
                        <div className="rounded-lg border p-3">
                          <p className="text-muted-foreground text-xs">
                            Similarity
                          </p>
                          <p className="text-lg font-semibold">
                            {similarityValue}
                          </p>
                        </div>

                        <div className="rounded-lg border p-3">
                          <p className="text-muted-foreground text-xs">
                            Match type
                          </p>
                          <div className="mt-1 flex items-center gap-2">
                            {similarityReport.type === "database" ? (
                              <Database className="h-4 w-4" />
                            ) : (
                              <Globe className="h-4 w-4" />
                            )}
                            <p className="text-lg font-semibold">
                              {matchTypeLabel}
                            </p>
                          </div>
                        </div>

                        <div className="rounded-lg border p-3">
                          <p className="text-muted-foreground text-xs">Source</p>
                          <p className="text-lg font-semibold">
                            {similarityReport.source ?? "Unknown"}
                          </p>
                        </div>
                      </div>

                      {matchPreviewUrl ? (
                        <div className="overflow-hidden rounded-xl border">
                          <div className="relative aspect-[4/3] w-full bg-muted">
                            <Image
                              src={matchPreviewUrl}
                              alt="Matched artwork preview"
                              fill
                              unoptimized
                              className="object-contain"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
                          No matched preview image is available for this result.
                        </div>
                      )}

                      {similarityReport.type === "internet" ? (
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="space-y-2 rounded-lg border p-4">
                            <p className="text-muted-foreground text-xs">
                              Reference link
                            </p>
                            {similarityReport.link ? (
                              <Link
                                href={similarityReport.link}
                                target="_blank"
                                rel="noreferrer"
                                className="text-primary inline-flex items-center gap-1 break-all text-sm underline underline-offset-4"
                              >
                                {similarityReport.link}
                                <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                              </Link>
                            ) : (
                              <p className="text-sm">No link available.</p>
                            )}
                          </div>

                          <div className="space-y-2 rounded-lg border p-4">
                            <p className="text-muted-foreground text-xs">
                              Image reference
                            </p>
                            {similarityReport.url ? (
                              <Link
                                href={similarityReport.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-primary inline-flex items-center gap-1 break-all text-sm underline underline-offset-4"
                              >
                                {similarityReport.url}
                                <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                              </Link>
                            ) : (
                              <p className="text-sm">No image URL available.</p>
                            )}
                          </div>
                        </div>
                      ) : <></>}
                    </CardContent>
                  </Card>
                ) : null}

                {(processingState === "success" ||
                  processingState === "error") && (
                    <Card>
                      <CardContent className="flex flex-col gap-3 p-6 sm:flex-row">
                        {processingState === "success" ? (
                          <Button asChild className="w-full sm:w-auto">
                            <Link href="/dashboard">Go to dashboard</Link>
                          </Button>
                        ) : null}

                        <Button
                          type="button"
                          variant="outline"
                          className="w-full sm:w-auto"
                          onClick={resetProgressState}
                        >
                          Register another artwork
                        </Button>
                      </CardContent>
                    </Card>
                  )}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      <ConfirmUploadModal
        open={confirmOpen}
        onOpenChange={(open) => {
          if (!open) closeConfirmation();
        }}
        values={pendingValues}
        previewUrl={previewUrl}
        isSubmitting={isSubmitting}
        onConfirm={confirmUpload}
      />
    </main>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
      <p className="text-xs tracking-wide text-slate-400 uppercase">{title}</p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}