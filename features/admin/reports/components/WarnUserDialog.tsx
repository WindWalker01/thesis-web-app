"use client";

import { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
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

interface WarnUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportId: string;
  userId?: string;
  onSuccess: () => void;
}

export function WarnUserDialog({
  open,
  onOpenChange,
  reportId,
  userId,
  onSuccess,
}: WarnUserDialogProps) {
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleWarn = async () => {
    if (!reason.trim()) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/reports/${reportId}/warn-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, reason: reason.trim() }),
      });
      const result = await response.json();
      if (result.success) {
        toast.success("User warned successfully");
        setReason("");
        onOpenChange(false);
        onSuccess();
      } else {
        toast.error(result.error?.message ?? "Failed to warn user");
      }
    } catch {
      toast.error("Failed to warn user");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Warn User</DialogTitle>
          <DialogDescription>
            Issue a warning to this user. The warning will be recorded and the user will be notified.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Warning Reason *</Label>
            <Textarea
              placeholder="Explain why this user is being warned..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleWarn}
            disabled={!reason.trim() || isLoading}
            className="gap-2"
            variant="secondary"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            Warn User
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}