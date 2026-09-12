"use client";

import { useState, useCallback, useEffect } from "react";
import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Info,
  RefreshCw,
  RotateCcw,
  Settings2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getSettings,
  updateSettings,
  resetCategoryDefaults,
} from "../server/settings";
import type { SettingValue, SettingDefinition } from "../types";
import {
  SETTINGS_CATEGORIES,
  DEFAULT_SETTINGS,
  getSettingByKey,
  getGroupsForCategory,
} from "../constants";
import { SETTING_GROUPS } from "../types";
import {
  normalizeCommunityRecognitionThresholds,
  updateCommunityRecognitionThresholds,
} from "../lib/community-recognition-thresholds";
import { SettingsPageSkeleton } from "./page-skeleton";
import { SettingCard } from "./SettingCard";
import { SettingInput } from "./SettingInput";
import { SettingToggle } from "./SettingToggle";
import { SettingSlider } from "./SettingSlider";
import { SettingSelect } from "./SettingSelect";
import { SettingDateTime } from "./SettingDateTime";
import { ConfirmDialog } from "./ConfirmDialog";

export default function SettingsPage() {
  // Data state
  const [settings, setSettings] = useState<Record<string, SettingValue> | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [activeTab, setActiveTab] = useState("general");
  const [dirtyChanges, setDirtyChanges] = useState<Map<string, SettingValue>>(
    new Map(),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    onCancel?: () => void;
    variant?: "default" | "destructive";
  }>({ open: false, title: "", description: "", onConfirm: () => {} });

  // Live slider thumb positions while dragging. Kept separate from
  // `dirtyChanges` so confirmation dialogs only fire once on release
  // (`onCommit`) instead of on every intermediate tick (`onChange`).
  const [sliderPreviews, setSliderPreviews] = useState<Map<string, number>>(
    new Map(),
  );

  // Fetch settings on mount
  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const settingsData = await getSettings();
      setSettings(settingsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Helper: get current value for a setting
  const getValue = useCallback(
    (key: string): SettingValue => {
      if (dirtyChanges.has(key)) return dirtyChanges.get(key)!;
      if (settings && key in settings) return settings[key];
      return DEFAULT_SETTINGS[key] ?? "";
    },
    [settings, dirtyChanges],
  );

  // Display value for sliders: live drag position wins while dragging,
  // otherwise fall back to the last committed (dirty / saved) value.
  const getSliderValue = useCallback(
    (key: string): number => {
      if (sliderPreviews.has(key)) return sliderPreviews.get(key)!;
      return Number(getValue(key));
    },
    [sliderPreviews, getValue],
  );

  // Helper: get setting definition
  const getSettingDef = useCallback(
    (key: string): SettingDefinition | undefined => {
      return getSettingByKey(key);
    },
    [],
  );

  // Handle setting change
  const handleChange = useCallback(
    (key: string, value: SettingValue) => {
      const setting = getSettingDef(key);

      // Check if this setting requires confirmation
      if (setting?.requiresConfirmation && setting.confirmationMessage) {
        setConfirmDialog({
          open: true,
          title: `Change ${setting.label}?`,
          description: setting.confirmationMessage,
          onConfirm: () => {
            setDirtyChanges((prev) => {
              const next = new Map(prev);
              next.set(key, value);
              return next;
            });
          },
          onCancel: () => {
            // Revert the thumb to the last committed value.
            setSliderPreviews((prev) => {
              if (!prev.has(key)) return prev;
              const next = new Map(prev);
              next.delete(key);
              return next;
            });
          },
        });
        return;
      }

      setDirtyChanges((prev) => {
        const next = new Map(prev);
        next.set(key, value);
        return next;
      });
    },
    [getSettingDef],
  );

  // Live slider preview while dragging — no side effects, no dialog.
  const handleSliderPreview = useCallback((key: string, value: number) => {
    setSliderPreviews((prev) => {
      const next = new Map(prev);
      next.set(key, value);
      return next;
    });
  }, []);

  const clearSliderPreview = useCallback((key: string) => {
    setSliderPreviews((prev) => {
      if (!prev.has(key)) return prev;
      const next = new Map(prev);
      next.delete(key);
      return next;
    });
  }, []);

  // Fired once when the user lets go of the slider. This is the only place
  // where a slider change can open the confirmation dialog.
  const handleSliderCommit = useCallback(
    (key: string, value: SettingValue) => {
      clearSliderPreview(key);
      handleChange(key, value);
    },
    [clearSliderPreview, handleChange],
  );

  // Handle save
  const handleSave = useCallback(async () => {
    if (dirtyChanges.size === 0) return;

    setIsSaving(true);
    try {
      const changesObj: Record<string, SettingValue> = {};
      dirtyChanges.forEach((value, key) => {
        changesObj[key] = value;
      });

      const result = await updateSettings(changesObj);
      if (result.success) {
        toast.success(result.message);
        setDirtyChanges(new Map());
        await fetchSettings();
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to save settings",
      );
    } finally {
      setIsSaving(false);
    }
  }, [dirtyChanges, fetchSettings]);

  // Handle discard
  const handleDiscard = useCallback(() => {
    setDirtyChanges(new Map());
    setSliderPreviews(new Map());
    toast.info("Changes discarded");
  }, []);

  // Handle restore defaults for current tab
  const handleRestoreDefaults = useCallback(() => {
    const category = SETTINGS_CATEGORIES.find((c) => c.id === activeTab);
    if (!category) return;

    setConfirmDialog({
      open: true,
      title: `Reset ${category.label} Settings?`,
      description: `This will reset all settings in "${category.label}" to their default values. This action cannot be undone.`,
      variant: "destructive",
      onConfirm: async () => {
        setIsResetting(true);
        try {
          const keys = category.settings.map((s) => s.key);
          const result = await resetCategoryDefaults(keys);
          if (result.success) {
            toast.success(result.message);
            await fetchSettings();
            setDirtyChanges(new Map());
          } else {
            toast.error(result.message);
          }
        } catch (err) {
          toast.error(
            err instanceof Error ? err.message : "Failed to reset settings",
          );
        } finally {
          setIsResetting(false);
        }
      },
    });
  }, [activeTab, fetchSettings]);

  // ── Validation warnings for threshold relationships ──────────────

  const getValidationWarnings = useCallback(
    (setting: SettingDefinition): string | undefined => {
      if (activeTab !== "similarity") return undefined;

      const autoApproval = Number(getSliderValue("automatic_approval_threshold"));
      const manualReview = Number(getSliderValue("manual_review_threshold"));
      const similarity = Number(getSliderValue("similarity_threshold"));

      switch (setting.key) {
        case "automatic_approval_threshold":
          if (autoApproval >= manualReview) {
            return "Automatic Approval Threshold should be lower than Manual Review Threshold. Otherwise, artworks that should be reviewed may be automatically approved.";
          }
          return undefined;
        case "manual_review_threshold":
          if (manualReview <= autoApproval) {
            return "Manual Review Threshold must be higher than Automatic Approval Threshold. Otherwise, no artworks will enter the manual review zone.";
          }
          if (manualReview >= similarity) {
            return "Manual Review Threshold should be lower than Similarity Threshold. Otherwise, artworks flagged as highly similar may bypass manual review.";
          }
          return undefined;
        case "similarity_threshold":
          if (similarity <= manualReview) {
            return "Similarity Threshold should be greater than Manual Review Threshold. Otherwise, the 'highly similar' label may never be applied before manual review triggers.";
          }
          return undefined;
        default:
          return undefined;
      }
    },
    [activeTab, getSliderValue],
  );

  // ── Workflow info card for similarity tab ────────────────────────

  const WorkflowInfoCard = () => {
    const autoApproval = Number(
      getSliderValue("automatic_approval_threshold"),
    );
    const manualReview = Number(getSliderValue("manual_review_threshold"));
    const similarity = Number(getSliderValue("similarity_threshold"));

    return (
      <div className="border-border bg-card rounded-lg border p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <Info className="text-primary mt-0.5 h-5 w-5 shrink-0" />
          <div className="min-w-0 space-y-3">
            <div>
              <h3 className="text-sm font-semibold">
                How Similarity Detection Works
              </h3>
              <p className="text-muted-foreground mt-0.5 text-xs">
                When an artwork is uploaded, the system scans it and calculates
                a similarity score. The score determines what happens next:
              </p>
            </div>

            <div className="space-y-1.5 text-xs">
              {/* Auto-approve zone */}
              <div className="flex items-center gap-2">
                <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                  ✔
                </span>
                <span>
                  <strong>
                    Score {"<"}
                    {autoApproval}%
                  </strong>{" "}
                  — Artwork is automatically approved. No review needed.
                </span>
              </div>

              {/* Warning zone */}
              <div className="flex items-center gap-2">
                <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-[10px] font-bold text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                  !
                </span>
                <span>
                  <strong>
                    {autoApproval}% – {manualReview}%
                  </strong>{" "}
                  — Artwork proceeds with registration. Similarity is shown to
                  the uploader as a warning.
                </span>
              </div>

              {/* Manual review zone */}
              <div className="flex items-center gap-2">
                <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-100 text-[10px] font-bold text-orange-700 dark:bg-orange-900/40 dark:text-orange-400">
                  👁
                </span>
                <span>
                  <strong>
                    {manualReview}% – {similarity}%
                  </strong>{" "}
                  — Artwork is sent to an administrator for manual review.
                </span>
              </div>

              {/* Highly similar zone */}
              <div className="flex items-center gap-2">
                <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-[10px] font-bold text-red-700 dark:bg-red-900/40 dark:text-red-400">
                  🚩
                </span>
                <span>
                  <strong>Score ≥ {similarity}%</strong> — Artwork is flagged as
                  highly similar and sent for admin review.
                </span>
              </div>
            </div>

            <p className="text-muted-foreground/70 text-[11px]">
              Adjust the thresholds below to control where each boundary sits.
              Changes affect future uploads only.
            </p>
          </div>
        </div>
      </div>
    );
  };

  // ── Render a single setting field ─────────────────────────────────

  const renderCommunityRecognitionThresholds = useCallback(() => {
    const currentThresholds = normalizeCommunityRecognitionThresholds(
      getValue("community_recognition_badge_thresholds"),
    );

    const updateThresholds = (
      key: "Recognized" | "Acclaimed" | "Master",
      nextValue: number,
    ) => {
      const validated = updateCommunityRecognitionThresholds(
        currentThresholds,
        key,
        nextValue,
      );

      handleChange("community_recognition_badge_thresholds", validated);
    };

    return (
      <div className="space-y-5">
        <SettingSlider
          label="Recognized Tier Threshold"
          value={currentThresholds.Recognized}
          min={0}
          max={Math.min(99, currentThresholds.Acclaimed - 1)}
          step={1}
          unit="pts"
          onChange={(value) => updateThresholds("Recognized", Number(value))}
        />

        <SettingSlider
          label="Acclaimed Tier Threshold"
          value={currentThresholds.Acclaimed}
          min={Math.max(1, currentThresholds.Recognized + 1)}
          max={Math.min(99, currentThresholds.Master - 1)}
          step={1}
          unit="pts"
          onChange={(value) => updateThresholds("Acclaimed", Number(value))}
        />

        <SettingSlider
          label="Master Tier Threshold"
          value={currentThresholds.Master}
          min={Math.max(2, currentThresholds.Acclaimed + 1)}
          max={100}
          step={1}
          unit="pts"
          onChange={(value) => updateThresholds("Master", Number(value))}
        />
      </div>
    );
  }, [getValue, handleChange]);

  const renderSetting = useCallback(
    (setting: SettingDefinition) => {
      const value = getValue(setting.key);

      switch (setting.type) {
        case "toggle":
          return (
            <SettingToggle
              label={setting.label}
              value={Boolean(value)}
              onChange={(v) => handleChange(setting.key, v)}
            />
          );

        case "slider":
          return (
            <div className="space-y-1">
              <SettingSlider
                label={setting.label}
                value={getSliderValue(setting.key)}
                min={setting.min ?? 0}
                max={setting.max ?? 100}
                step={setting.step}
                unit={setting.unit}
                onChange={(v) => handleSliderPreview(setting.key, Number(v))}
                onCommit={(v) => handleSliderCommit(setting.key, Number(v))}
              />
            </div>
          );

        case "json":
          if (setting.key === "community_recognition_badge_thresholds") {
            return renderCommunityRecognitionThresholds();
          }
          return (
            <div className="space-y-1">
              <SettingInput
                label={setting.label}
                value={JSON.stringify(value ?? {}, null, 2)}
                type="textarea"
                placeholder={setting.placeholder}
                onChange={(v) => {
                  const parsed =
                    typeof v === "string" ? JSON.parse(v || "{}") : v;
                  handleChange(setting.key, parsed as Record<string, unknown>);
                }}
              />
            </div>
          );

        case "select":
          return (
            <div className="space-y-1">
              <SettingSelect
                label={setting.label}
                value={String(value)}
                options={setting.options ?? []}
                onChange={(v) => handleChange(setting.key, v)}
              />
            </div>
          );

        case "textarea":
          return (
            <div className="space-y-1">
              <SettingInput
                label={setting.label}
                value={String(value)}
                type="textarea"
                placeholder={setting.placeholder}
                onChange={(v) => handleChange(setting.key, v)}
              />
            </div>
          );

        case "number":
          return (
            <div className="space-y-1">
              <SettingInput
                label={setting.label}
                value={Number(value)}
                type="number"
                placeholder={setting.placeholder}
                onChange={(v) => handleChange(setting.key, Number(v))}
              />
            </div>
          );

        case "email":
          return (
            <div className="space-y-1">
              <SettingInput
                label={setting.label}
                value={String(value)}
                type="email"
                placeholder={setting.placeholder}
                onChange={(v) => handleChange(setting.key, String(v))}
              />
            </div>
          );

        case "datetime":
          return (
            <SettingDateTime
              label={setting.label}
              value={String(value)}
              placeholder={setting.placeholder}
              onChange={(v) => handleChange(setting.key, v)}
            />
          );

        default:
          return (
            <div className="space-y-1">
              <SettingInput
                label={setting.label}
                value={String(value)}
                type="text"
                placeholder={setting.placeholder}
                onChange={(v) => handleChange(setting.key, String(v))}
              />
            </div>
          );
      }
    },
    [getValue, handleChange, renderCommunityRecognitionThresholds, getSliderValue, handleSliderCommit, handleSliderPreview],
  );

  // ── Helper: determine if a setting should be visible ────────────
  // Hides all maintenance child settings when maintenance_mode is OFF,
  // so only the main toggle is visible. When maintenance_mode is ON,
  // all configuration fields appear (with scheduled datetime fields
  // further gated by scheduled_maintenance).
  const MAINTENANCE_CHILD_KEYS = new Set([
    "maintenance_message",
    "scheduled_maintenance",
    "scheduled_maintenance_start",
    "scheduled_maintenance_end",
    "allow_admin_login_during_maintenance",
    "display_countdown",
  ]);

  const isSettingVisible = useCallback(
    (setting: SettingDefinition): boolean => {
      // Gate scheduled datetime fields by BOTH maintenance_mode AND scheduled_maintenance.
      // This prevents the edge case where scheduled_maintenance was saved as ON
      // but maintenance_mode was later turned OFF.
      if (
        setting.key === "scheduled_maintenance_start" ||
        setting.key === "scheduled_maintenance_end"
      ) {
        return (
          Boolean(getValue("maintenance_mode")) &&
          Boolean(getValue("scheduled_maintenance"))
        );
      }
      // Gate all other child settings by the maintenance_mode toggle
      if (MAINTENANCE_CHILD_KEYS.has(setting.key)) {
        return Boolean(getValue("maintenance_mode"));
      }
      return true;
    },
    [getValue],
  );

  // ── Render a single setting card with all new props ──────────────

  const renderSettingCard = useCallback(
    (setting: SettingDefinition) => {
      const isThreshold =
        setting.key === "similarity_threshold" ||
        setting.key === "manual_review_threshold" ||
        setting.key === "automatic_approval_threshold";

      return (
        <SettingCard
          key={setting.key}
          title={setting.label}
          description={setting.description}
          badge={setting.badge}
          helpText={setting.helpText}
          recommendedValue={setting.recommendedValue}
          tooltip={setting.tooltip}
          validationWarning={getValidationWarnings(setting)}
          isHighlighted={isThreshold}
        >
          {renderSetting(setting)}
        </SettingCard>
      );
    },
    [renderSetting, getValidationWarnings],
  );

  // ── Render settings grouped by their `group` field ───────────────

  const renderGroupedSettings = useCallback(
    (categoryId: string) => {
      const category = SETTINGS_CATEGORIES.find((c) => c.id === categoryId);
      if (!category) return null;

      const groupIds = getGroupsForCategory(categoryId);

      // If no groups, render flat (for non-similarity categories)
      if (groupIds.length === 0) {
        return (
          <div className="space-y-4">
            {category.settings.filter(isSettingVisible).map((setting) => (
              <SettingCard
                key={setting.key}
                title={setting.label}
                description={setting.description}
                badge={setting.badge}
                helpText={setting.helpText}
                recommendedValue={setting.recommendedValue}
                tooltip={setting.tooltip}
              >
                {renderSetting(setting)}
              </SettingCard>
            ))}
          </div>
        );
      }

      // Render grouped
      return (
        <div className="space-y-6">
          {groupIds.map((groupId) => {
            const groupDef = SETTING_GROUPS.find((g) => g.id === groupId);
            const groupSettings = category.settings
              .filter((s) => s.group === groupId)
              .filter(isSettingVisible);
            if (groupSettings.length === 0) return null;

            const isAdvanced = groupDef?.isAdvanced ?? false;
            const isExpanded = expandedGroups.has(groupId);

            // For advanced groups, wrap in collapsible section
            if (isAdvanced) {
              return (
                <div key={groupId} className="space-y-3">
                  <button
                    type="button"
                    onClick={() => {
                      setExpandedGroups((prev) => {
                        const next = new Set(prev);
                        if (next.has(groupId)) {
                          next.delete(groupId);
                        } else {
                          next.add(groupId);
                        }
                        return next;
                      });
                    }}
                    className="border-border bg-muted/30 hover:bg-muted/50 flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm font-medium transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronDown className="text-muted-foreground h-4 w-4" />
                    ) : (
                      <ChevronRight className="text-muted-foreground h-4 w-4" />
                    )}
                    <span className="text-base">{groupDef?.icon ?? "📋"}</span>
                    <span>{groupDef?.label ?? groupId}</span>
                    <Badge variant="secondary" className="ml-auto text-[10px]">
                      {groupSettings.length} settings
                    </Badge>
                  </button>

                  {isExpanded && (
                    <div className="border-muted space-y-4 border-l-2 pl-2">
                      {groupDef?.description && (
                        <p className="text-muted-foreground pl-2 text-xs">
                          {groupDef.description}
                        </p>
                      )}
                      {groupSettings.map((setting) =>
                        renderSettingCard(setting),
                      )}
                    </div>
                  )}
                </div>
              );
            }

            // Non-advanced groups
            return (
              <div key={groupId} className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-base">{groupDef?.icon ?? "📋"}</span>
                  <h3 className="text-sm font-semibold">
                    {groupDef?.label ?? groupId}
                  </h3>
                  {groupDef?.description && (
                    <span className="text-muted-foreground hidden text-xs sm:inline">
                      — {groupDef.description}
                    </span>
                  )}
                </div>
                <Separator />
                <div className="space-y-4">
                  {groupSettings.map((setting) => renderSettingCard(setting))}
                </div>
              </div>
            );
          })}
        </div>
      );
    },
    [renderSetting, renderSettingCard, expandedGroups],
  );

  const totalDirtyCount = dirtyChanges.size;

  // Loading state
  if (isLoading) {
    return <SettingsPageSkeleton />;
  }

  // Error state
  if (error || !settings) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center p-4">
        <div className="max-w-md space-y-4 text-center">
          <AlertTriangle className="text-destructive mx-auto h-12 w-12" />
          <h2 className="text-xl font-bold">Failed to Load Settings</h2>
          <p className="text-muted-foreground text-sm">
            {error ?? "An unexpected error occurred while loading settings."}
          </p>
          <Button onClick={() => fetchSettings()} className="gap-2">
            <RefreshCw className="h-4 w-4" /> Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Top Bar */}
      <div className="border-border bg-card border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <Settings2 className="text-primary h-5 w-5" />
          <h1 className="text-lg font-bold tracking-tight sm:text-xl">
            System Settings
          </h1>
          <Badge variant="secondary" className="text-xs">
            {SETTINGS_CATEGORIES.length} categories
          </Badge>
        </div>
        <p className="text-muted-foreground mt-0.5 text-sm">
          Platform configuration and administration
        </p>
      </div>

      <div className="p-4 lg:p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="mb-6 flex items-center justify-between">
            <TabsList>
              {SETTINGS_CATEGORIES.map((cat) => (
                <TabsTrigger key={cat.id} value={cat.id}>
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRestoreDefaults}
                disabled={isResetting}
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                <span className="hidden sm:inline">Restore Defaults</span>
              </Button>
            </div>
          </div>

          {SETTINGS_CATEGORIES.map((category) => (
            <TabsContent
              key={category.id}
              value={category.id}
              className="mt-0 space-y-6"
            >
              <div className="space-y-1">
                <h2 className="text-xl font-bold tracking-tight">
                  {category.label}
                </h2>
                <p className="text-muted-foreground text-sm">
                  {category.description}
                </p>
              </div>
              <Separator />

              {/* Workflow info card — only for similarity tab */}
              {category.id === "similarity" && <WorkflowInfoCard />}

              {/* Grouped or flat settings */}
              {renderGroupedSettings(category.id)}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Unsaved Changes Bar */}
      {totalDirtyCount > 0 && (
        <div className="border-border bg-card fixed right-0 bottom-0 left-0 z-50 border-t px-4 py-3 shadow-lg">
          <div className="mx-auto flex max-w-5xl items-center justify-between">
            <p className="text-muted-foreground text-sm">
              You have{" "}
              <span className="text-foreground font-semibold">
                {totalDirtyCount}
              </span>{" "}
              unsaved change(s).
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleDiscard}>
                Discard
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) =>
          setConfirmDialog((prev) => ({ ...prev, open }))
        }
        onConfirm={confirmDialog.onConfirm}
        onCancel={confirmDialog.onCancel}
        title={confirmDialog.title}
        description={confirmDialog.description}
        variant={confirmDialog.variant}
      />

      {/* Padding for sticky save bar */}
      {totalDirtyCount > 0 && <div className="h-16" />}
    </>
  );
}
