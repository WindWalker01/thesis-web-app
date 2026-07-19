"use client";

import { useState } from "react";
import { Clock, Loader2 } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface SuspendUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportId: string;
  onSuccess: () => void;
}

export function SuspendUserDialog({
  open,
  onOpenChange,
  reportId,
  onSuccess,
}: SuspendUserDialogProps) {
  const [reason, setReason] = useState("");
  const [duration, setDuration] = useState("temporary");
  const [durationDays, setDurationDays] = useState(7);
  const [isLoading, setIsLoading] = useState(false);

  const handleSuspend = async () => {
    if (!reason.trim()) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/reports/${reportId}/suspend-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: reason.trim(),
          duration,
          duration_days: duration === "temporary" ? durationDays : undefined,
        }),
      });
      const result = await response.json();
      if (result.success) {
        toast.success("User suspended successfully");
        setReason("");
        onOpenChange(false);
        onSuccess();
      } else {
        toast.error(result.error?.message ?? "Failed to suspend user");
      }
    } catch {
      toast.error("Failed to suspend user");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Suspend User</DialogTitle>
          <DialogDescription>
            Temporarily or permanently suspend this user. They will be notified and unable to access the platform.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Suspension Duration *</Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="temporary">Temporary</SelectItem>
                <SelectItem value="permanent">Permanent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {duration === "temporary" && (
            <div className="space-y-2">
              <Label>Duration (days) *</Label>
              <Input
                type="number"
                min={1}
                max={365}
                value={durationDays}
                onChange={(e) => setDurationDays(parseInt(e.target.value) || 7)}
              />
            </div>
          )}
          <div className="space-y-2">
            <Label>Suspension Reason *</Label>
            <Textarea
              placeholder="Explain why this user is being suspended..."
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
            variant="destructive"
            onClick={handleSuspend}
            disabled={!reason.trim() || isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Clock className="h-4 w-4" />
            )}
            {duration === "temporary" ? "Suspend Temporarily" : "Suspend Permanently"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}