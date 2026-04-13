"use client";

import * as React from "react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

import {
  ACCEPTED_TYPES,
  MAX_FILE_SIZE,
  formSchema,
  type UploadArtworkFormValues,
} from "@/features/(user)/upload-artwork/schemas/artwork-schema";
import { recordArtworkInDatabase } from "@/features/(user)/upload-artwork/server/upload-artwork";
import { recordArtworkOnBlockchain } from "@/features/(user)/upload-artwork/server/record-artwork-blockchain";
import type {
  UploadArtworkStep,
  UploadStepStatus,
} from "@/features/(user)/upload-artwork/components/upload-artwork-progress";
import type { SimilarityReport } from "@/features/(user)/upload-artwork/server/art-similarity-scan";

type ProcessingState = "idle" | "processing" | "success" | "error";

const STEP_KEYS = {
  upload: "upload",
  review: "review",
  protect: "protect",
  complete: "complete",
} as const;

const REVIEW_STEP_MESSAGES: Array<{ title: string; description: string }> = [
  {
    title: "Checking originality and preparing protection...",
    description: "We are reviewing your artwork before protection.",
  },
  {
    title: "Comparing against registered artworks...",
    description: "Scanning our database for perceptual hash matches.",
  },
  {
    title: "Scanning the internet for similar images...",
    description: "Cross-referencing your artwork against web sources.",
  },
  {
    title: "Running similarity analysis...",
    description: "Calculating how closely your artwork matches known works.",
  },
  {
    title: "Verifying originality results...",
    description: "Finalizing the scan report before proceeding.",
  },
  {
    title: "Still working - this can take up to 2 minutes...",
    description: "Large or detailed artworks take a little longer to process.",
  },
];

const REVIEW_STEP_INTERVAL_MS = 8_000;

function createInitialSteps(): UploadArtworkStep[] {
  return [
    {
      key: STEP_KEYS.upload,
      title: "Uploading artwork...",
      description: "Your artwork is being prepared for registration.",
      status: "waiting",
    },
    {
      key: STEP_KEYS.review,
      title: "Checking originality and preparing protection...",
      description: "We are reviewing your artwork before protection.",
      status: "waiting",
    },
    {
      key: STEP_KEYS.protect,
      title: "Protecting your artwork and finalizing registration...",
      description: "Your artwork is being securely recorded and protected.",
      status: "waiting",
    },
    {
      key: STEP_KEYS.complete,
      title: "Completed",
      description: "Your artwork registration has finished.",
      status: "waiting",
    },
  ];
}

