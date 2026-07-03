"use client";

import { motion } from "framer-motion";
import { Bell, AlertTriangle, Hash, UserPlus, ScanSearch, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/client-utils";
import type { AdminNotification } from "../types";

type Props = {
  notifications: AdminNotification[];
};

const iconMap: Record<string, typeof Bell> = {
  report_submitted: AlertTriangle,
  blockchain_recorded: Hash,
  artwork_registered: UserPlus,
  scan_completed: ScanSearch,
  scan_flagged: ShieldAlert,
  scan_failed: ShieldAlert,
  system_announcement: Bell,
};

const colorMap: Record<string, string> = {
  report_submitted: "text-orange-500",
  blockchain_recorded: "text-cyan-500",
  artwork_registered: "text-blue-500",
  scan_completed: "text-green-500",
  scan_flagged: "text-red-500",
  scan_failed: "text-red-500",
  system_announcement: "text-purple-500",
};

export function AdminNotifications({ notifications }: Props) {
  if (notifications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Bell className="mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No notifications.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Notifications</CardTitle>
        <p className="text-muted-foreground text-xs">Recent admin notifications</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {notifications.map((notification, i) => {
            const Icon = iconMap[notification.type] ?? Bell;
            const color = colorMap[notification.type] ?? "text-muted-foreground";
            return (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={cn(
                  "flex items-start gap-3 rounded-xl p-3 transition-colors",
                  !notification.is_read
                    ? "bg-accent/5 border border-accent/20"
                    : "hover:bg-muted/50"
                )}
              >
                <div className="relative mt-0.5">
                  <Icon className={cn("h-4 w-4", color)} />
                  {!notification.is_read && (
                    <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-accent" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{notification.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                    {notification.message}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {notification.created_at}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}