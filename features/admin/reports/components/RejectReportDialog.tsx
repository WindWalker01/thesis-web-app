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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface RejectReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportId: string;
  onSuccess: () => void;
}

const REJECT_REASONS = [
  { value: "false_report", label: "False Report" },
  { value: "duplicate", label: "Duplicate" },
  { value: "insufficient_evidence", label: "Insufficient Evidence" },
  { value: "other", label: "Other" },
];

export function RejectReportDialog({
  open,
  onOpenChange,
  reportId,
  onSuccess,
}: RejectReportDialogProps) {
  const [reason, setReason] = useState("");
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleReject = async () => {
    if (!reason || !summary.trim()) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/reports/${reportId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason, summary: summary.trim() }),
      });
      const result = await response.json();
      if (result.success) {
        toast.success("Report rejected successfully");
        setReason("");
        setSummary("");
        onOpenChange(false);
        onSuccess();
      } else {
        toast.error(result.error?.message ?? "Failed to reject report");
      }
    } catch {
      toast.error("Failed to reject report");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject Report</DialogTitle>
          <DialogDescription>
            Reject this report with a reason. The reporter will be notified.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Rejection Reason *</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason..." />
              </SelectTrigger>
              <SelectContent>
                {REJECT_REASONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Summary *</Label>
            <Textarea
              placeholder="Explain why this report is being rejected..."
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
            variant="destructive"
            onClick={handleReject}
            disabled={!reason || !summary.trim() || isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            Reject Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}