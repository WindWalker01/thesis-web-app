"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CloudUpload } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { OtherSearchMatch } from "@/features/plagiarise-checker/types";
import { useUploadArtworkForm } from "@/features/(user)/upload-artwork/hooks/use-upload-artwork-form";
import { useArtworkFilePreview } from "@/features/(user)/upload-artwork/hooks/use-artwork-file-preview";
import { DB_MATCH_DISPLAY_THRESHOLD } from "@/features/(user)/upload-artwork/lib/similarity-display";
import { UploadArtworkProgress } from "@/features/(user)/upload-artwork/components/upload-artwork-progress";
import { UploadHero } from "@/features/(user)/upload-artwork/components/upload-hero";
import { ArtworkDropzone } from "@/features/(user)/upload-artwork/components/artwork-dropzone";
import { RegistrationForm } from "@/features/(user)/upload-artwork/components/registration-form";
import { SimilarityReportDetailed } from "@/features/(user)/upload-artwork/components/similarity-report-detailed";
import { SimilarityReportSummary } from "@/features/(user)/upload-artwork/components/similarity-report-summary";
import { ConfirmUploadModal } from "./confirm-upload-modal";
import { GenreTaggingModal } from "./genre-tagging-modal";

export default function UploadArtworkPage() {
  const {
    form,
    inputRef,
    dragOver,
    setDragOver,
    isSubmitting,
    isSubmittingGenres,
    watchedFile,
    watchedTitle,
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
    genreModalOpen,
    genreSuggestions,
    handleGenreSubmit,
    otherMatchesReport,
  } = useUploadArtworkForm();

  const previewUrl = useArtworkFilePreview(watchedFile);
  const showProgressView =
    processingState === "processing" ||
    processingState === "success" ||
    processingState === "error";

  const databaseMatches: OtherSearchMatch[] =
    otherMatchesReport?.filter(
      (match) =>
        (match.source?.toLowerCase() === "database" ||
          Boolean(match.artwork_id)) &&
        match.similarity >= DB_MATCH_DISPLAY_THRESHOLD,
    ) ?? [];

  const webMatches: OtherSearchMatch[] =
    otherMatchesReport?.filter(
      (match) =>
        match.source?.toLowerCase() !== "database" && !match.artwork_id,
    ) ?? [];

  const showReport =
    (processingState === "success" || processingState === "error") &&
    Boolean(similarityReport);
  const showActions =
    processingState === "success" || processingState === "error";

  return (
    <main className="bg-background min-h-screen">
      <UploadHero />

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
                        <p className="text-muted-foreground text-base">
                          Or click to browse from your device
                        </p>
                      </div>

                        <div className="flex flex-wrap items-center justify-center gap-2">
                          {["PNG", "JPG", "JPEG", "WEBP", "GIF", "BMP", "TIFF", "SVG", "AVIF"].map((format) => (
                            <Badge
                              key={format}
                              variant={["PNG", "JPG", "JPEG"].includes(format) ? "default" : "outline"}
                              className={["PNG", "JPG", "JPEG"].includes(format) ? "opacity-90" : "opacity-60"}
                            >
                              {format}
                            </Badge>
                          ))}
                        </div>

                        <p className="text-muted-foreground text-xs">
                          <span className="text-foreground font-medium">Recommended:</span> PNG or JPG for best detection accuracy
                        </p>

                        <p className="text-muted-foreground text-sm">
                          Maximum file size: 96MB
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
                          <p className="truncate text-base font-medium">
                            {file.name}
                          </p>
                          <p className="text-muted-foreground text-sm">
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
                    accept={ACCEPT_ATTR ?? "image/png,image/jpeg,image/jpg,image/webp,image/gif,image/bmp,image/tiff,image/svg+xml/avif,image"}
                    className="hidden"
                    onChange={(e) => handleFileSelect(e.target.files?.[0])}
                    disabled={showProgressView}
                  />
                </div>

                {form.formState.errors.file && (
                  <p className="text-destructive text-base font-medium">
                    {form.formState.errors.file.message}
                  </p>
                )}

                  <Alert>
                    <FileImage className="h-4 w-4" />
                    <AlertTitle>Supported formats</AlertTitle>
                    <AlertDescription className="space-y-1">
                      <span className="block">
                        PNG, JPG, JPEG, WEBP, GIF, BMP, TIFF, AVIF, and SVG are all accepted.
                      </span>
                      <span className="block text-muted-foreground">
                        For best similarity detection results, upload in{" "}
                        <span className="text-foreground font-medium">PNG or JPG</span> — the most widely used formats for digital artwork.
                      </span>
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
                      Terms of Use.features/certificate-generator/index.ts
                    </Link>
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
              <RegistrationForm
                form={form}
                watchedTitle={watchedTitle}
                watchedDescription={watchedDescription}
                completion={completion}
                isSubmitting={isSubmitting}
                onSubmit={openConfirmation}
              />
            ) : (
              <div className="space-y-4">
                <UploadArtworkProgress
                  steps={steps}
                  currentMessage={processingMessage}
                />

                {showReport && similarityReport ? (
                  processingState === "error" ? (
                    <SimilarityReportDetailed
                      similarityReport={similarityReport}
                      databaseMatches={databaseMatches}
                      webMatches={webMatches}
                      hasOtherMatches={
                        Boolean(otherMatchesReport) &&
                        otherMatchesReport!.length > 0
                      }
                    />
                  ) : (
                    <SimilarityReportSummary
                      similarityReport={similarityReport}
                    />
                  )
                ) : null}

                {showActions && (
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

      <GenreTaggingModal
        open={genreModalOpen}
        suggestions={genreSuggestions}
        isSubmitting={isSubmittingGenres}
        onSubmit={handleGenreSubmit}
      />
    </main>
  );
}
