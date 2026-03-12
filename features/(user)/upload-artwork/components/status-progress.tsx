"use client";

import * as React from "react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/client-utils";

type StatusProgressProps = {
    value: number;
    label?: string;
    className?: string;
    showPercentage?: boolean;
    percentageSuffix?: string;
};

export function StatusProgress({
    value,
    label = "Progress",
    className,
    showPercentage = true,
    percentageSuffix = "%",
}: StatusProgressProps) {
    const safeValue = Math.max(0, Math.min(100, value));

    return (
        <div className={cn("w-full max-w-sm space-y-2", className)}>
            <div className="flex items-center justify-between gap-3 text-xs">
                <span className="text-muted-foreground">{label}</span>

                {showPercentage && (
                    <span className="font-mono font-medium text-primary">
                        {safeValue}
                        {percentageSuffix}
                    </span>
                )}
            </div>

            <Progress value={safeValue} className="h-1.5" />
        </div>
    );
}