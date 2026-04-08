"use client";

import {
    CheckCircle2,
    CircleDashed,
    Loader2,
    ShieldAlert,
    Sparkles,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { StatusProgress } from "@/features/(user)/upload-artwork/components/status-progress";

export type UploadStepStatus =
    | "waiting"
    | "active"
    | "done"
    | "error"
    | "warning"
    | "pending-integration";

export type UploadArtworkStep = {
    key: string;
    title: string;
    description: string;
    status: UploadStepStatus;
};

type UploadArtworkProgressProps = {
    steps: UploadArtworkStep[];
    currentMessage?: string;
};

function StepIcon({ status }: { status: UploadStepStatus }) {
    if (status === "done") {
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    }

    if (status === "active") {
        return <Loader2 className="h-5 w-5 animate-spin text-primary" />;
    }

    if (status === "error") {
        return <ShieldAlert className="h-5 w-5 text-destructive" />;
    }

    if (status === "warning") {
        return <ShieldAlert className="h-5 w-5 text-amber-500" />;
    }

    if (status === "pending-integration") {
        return <Sparkles className="h-5 w-5 text-amber-500" />;
    }

    return <CircleDashed className="h-5 w-5 text-muted-foreground" />;
}

function StepBadge({ status }: { status: UploadStepStatus }) {
    if (status === "done") {
        return <Badge className="bg-green-600 hover:bg-green-600">Done</Badge>;
    }

    if (status === "active") {
        return <Badge>In progress</Badge>;
    }

    if (status === "error") {
        return <Badge variant="destructive">Failed</Badge>;
    }

    if (status === "warning") {
        return (
            <Badge className="bg-amber-500 hover:bg-amber-500 text-white">
                Needs review
            </Badge>
        );
    }

    if (status === "pending-integration") {
        return <Badge variant="secondary">Pending integration</Badge>;
    }

    return <Badge variant="outline">Waiting</Badge>;
}

export function UploadArtworkProgress({
    steps,
    currentMessage,
}: UploadArtworkProgressProps) {
    const completeLikeStatuses: UploadStepStatus[] = ["done", "warning"];
    const doneCount = steps.filter((step) =>
        completeLikeStatuses.includes(step.status),
    ).length;
    const progressValue = Math.round((doneCount / steps.length) * 100);

    return (
        <Card>
            <CardHeader className="border-b bg-muted/30">
                <CardTitle>Artwork registration progress</CardTitle>
                <CardDescription>
                    This page reflects the upload, similarity review, and protection flow.
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 p-6">
                <StatusProgress
                    value={progressValue}
                    label="Pipeline progress"
                    className="max-w-full"
                />

                {currentMessage ? (
                    <div className="rounded-lg border bg-muted/40 px-4 py-3 text-sm">
                        {currentMessage}
                    </div>
                ) : null}

                <div className="space-y-4">
                    {steps.map((step, index) => (
                        <div key={step.key} className="rounded-xl border p-4">
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5">
                                    <StepIcon status={step.status} />
                                </div>

                                <div className="min-w-0 flex-1 space-y-2">
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <p className="text-sm font-semibold">
                                                {index + 1}. {step.title}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {step.description}
                                            </p>
                                        </div>

                                        <StepBadge status={step.status} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}