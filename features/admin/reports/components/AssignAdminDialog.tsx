"use client";

import { useState } from "react";
import { UserCheck, Loader2 } from "lucide-react";
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

interface AssignAdminDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportId: string;
  onAssign: (reportId: string, adminId: string) => Promise<void>;
  isLoading?: boolean;
}

export function AssignAdminDialog({
  open,
  onOpenChange,
  reportId,
  onAssign,
  isLoading,
}: AssignAdminDialogProps) {
  const [adminId, setAdminId] = useState("");

  const handleAssign = async () => {
    if (!adminId.trim()) return;
    await onAssign(reportId, adminId.trim());
    setAdminId("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Administrator</DialogTitle>
          <DialogDescription>
            Assign this report to an administrator for investigation.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Admin User ID or Email</Label>
            <Input
              placeholder="Enter admin ID or email..."
              value={adminId}
              onChange={(e) => setAdminId(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={!adminId.trim() || isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <UserCheck className="h-4 w-4" />
            )}
            Assign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}