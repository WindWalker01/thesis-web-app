"use client";

import { useState } from "react";
import { XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface CloseReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportId: string;
  onSuccess: () => void;
}

export function CloseReportDialog({
  open,
  onOpenChange,
  reportId,
  onSuccess,
}: CloseReportDialogProps) {
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/reports/${reportId}/close`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: notes.trim() || undefined }),
      });
      const result = await response.json();
      if (result.success) {
        toast.success("Report closed successfully");
        setNotes("");
        onOpenChange(false);
        onSuccess();
      } else {
        toast.error(result.error?.message ?? "Failed to close report");
      }
    } catch {
      toast.error("Failed to close report");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Close Report</DialogTitle>
          <DialogDescription>
            Close this report without taking further action. The reporter will be notified.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Closing Notes (optional)</Label>
            <Input
              placeholder="Reason for closing..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleClose}
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            Close Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}