"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface ApproveReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportId: string;
  onSuccess: () => void;
}

export function ApproveReportDialog({
  open,
  onOpenChange,
  reportId,
  onSuccess,
}: ApproveReportDialogProps) {
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleApprove = async () => {
    if (!summary.trim()) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/reports/${reportId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summary: summary.trim() }),
      });
      const result = await response.json();
      if (result.success) {
        toast.success("Report approved successfully");
        setSummary("");
        onOpenChange(false);
        onSuccess();
      } else {
        toast.error(result.error?.message ?? "Failed to approve report");
      }
    } catch {
      toast.error("Failed to approve report");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Approve Report</DialogTitle>
          <DialogDescription>
            Mark this report as resolved with no violation found. The reporter will be notified.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Resolution Summary *</Label>
            <Textarea
              placeholder="Explain why no violation was found..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleApprove}
            disabled={!summary.trim() || isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            Approve Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}