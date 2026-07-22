"use client";

import { MoreHorizontal, Eye, Clock, AlertTriangle, Ban } from "lucide-react";
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
  onWarnUser: (id: string) => void;
  onSuspendUser: (id: string) => void;
  onBanUser: (id: string) => void;
}

export function ReportActionsDropdown({
  reportId,
  onView,
  onAssign,
  onWarnUser,
  onSuspendUser,
  onBanUser,
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
          <Clock className="mr-2 h-4 w-4" /> Assign Admin
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>User Moderation</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => onWarnUser(reportId)}>
          <AlertTriangle className="mr-2 h-4 w-4" /> Warn User
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSuspendUser(reportId)}>
          <Clock className="mr-2 h-4 w-4" /> Suspend User
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onBanUser(reportId)}>
          <Ban className="mr-2 h-4 w-4" /> Ban User
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
