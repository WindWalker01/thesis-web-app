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
                <ArtworkDropzone
                  file={watchedFile}
                  previewUrl={previewUrl}
                  dragOver={dragOver}
                  setDragOver={setDragOver}
                  inputRef={inputRef}
                  showProgressView={showProgressView}
                  fileError={form.formState.errors.file?.message}
                  onDrop={handleDrop}
                  onFileSelect={handleFileSelect}
                  onRemoveFile={handleRemoveFile}
                />
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
