"use client";

import { Button } from "@/components/ui/button";
import { Save, X } from "lucide-react";

type UnsavedChangesBarProps = {
  count: number;
  onSave: () => void;
  onDiscard: () => void;
  isSaving?: boolean;
};

export function UnsavedChangesBar({ count, onSave, onDiscard, isSaving }: UnsavedChangesBarProps) {
  if (count === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-md shadow-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-6">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{count}</span> unsaved change{count !== 1 ? "s" : ""}
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onDiscard} className="gap-2">
            <X className="h-4 w-4" />
            Discard
          </Button>
          <Button size="sm" onClick={onSave} disabled={isSaving} className="gap-2">
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}