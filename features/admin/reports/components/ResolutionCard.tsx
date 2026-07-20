"use client";

import { useState, useMemo } from "react";
import { Loader2, ShieldCheck, Flag, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { formatTimeAgo } from "@/lib/client-utils";
import { cn } from "@/lib/client-utils";
import { toast } from "sonner";
import { REPORT_TYPE_LABELS, DECISION_LABELS } from "@/features/reports/types";
import { getRecommendedActions } from "@/features/reports/types";
import type {
  ReportStatus,
  ReportType,
  ReportDecision,
  ReportDecisionValue,
  ActionRecommendation,
} from "@/features/reports/types";

interface ResolutionCardProps {
  reportId: string;
  reportType: ReportType;
  currentStatus: ReportStatus;
  decision: ReportDecision | null;
  /** Whether this report has an associated artwork */
  hasAssociatedArtwork: boolean;
  /** Whether the associated artwork is currently archived (can be restored) */
  artworkIsArchived?: boolean;
  artworkId?: string;
  artworkTitle?: string;
  isUpdatingStatus: boolean;
  /** Callback after resolution completes */
  onResolved?: () => void;
}

/** Active decision options (excluding legacy) */
const DECISIONS: ReportDecisionValue[] = [
  "no_violation",
  "copyright_confirmed",
  "guideline_violation",
  "insufficient_evidence",
];

export function ResolutionCard({
  reportId,
  reportType,
  currentStatus,
  decision,
  hasAssociatedArtwork,
  artworkIsArchived = false,
  artworkId,
  artworkTitle = "this artwork",
  isUpdatingStatus,
  onResolved,
}: ResolutionCardProps) {
  const [selectedDecision, setSelectedDecision] = useState<ReportDecisionValue | null>(null);
  const [summary, setSummary] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Derive recommended actions based on decision + report_type
  const recommendations = useMemo<ActionRecommendation | null>(() => {
    if (!selectedDecision) return null;
    return getRecommendedActions(reportType, selectedDecision);
  }, [selectedDecision, reportType]);

  const [artworkChecks, setArtworkChecks] = useState<Record<string, boolean>>({});
  const [userChecks, setUserChecks] = useState<Record<string, boolean>>({});

  const resetChecks = (rec: ActionRecommendation) => {
    const aw: Record<string, boolean> = {};
    for (const a of rec.artworkActions) aw[a.action] = a.checked;
    const uw: Record<string, boolean> = {};
    for (const u of rec.userActions) uw[u.action] = u.checked;
    setArtworkChecks(aw);
    setUserChecks(uw);
  };

  /** Single orchestrated request — one loading state, atomic from the frontend perspective */
  const handleResolve = async () => {
    if (!selectedDecision || !summary.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/reports/${reportId}/moderate-artwork`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "resolve_report",
          artworkId: artworkId ?? null,
          decision: selectedDecision,
          summary: summary.trim(),
          artworkActions: hasAssociatedArtwork
            ? recommendations?.artworkActions.filter((a) => artworkChecks[a.action]).map((a) => a.action) ?? []
            : [],
          userActions: recommendations?.userActions.filter((u) => userChecks[u.action]).map((u) => u.action) ?? [],
          artworkReason: `Via report resolution — ${selectedDecision}`,
          userReason: `Via report resolution — ${selectedDecision}`,
        }),
      });

      const json = await response.json();
      if (json.success) {
        if (json.alreadyResolved) {
          toast.success("Report was already resolved.");
        } else {
          toast.success("Report resolved successfully.");
        }
        onResolved?.();
      } else {
        toast.error(json.error?.message ?? "Failed to resolve report");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to resolve report");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Already resolved — show decision summary
  if (currentStatus === "resolved" && decision) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Resolution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border p-4 space-y-2 bg-muted/30">
            <div className="flex items-center gap-2">
              {decision.decision === "no_violation" || decision.decision === "insufficient_evidence" ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-500" />
              )}
              <p className="text-sm font-medium">
                {DECISION_LABELS[decision.decision] ?? decision.decision}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">{decision.summary}</p>
            <p className="text-[10px] text-muted-foreground/60">
              Recorded {formatTimeAgo(decision.created_at)}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Must be under review or awaiting_evidence to resolve
  if (currentStatus !== "under_review" && currentStatus !== "awaiting_evidence") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Resolution</CardTitle>
          <CardDescription className="text-xs">
            Move this report to "Under Review" before taking resolution actions.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const isBusy = isSubmitting || isUpdatingStatus;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Resolution</CardTitle>
        <CardDescription className="text-xs">
          Choose a decision and review the recommended actions.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Decision selection */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Decision
          </label>
          <div className="grid grid-cols-1 gap-1.5">
            {DECISIONS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => {
                  setSelectedDecision(d);
                  const rec = getRecommendedActions(reportType, d);
                  resetChecks(rec);
                }}
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-all",
                  selectedDecision === d
                    ? "border-primary bg-primary/5 text-primary ring-1 ring-primary/20"
                    : "border-border hover:bg-muted/50"
                )}
              >
                <span
                  className={cn(
                    "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2",
                    selectedDecision === d
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted-foreground/30"
                  )}
                >
                  {selectedDecision === d && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
                </span>
                {DECISION_LABELS[d]}
              </button>
            ))}
          </div>
        </div>

        {/* Recommended actions (appears after decision selected) */}
        {recommendations && (
          <>
            <Separator />

            <div className="rounded-lg border border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/10 p-3">
              <div className="flex items-center gap-2 mb-2">
                <Flag className="h-4 w-4 text-blue-600" />
                <p className="text-xs font-semibold text-blue-700 dark:text-blue-400">
                  Recommended Actions
                </p>
              </div>
              <p className="text-[10px] text-muted-foreground mb-3">
                Based on &ldquo;{DECISION_LABELS[selectedDecision!] ?? selectedDecision}&rdquo; for a{" "}
                {REPORT_TYPE_LABELS[reportType]} report.
              </p>

              {/* Artwork Actions */}
              {hasAssociatedArtwork && recommendations.artworkActions.length > 0 && (
                <div className="space-y-1.5 mb-3">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase">
                    Artwork &mdash; &ldquo;{artworkTitle}&rdquo;
                  </p>
                  {recommendations.artworkActions.map((a) => {
                    if (a.action === "restore_artwork" && !artworkIsArchived) return null;
                    return (
                      <label key={a.action} className="flex items-center gap-2 cursor-pointer py-0.5">
                        <Checkbox
                          checked={artworkChecks[a.action] ?? a.checked}
                          onCheckedChange={(checked) =>
                            setArtworkChecks((prev) => ({ ...prev, [a.action]: !!checked }))
                          }
                          className="h-3.5 w-3.5"
                        />
                        <span className="text-xs">{a.label}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {/* User Actions */}
              {recommendations.userActions.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase">
                    User Actions
                  </p>
                  {recommendations.userActions.map((u) => (
                    <label key={u.action} className="flex items-center gap-2 cursor-pointer py-0.5">
                      <Checkbox
                        checked={userChecks[u.action] ?? u.checked}
                        onCheckedChange={(checked) =>
                          setUserChecks((prev) => ({ ...prev, [u.action]: !!checked }))
                        }
                        className="h-3.5 w-3.5"
                      />
                      <span className="text-xs">{u.label}</span>
                    </label>
                  ))}
                </div>
              )}

              {recommendations.artworkActions.length === 0 && recommendations.userActions.length === 0 && (
                <p className="text-xs text-muted-foreground italic">
                  No additional actions needed. The report can be resolved as-is.
                </p>
              )}
            </div>

            {/* Summary */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Summary
              </label>
              <Textarea
                placeholder="Explain the decision..."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={3}
                className="text-sm"
              />
            </div>

            {/* Review */}
            {summary.trim() && (
              <div className="rounded-lg border border-muted bg-muted/20 p-3 text-xs space-y-1">
                <p className="font-medium">Review</p>
                <p>
                  <span className="text-muted-foreground">Decision:</span>{" "}
                  {DECISION_LABELS[selectedDecision!] ?? selectedDecision}
                </p>
                {recommendations.artworkActions.filter((a) => artworkChecks[a.action]).length > 0 && (
                  <p>
                    <span className="text-muted-foreground">Artwork:</span>{" "}
                    {recommendations.artworkActions
                      .filter((a) => artworkChecks[a.action])
                      .map((a) => a.label)
                      .join(", ")}
                  </p>
                )}
                {recommendations.userActions.filter((u) => userChecks[u.action]).length > 0 && (
                  <p>
                    <span className="text-muted-foreground">User:</span>{" "}
                    {recommendations.userActions
                      .filter((u) => userChecks[u.action])
                      .map((u) => u.label)
                      .join(", ")}
                  </p>
                )}
              </div>
            )}

            {/* Resolve button */}
            <Button
              onClick={handleResolve}
              disabled={!selectedDecision || !summary.trim() || isBusy}
              className="w-full gap-2"
              size="sm"
            >
              {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
              {isBusy ? "Resolving..." : "Resolve Report"}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}