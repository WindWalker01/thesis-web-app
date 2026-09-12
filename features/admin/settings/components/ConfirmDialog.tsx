"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRef } from "react";

type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel?: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
};

export function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  title,
  description,
  confirmLabel = "Continue",
  cancelLabel = "Cancel",
  variant = "default",
}: ConfirmDialogProps) {
  // Tracks whether the close was triggered by Confirm, so `onCancel` only
  // fires for genuine dismissals (Cancel button, X, overlay click, Escape).
  const confirmedRef = useRef(false);

  const handleOpenChange = (open: boolean) => {
    if (!open && !confirmedRef.current) {
      onCancel?.();
    }
    if (open) confirmedRef.current = false;
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant === "destructive" ? "destructive" : "default"}
            onClick={() => {
              confirmedRef.current = true;
              onConfirm();
              // Reset immediately so a re-opened dialog starts clean.
              confirmedRef.current = false;
              onOpenChange(false);
            }}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}