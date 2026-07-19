"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Upload,
  AlertTriangle,
  Hash,
  ShieldCheck,
  Bell,
  UserCheck,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/client-utils";
import type { ActivityItem } from "../types";

type Props = {
  activities: ActivityItem[];
};

const activityConfig = {
  upload: { icon: Upload, color: "text-blue-500", bg: "bg-blue-500/10" },
  report: { icon: AlertTriangle, color: "text-orange-500", bg: "bg-orange-500/10" },
  blockchain: { icon: Hash, color: "text-cyan-500", bg: "bg-cyan-500/10" },
  admin: { icon: ShieldCheck, color: "text-purple-500", bg: "bg-purple-500/10" },
  verify: { icon: UserCheck, color: "text-green-500", bg: "bg-green-500/10" },
  system: { icon: Bell, color: "text-muted-foreground", bg: "bg-muted/50" },
};

export function ActivityFeed({ activities }: Props) {
  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Bell className="mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No recent activities.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="text-base">Recent Activity</CardTitle>
        <p className="text-muted-foreground text-xs">Latest platform events</p>
      </CardHeader>
      <CardContent>
        <div className="max-h-[50vh] overflow-y-auto space-y-1">
          {activities.map((activity, i) => {
            const config = activityConfig[activity.type] ?? activityConfig.system;
            const Icon = config.icon;
            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04, duration: 0.2 }}
                className="border-border flex items-start gap-3 border-b py-3 last:border-0"
              >
                <div
                  className={cn(
                    "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                    config.bg
                  )}
                >
                  <Icon className={cn("h-4 w-4", config.color)} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-snug line-clamp-2">
                    {activity.description}
                  </p>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {activity.timestamp}
                    </span>
                    {activity.link && (
                      <Link
                        href={activity.link}
                        className="inline-flex items-center gap-0.5 text-xs text-primary hover:underline shrink-0"
                      >
                        View <ExternalLink className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}