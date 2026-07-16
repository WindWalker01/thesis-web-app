"use client";

import { useState, useCallback, useEffect } from "react";
import { AlertTriangle, RefreshCw, RotateCcw, Settings2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSettings, updateSettings, resetCategoryDefaults } from "../server/settings";
import type { SettingValue, SettingDefinition } from "../types";
import { SETTINGS_CATEGORIES, DEFAULT_SETTINGS, getSettingByKey } from "../constants";
import { SettingsPageSkeleton } from "./page-skeleton";
import { SettingCard } from "./SettingCard";
import { SettingInput } from "./SettingInput";
import { SettingToggle } from "./SettingToggle";
import { SettingSlider } from "./SettingSlider";
import { SettingSelect } from "./SettingSelect";
import { ConfirmDialog } from "./ConfirmDialog";

export default function SettingsPage() {
  // Data state
  const [settings, setSettings] = useState<Record<string, SettingValue> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [activeTab, setActiveTab] = useState("general");
  const [dirtyChanges, setDirtyChanges] = useState<Map<string, SettingValue>>(new Map());
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    variant?: "default" | "destructive";
  }>({ open: false, title: "", description: "", onConfirm: () => {} });

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
    [settings, dirtyChanges]
  );

  // Helper: get setting definition
  const getSettingDef = useCallback((key: string): SettingDefinition | undefined => {
    return getSettingByKey(key);
  }, []);

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
        });
        return;
      }

      setDirtyChanges((prev) => {
        const next = new Map(prev);
        next.set(key, value);
        return next;
      });
    },
    [getSettingDef]
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
      toast.error(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  }, [dirtyChanges, fetchSettings]);

  // Handle discard
  const handleDiscard = useCallback(() => {
    setDirtyChanges(new Map());
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
          toast.error(err instanceof Error ? err.message : "Failed to reset settings");
        } finally {
          setIsResetting(false);
        }
      },
    });
  }, [activeTab, fetchSettings]);

  // Render a single setting field
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
                value={Number(value)}
                min={setting.min ?? 0}
                max={setting.max ?? 100}
                step={setting.step}
                unit={setting.unit}
                onChange={(v) => handleChange(setting.key, Number(v))}
              />
              <p className="text-xs text-muted-foreground">{setting.description}</p>
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
              <p className="text-xs text-muted-foreground">{setting.description}</p>
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
              <p className="text-xs text-muted-foreground">{setting.description}</p>
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
              <p className="text-xs text-muted-foreground">{setting.description}</p>
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
              <p className="text-xs text-muted-foreground">{setting.description}</p>
            </div>
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
              <p className="text-xs text-muted-foreground">{setting.description}</p>
            </div>
          );
      }
    },
    [getValue, handleChange]
  );

  const totalDirtyCount = dirtyChanges.size;

  // Loading state
  if (isLoading) {
    return <SettingsPageSkeleton />;
  }

  // Error state
  if (error || !settings) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="max-w-md text-center space-y-4">
          <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
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
      <div className="border-b border-border bg-card px-4 py-3">
        <div className="flex items-center gap-3">
          <Settings2 className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-bold tracking-tight sm:text-xl">System Settings</h1>
          <Badge variant="secondary" className="text-xs">
            4 categories
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-0.5">
          Platform configuration and administration
        </p>
      </div>

      <div className="p-4 lg:p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-6">
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
            <TabsContent key={category.id} value={category.id} className="space-y-6 mt-0">
              <div className="space-y-1">
                <h2 className="text-xl font-bold tracking-tight">{category.label}</h2>
                <p className="text-sm text-muted-foreground">{category.description}</p>
              </div>
              <Separator />
              {category.settings.map((setting) => (
                <SettingCard
                  key={setting.key}
                  title={setting.label}
                  description={setting.description}
                  badge={setting.badge}
                >
                  {renderSetting(setting)}
                </SettingCard>
              ))}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Unsaved Changes Bar */}
      {totalDirtyCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card px-4 py-3 shadow-lg">
          <div className="mx-auto flex max-w-5xl items-center justify-between">
            <p className="text-sm text-muted-foreground">
              You have <span className="font-semibold text-foreground">{totalDirtyCount}</span> unsaved change(s).
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
        onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        description={confirmDialog.description}
        variant={confirmDialog.variant}
      />

      {/* Padding for sticky save bar */}
      {totalDirtyCount > 0 && <div className="h-16" />}
    </>
  );
}