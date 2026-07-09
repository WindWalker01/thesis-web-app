"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { AlertTriangle, RefreshCw, RotateCcw, Download, Settings2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getSettings, updateSettings, resetCategoryDefaults, getStorageMetrics, getSystemInfo } from "../server/settings";
import type { SettingValue, SettingDefinition, SettingsCategory } from "../types";
import { SETTINGS_CATEGORIES, DEFAULT_SETTINGS, getSettingByKey, CRITICAL_SETTING_KEYS } from "../constants";
import { SettingsSidebar } from "./SettingsSidebar";
import { UnsavedChangesBar } from "./UnsavedChangesBar";
import { SettingsPageSkeleton } from "./page-skeleton";
import { SettingCard } from "./SettingCard";
import { SettingInput } from "./SettingInput";
import { SettingToggle } from "./SettingToggle";
import { SettingSlider } from "./SettingSlider";
import { SettingSelect } from "./SettingSelect";
import { ConfirmDialog } from "./ConfirmDialog";
import { ImportExportDialog } from "./ImportExportDialog";
import type { StorageMetrics, SystemInfo } from "../types";

export default function SettingsPage() {
  // Data state
  const [settings, setSettings] = useState<Record<string, SettingValue> | null>(null);
  const [storageMetrics, setStorageMetrics] = useState<StorageMetrics | null>(null);
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [activeCategory, setActiveCategory] = useState("general");
  const [searchQuery, setSearchQuery] = useState("");
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

  const [importExportOpen, setImportExportOpen] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);

  // Fetch settings on mount
  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [settingsData, metricsData, sysInfoData] = await Promise.all([
        getSettings(),
        getStorageMetrics(),
        getSystemInfo(),
      ]);
      setSettings(settingsData);
      setStorageMetrics(metricsData);
      setSystemInfo(sysInfoData);
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

  // Handle restore defaults for current category
  const handleRestoreDefaults = useCallback(() => {
    const category = SETTINGS_CATEGORIES.find((c) => c.id === activeCategory);
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
          setRestoreDialogOpen(false);
        }
      },
    });
  }, [activeCategory, fetchSettings]);

  // Filter categories based on search
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return SETTINGS_CATEGORIES;

    const query = searchQuery.toLowerCase();
    return SETTINGS_CATEGORIES.map((cat) => ({
      ...cat,
      settings: cat.settings.filter(
        (s) =>
          s.label.toLowerCase().includes(query) ||
          s.description.toLowerCase().includes(query) ||
          s.key.toLowerCase().includes(query)
      ),
    })).filter((cat) => cat.settings.length > 0);
  }, [searchQuery]);

  // Get active category data
  const activeCategoryData = useMemo(() => {
    return filteredCategories.find((c) => c.id === activeCategory) ?? filteredCategories[0];
  }, [filteredCategories, activeCategory]);

  // Redirect if active category not in filtered
  useEffect(() => {
    if (filteredCategories.length > 0 && !filteredCategories.find((c) => c.id === activeCategory)) {
      setActiveCategory(filteredCategories[0].id);
    }
  }, [filteredCategories, activeCategory]);

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

        case "readonly":
          return (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{setting.label}</span>
                <span className="text-sm text-muted-foreground">{String(value)}</span>
              </div>
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

  // Override readonly settings with fetched data
  if (storageMetrics) {
    // These are display-only
  }

  return (
    <>
      {/* Top Bar */}
      <div className="border-b border-border bg-card px-4 py-3">
        <div className="flex items-center gap-3">
          <Settings2 className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-bold tracking-tight sm:text-xl">System Settings</h1>
          <Badge variant="secondary" className="text-xs">
            {Object.keys(settings).length} settings
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-0.5">
          Platform configuration and administration
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 p-4 lg:p-6">
        {/* Sidebar - Desktop: visible, Mobile: hidden (uses tabs instead) */}
        <div className="hidden lg:block w-60 shrink-0">
          <div className="sticky top-20">
            <SettingsSidebar
              categories={filteredCategories}
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onImportExport={() => setImportExportOpen(true)}
            />
          </div>
        </div>

        {/* Mobile category selector */}
        <div className="lg:hidden space-y-4">
          <SettingsSidebar
            categories={filteredCategories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onImportExport={() => setImportExportOpen(true)}
          />
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Category header */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight">
                {activeCategoryData?.label ?? "Settings"}
              </h2>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setImportExportOpen(true)}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Import / Export</span>
                </Button>
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
            <p className="text-sm text-muted-foreground">
              {activeCategoryData?.description ?? ""}
            </p>
          </div>

          <Separator />

          {/* Setting cards */}
          {activeCategoryData?.settings.map((setting) => (
            <SettingCard
              key={setting.key}
              title={setting.label}
              description={setting.description}
              badge={setting.badge}
            >
              {renderSetting(setting)}
            </SettingCard>
          ))}

          {/* No results state */}
          {activeCategoryData?.settings.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Settings2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium">No settings found</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {searchQuery
                  ? `No settings match "${searchQuery}" in this category.`
                  : "This category has no configurable settings."}
              </p>
              {searchQuery && (
                <Button variant="link" onClick={() => setSearchQuery("")} className="mt-2">
                  Clear search
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Unsaved Changes Bar */}
      <UnsavedChangesBar
        count={dirtyChanges.size}
        onSave={handleSave}
        onDiscard={handleDiscard}
        isSaving={isSaving}
      />

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        description={confirmDialog.description}
        variant={confirmDialog.variant}
      />

      {/* Import / Export Dialog */}
      <ImportExportDialog
        open={importExportOpen}
        onOpenChange={setImportExportOpen}
        onSuccess={() => fetchSettings()}
      />

      {/* Padding for sticky save bar */}
      {dirtyChanges.size > 0 && <div className="h-20" />}
    </>
  );
}