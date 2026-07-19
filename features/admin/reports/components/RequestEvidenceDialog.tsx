"use client";

import { useState } from "react";
import { MessageSquare, Loader2 } from "lucide-react";
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

interface RequestEvidenceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportId: string;
  onSuccess: () => void;
}

export function RequestEvidenceDialog({
  open,
  onOpenChange,
  reportId,
  onSuccess,
}: RequestEvidenceDialogProps) {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRequest = async () => {
    if (!message.trim()) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/reports/${reportId}/request-evidence`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message.trim() }),
      });
      const result = await response.json();
      if (result.success) {
        toast.success("Evidence requested successfully");
        setMessage("");
        onOpenChange(false);
        onSuccess();
      } else {
        toast.error(result.error?.message ?? "Failed to request evidence");
      }
    } catch {
      toast.error("Failed to request evidence");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request Additional Evidence</DialogTitle>
          <DialogDescription>
            Request the reporter to provide additional evidence. They will be notified.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Message to Reporter *</Label>
            <Textarea
              placeholder="Describe what evidence is needed and why..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleRequest}
            disabled={!message.trim() || isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MessageSquare className="h-4 w-4" />
            )}
            Request Evidence
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}