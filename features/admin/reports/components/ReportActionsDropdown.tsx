"use client";

import { MoreHorizontal, Eye, Clock, CheckCircle2, XCircle, AlertTriangle, Ban, UserX, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ReportActionsDropdownProps {
  reportId: string;
  onView: (id: string) => void;
  onAssign: (id: string) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onRequestEvidence: (id: string) => void;
  onWarnUser: (id: string) => void;
  onSuspendUser: (id: string) => void;
  onBanUser: (id: string) => void;
  onClose: (id: string) => void;
}

export function ReportActionsDropdown({
  reportId,
  onView,
  onAssign,
  onApprove,
  onReject,
  onRequestEvidence,
  onWarnUser,
  onSuspendUser,
  onBanUser,
  onClose,
}: ReportActionsDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => onView(reportId)}>
          <Eye className="mr-2 h-4 w-4" /> View Details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onAssign(reportId)}>
          <UserX className="mr-2 h-4 w-4" /> Assign Admin
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Resolution</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => onApprove(reportId)}>
          <CheckCircle2 className="mr-2 h-4 w-4" /> Approve Report
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onReject(reportId)}>
          <XCircle className="mr-2 h-4 w-4" /> Reject Report
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onRequestEvidence(reportId)}>
          <MessageSquare className="mr-2 h-4 w-4" /> Request Evidence
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>User Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => onWarnUser(reportId)}>
          <AlertTriangle className="mr-2 h-4 w-4" /> Warn User
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSuspendUser(reportId)}>
          <Clock className="mr-2 h-4 w-4" /> Suspend User
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onBanUser(reportId)}>
          <Ban className="mr-2 h-4 w-4" /> Ban User
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onClose(reportId)}>
          <XCircle className="mr-2 h-4 w-4" /> Close Report
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}