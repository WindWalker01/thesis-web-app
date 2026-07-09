"use client";

import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Download, Upload, AlertTriangle } from "lucide-react";
import { exportSettings, importSettings } from "../server/settings";
import type { SettingValue } from "../types";

type ImportExportDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

export function ImportExportDialog({ open, onOpenChange, onSuccess }: ImportExportDialogProps) {
  const [mode, setMode] = useState<"export" | "import">("export");
  const [exportData, setExportData] = useState<string>("");
  const [importData, setImportData] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await exportSettings();
      if (result.success && result.data) {
        const json = JSON.stringify(result.data, null, 2);
        setExportData(json);
        // Download as file
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `settings-export-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("Settings exported successfully");
      } else {
        setError(result.message ?? "Failed to export settings");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setImportData(content);
      setError(null);
    };
    reader.onerror = () => {
      setError("Failed to read file");
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!importData.trim()) {
      setError("Please provide JSON data to import");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const parsed = JSON.parse(importData) as Record<string, SettingValue>;
      const result = await importSettings(parsed);
      if (result.success) {
        toast.success(result.message);
        onSuccess();
        onOpenChange(false);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err instanceof Error ? `Invalid JSON: ${err.message}` : "Import failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMode("export");
    setExportData("");
    setImportData("");
    setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{mode === "export" ? "Export Settings" : "Import Settings"}</DialogTitle>
          <DialogDescription>
            {mode === "export"
              ? "Download all settings as a JSON file for backup or transfer."
              : "Upload a JSON file to restore or apply settings."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2">
          <Button
            variant={mode === "export" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("export")}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button
            variant={mode === "import" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("import")}
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            Import
          </Button>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {mode === "export" ? (
          <div className="space-y-4">
            <Textarea
              value={exportData}
              readOnly
              rows={12}
              className="font-mono text-xs"
              placeholder="Click 'Export' to generate settings data..."
            />
            <Button onClick={handleExport} disabled={isLoading} className="gap-2">
              <Download className="h-4 w-4" />
              {isLoading ? "Exporting..." : "Export & Download"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                Choose File
              </Button>
              <span className="text-sm text-muted-foreground">
                {importData ? "File loaded" : "Select a .json file"}
              </span>
            </div>
            <Textarea
              value={importData}
              onChange={(e) => {
                setImportData(e.target.value);
                setError(null);
              }}
              rows={12}
              className="font-mono text-xs"
              placeholder="Or paste JSON data here..."
            />
            <Button onClick={handleImport} disabled={isLoading} className="gap-2">
              <Upload className="h-4 w-4" />
              {isLoading ? "Importing..." : "Import Settings"}
            </Button>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleReset}>
            Reset
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}