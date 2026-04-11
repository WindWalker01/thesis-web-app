"use client";

import * as React from "react";
import { useMemo, useRef, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
    classificationSchema,
    type ClassificationFormValues,
    ACCEPTED_CLASSIFY_TYPES,
    MAX_CLASSIFY_FILE_SIZE,
} from "@/features/classify/schemas/classification-schema";
import { classifyArtwork } from "@/features/classify/server/classify-artwork";
import type { ClassificationLabel } from "@/features/classify/types";

export function useClassification() {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [isPending, startTransition] = useTransition();
    const [dragOver, setDragOver] = useState(false);
    const [result, setResult] = useState<ClassificationLabel[] | null>(null);
    const [serverMessage, setServerMessage] = useState<string>("");

    const form = useForm<ClassificationFormValues>({
        resolver: zodResolver(classificationSchema),
        defaultValues: {
            file: undefined,
        },
        mode: "onChange",
    });

    const watchedFile = form.watch("file");

    const previewUrl = useMemo(() => {
        if (!watchedFile) return null;
        return URL.createObjectURL(watchedFile);
    }, [watchedFile]);

    React.useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    function handleFileSelect(file?: File) {
        if (!file) return;

        if (
            !ACCEPTED_CLASSIFY_TYPES.includes(
                file.type as (typeof ACCEPTED_CLASSIFY_TYPES)[number],
            )
        ) {
            form.setError("file", { message: "Unsupported image format." });
            return;
        }

        if (file.size > MAX_CLASSIFY_FILE_SIZE) {
            form.setError("file", { message: "Image must be 5MB or smaller." });
            return;
        }

        form.clearErrors("file");
        form.clearErrors("root");
        setResult(null);
        setServerMessage("");

        form.setValue("file", file, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
        });

        if (inputRef.current) {
            inputRef.current.value = "";
        }
    }

    function handleRemoveFile() {
        form.setValue("file", undefined as never, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
        });
        form.clearErrors("root");
        setResult(null);
        setServerMessage("");

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

    function onSubmit(values: ClassificationFormValues) {
        form.clearErrors("root");
        setResult(null);
        setServerMessage("");

        startTransition(async () => {
            const formData = new FormData();
            formData.append("file", values.file);

            const response = await classifyArtwork(formData);

            if (!response.success) {
                form.setError("root", { message: response.message });
                setServerMessage(response.message);
                return;
            }

            setResult(response.predictions);
            setServerMessage(response.message);
        });
    }

    const topPrediction = result?.[0] ?? null;

    return {
        form,
        inputRef,
        dragOver,
        setDragOver,
        isPending,
        watchedFile,
        previewUrl,
        result,
        topPrediction,
        serverMessage,
        handleFileSelect,
        handleRemoveFile,
        handleDrop,
        onSubmit,
    };
}