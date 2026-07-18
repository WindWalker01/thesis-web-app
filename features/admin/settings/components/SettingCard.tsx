"use client";

import type { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Info } from "lucide-react";
import type { SettingBadgeType } from "../types";

const BADGE_VARIANTS: Record<SettingBadgeType, "default" | "secondary" | "destructive" | "outline"> = {
  recommended: "default",
  advanced: "secondary",
  experimental: "destructive",
  critical: "destructive",
};

type SettingCardProps = {
  title: string;
  description?: string;
  badge?: SettingBadgeType;
  children: ReactNode;
  className?: string;
  /** Subtitle helper text — explains effect of the setting. */
  helpText?: string;
  /** Recommended value displayed subtly below the input. */
  recommendedValue?: string;
  /** Short tooltip shown on hover over the ⓘ icon next to the title. */
  tooltip?: string;
  /** Orange warning message shown inside the card (e.g. invalid config). */
  validationWarning?: string;
  /** If true, card gets a highlighted border for important thresholds. */
  isHighlighted?: boolean;
};

export function SettingCard({
  title,
  description,
  badge,
  children,
  className,
  helpText,
  recommendedValue,
  tooltip,
  validationWarning,
  isHighlighted,
}: SettingCardProps) {
  return (
    <Card
      className={cn(
        className,
        isHighlighted && "border-primary/40 ring-1 ring-primary/10",
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-semibold flex items-center gap-1.5">
            {title}
            {tooltip && (
              <span
                className="inline-flex items-center cursor-help text-muted-foreground hover:text-foreground transition-colors"
                title={tooltip}
                tabIndex={0}
                role="tooltip"
                aria-label={tooltip}
              >
                <Info className="h-3.5 w-3.5" />
              </span>
            )}
          </CardTitle>
          {badge && (
            <Badge variant={BADGE_VARIANTS[badge] ?? "secondary"} className="text-[10px] capitalize">
              {badge}
            </Badge>
          )}
        </div>
        {description && (
          <CardDescription className="text-sm">{description}</CardDescription>
        )}
        {helpText && (
          <p className="text-xs text-muted-foreground/80 mt-1 leading-relaxed">
            {helpText}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {children}
        {recommendedValue && (
          <p className="text-xs text-muted-foreground/60 border-t border-border/40 pt-2 mt-2">
            <span className="font-medium text-muted-foreground/70">Recommended:</span> {recommendedValue}
          </p>
        )}
        {validationWarning && (
          <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800/30 dark:bg-amber-950/30 dark:text-amber-300">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{validationWarning}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function cn(...inputs: (string | false | null | undefined)[]) {
  return inputs.filter(Boolean).join(" ");
}