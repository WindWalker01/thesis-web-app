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
import { recordArtworkInDatabase } from "@/features/(user)/upload-artwork/server-actions/upload-artwork";
import { recordArtworkOnBlockchain } from "@/features/(user)/upload-artwork/server-actions/record-artwork-blockchain";
import type {
  UploadArtworkStep,
  UploadStepStatus,
} from "@/features/(user)/upload-artwork/components/upload-artwork-progress";

type ProcessingState = "idle" | "processing" | "success" | "error";

const STEP_KEYS = {
  upload: "upload",
  review: "review",
  protect: "protect",
  complete: "complete",
} as const;

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

  const [processingState, setProcessingState] = useState<ProcessingState>("idle");
  const [processingMessage, setProcessingMessage] = useState("");
  const [steps, setSteps] = useState<UploadArtworkStep[]>(createInitialSteps());

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
      current.map((step) =>
        step.key === key ? { ...step, status } : step
      )
    );
  }

  function resetProgressState() {
    setSteps(createInitialSteps());
    setProcessingMessage("");
    setProcessingState("idle");
  }

  function handleFileSelect(file?: File) {
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type as (typeof ACCEPTED_TYPES)[number])) {
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

  async function onSubmit(values: UploadArtworkFormValues) {
    setIsSubmitting(true);
    form.clearErrors("root");

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

      const dbResult = await recordArtworkInDatabase(formData);

      if (!dbResult.success) {
        setStepStatus(STEP_KEYS.review, "error");
        setProcessingState("error");
        setProcessingMessage(dbResult.message);
        form.setError("root", { message: dbResult.message });
        return;
      }

      setStepStatus(STEP_KEYS.review, "done");
      setStepStatus(STEP_KEYS.protect, "active");
      setProcessingMessage("Protecting your artwork and finalizing registration...");

      /* Uncomment this once you are done with the Plagiarism check and Automatic Classification */
      
      /*       const blockchainResult = await recordArtworkOnBlockchain({
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
            } */

      setStepStatus(STEP_KEYS.protect, "done");
      setStepStatus(STEP_KEYS.complete, "done");
      setProcessingMessage("Your artwork has been successfully protected.");
      setProcessingState("success");

      form.reset({
        title: "",
        description: "",
        rightsConfirmed: false,
      });

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
    resetProgressState,
    handleFileSelect,
    handleDrop,
    handleRemoveFile,
    onSubmit,
  };
}