export function useUploadArtworkForm() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [dragOver, setDragOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [similarityReport, setSimilarityReport] =
    useState<SimilarityReport | null>(null);

  const [processingState, setProcessingState] =
    useState<ProcessingState>("idle");
  const [processingMessage, setProcessingMessage] = useState("");
  const [steps, setSteps] = useState<UploadArtworkStep[]>(createInitialSteps());

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingValues, setPendingValues] =
    useState<UploadArtworkFormValues | null>(null);

  const form = useForm<UploadArtworkFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      rightsConfirmed: false,
    },
  });

  const watchedFile = form.watch("file");
  const watchedTitle = form.watch("title");
  const watchedDescription = form.watch("description") ?? "";
  const watchedRightsConfirmed = form.watch("rightsConfirmed");

  const completion = (() => {
    let score = 0;
    if (watchedFile) score += 40;
    if (watchedTitle?.trim()) score += 30;
    if (watchedDescription?.trim()) score += 10;
    if (watchedRightsConfirmed) score += 20;
    return score;
  })();

  function setStepStatus(key: string, status: UploadStepStatus) {
    setSteps((current) =>
      current.map((step) => (step.key === key ? { ...step, status } : step)),
    );
  }

  function updateStepText(key: string, title: string, description: string) {
    setSteps((current) =>
      current.map((step) =>
        step.key === key ? { ...step, title, description } : step,
      ),
    );
  }

  function resetProgressState() {
    setSteps(createInitialSteps());
    setProcessingMessage("");
    setProcessingState("idle");
    setSimilarityReport(null);
  }

  function handleFileSelect(file?: File) {
    if (!file) return;

    if (
      !ACCEPTED_TYPES.includes(file.type as (typeof ACCEPTED_TYPES)[number])
    ) {
      form.setError("file", { message: "Unsupported file format." });
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      form.setError("file", { message: "File must be 5MB or smaller." });
      return;
    }

    form.clearErrors("file");
    form.setValue("file", file, {
      shouldValidate: true,
      shouldDirty: true,
    });
  }

  function handleRemoveFile() {
    form.setValue("file", undefined as never, { shouldValidate: true });
    setSimilarityReport(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);

    const file = e.dataTransfer.files?.[0];
    handleFileSelect(file);
  }

  function openConfirmation(values: UploadArtworkFormValues) {
    form.clearErrors("root");
    setPendingValues(values);
    setConfirmOpen(true);
  }

  function closeConfirmation() {
    if (isSubmitting) return;
    setConfirmOpen(false);
    setPendingValues(null);
  }

  async function submitArtwork(values: UploadArtworkFormValues) {
    setIsSubmitting(true);
    form.clearErrors("root");
    setSimilarityReport(null);

    setProcessingState("processing");
    setSteps(createInitialSteps());

    try {
      setStepStatus(STEP_KEYS.upload, "active");
      setProcessingMessage("Uploading your artwork...");

      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("description", values.description ?? "");
      formData.append("rightsConfirmed", String(values.rightsConfirmed));
      formData.append("file", values.file);

      setStepStatus(STEP_KEYS.upload, "done");
      setStepStatus(STEP_KEYS.review, "active");
      setProcessingMessage("Checking originality and preparing protection...");

      let reviewMsgIndex = 0;
      const reviewInterval = setInterval(() => {
        reviewMsgIndex = (reviewMsgIndex + 1) % REVIEW_STEP_MESSAGES.length;
        const { title, description } = REVIEW_STEP_MESSAGES[reviewMsgIndex];
        updateStepText(STEP_KEYS.review, title, description);
      }, REVIEW_STEP_INTERVAL_MS);

      const dbResult = await recordArtworkInDatabase(formData);
      clearInterval(reviewInterval);

      setSimilarityReport(dbResult.similarityReport ?? null);

      if (!dbResult.success) {
        setStepStatus(STEP_KEYS.review, "error");
        setProcessingState("error");
        setProcessingMessage(dbResult.message);
        form.setError("root", { message: dbResult.message });
        return;
      }

      if (dbResult.artworkStatus === "flagged") {
        updateStepText(
          STEP_KEYS.review,
          "Similarity check detected high-risk match",
          "A high similarity result was detected, so the artwork was flagged for admin review.",
        );
        updateStepText(
          STEP_KEYS.protect,
          "Protection flow paused for moderation",
          "Blockchain protection is blocked until the flagged artwork is reviewed.",
        );
        updateStepText(
          STEP_KEYS.complete,
          "Submission recorded with admin review required",
          "The upload was saved, but the artwork is not treated as fully cleared.",
        );

        setStepStatus(STEP_KEYS.review, "warning");
        setStepStatus(STEP_KEYS.protect, "warning");
        setStepStatus(STEP_KEYS.complete, "warning");
        setProcessingMessage(
          "High similarity detected. Your artwork was saved and flagged for admin review.",
        );
        setProcessingState("success");
      } else if (dbResult.artworkStatus === "under_review") {
        updateStepText(
          STEP_KEYS.review,
          "Similarity check detected moderate match",
          "A moderate similarity result was detected, so the artwork was placed under review.",
        );
        updateStepText(
          STEP_KEYS.protect,
          "Protection flow waiting for review result",
          "Blockchain protection will continue after moderation review is completed.",
        );
        updateStepText(
          STEP_KEYS.complete,
          "Submission recorded with pending review",
          "The upload was saved, but the artwork still needs moderation review.",
        );

        setStepStatus(STEP_KEYS.review, "warning");
        setStepStatus(STEP_KEYS.protect, "warning");
        setStepStatus(STEP_KEYS.complete, "warning");
        setProcessingMessage(
          "Moderate similarity detected. Your artwork was saved and placed under review.",
        );
        setProcessingState("success");
      } else {
        setStepStatus(STEP_KEYS.review, "done");
        setStepStatus(STEP_KEYS.protect, "active");

        updateStepText(
          STEP_KEYS.review,
          "Originality check completed",
          "No review threshold was triggered.",
        );
        updateStepText(
          STEP_KEYS.protect,
          "Recording artwork on blockchain...",
          "Your artwork is now being written to the blockchain registry.",
        );

        setProcessingMessage(
          "Recording your artwork on blockchain and finalizing protection...",
        );

        const blockchainResult = await recordArtworkOnBlockchain({
          artworkId: dbResult.artworkId,
          authorIdHash: dbResult.authorIdHash,
          fileHash: dbResult.fileHash,
          perceptualHash: dbResult.perceptualHash,
          evidenceHash: dbResult.evidenceHash,
        });

        if (!blockchainResult.success) {
          setStepStatus(STEP_KEYS.protect, "error");
          setProcessingState("error");
          setProcessingMessage(blockchainResult.message);
          form.setError("root", { message: blockchainResult.message });
          return;
        }

        updateStepText(
          STEP_KEYS.protect,
          "Blockchain protection completed",
          "Your artwork was successfully recorded on-chain.",
        );
        updateStepText(
          STEP_KEYS.complete,
          "Completed",
          "Your artwork registration and blockchain protection have finished successfully.",
        );

        setStepStatus(STEP_KEYS.protect, "done");
        setStepStatus(STEP_KEYS.complete, "done");
        setProcessingMessage("Your artwork has been successfully protected.");
        setProcessingState("success");
      }

      form.reset({
        title: "",
        description: "",
        rightsConfirmed: false,
      });

      setPendingValues(null);

      if (inputRef.current) {
        inputRef.current.value = "";
      }

      router.refresh();
    } catch {
      setProcessingState("error");
      setProcessingMessage("Failed to process artwork registration.");
      form.setError("root", {
        message: "Failed to process artwork registration.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function confirmUpload() {
    if (!pendingValues) return;

    const values = pendingValues;
    setConfirmOpen(false);
    setPendingValues(null);

    await submitArtwork(values);
  }

  return {
    form,
    inputRef,
    dragOver,
    setDragOver,
    isSubmitting,
    watchedFile,
    watchedTitle,
    watchedDescription,
    watchedRightsConfirmed,
    completion,
    processingState,
    processingMessage,
    steps,
    similarityReport,
    confirmOpen,
    pendingValues,
    resetProgressState,
    handleFileSelect,
    handleDrop,
    handleRemoveFile,
    openConfirmation,
    closeConfirmation,
    confirmUpload,
  };
}