"use client";

import { memo } from "react";
import { Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatTimeAgo } from "@/lib/client-utils";
import type { ReviewAction } from "../../types";

interface ActivityFeedSectionProps {
  actions: ReviewAction[];
}

export const ActivityFeedSection = memo(function ActivityFeedSection({ actions }: ActivityFeedSectionProps) {
  if (actions.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-64">
          <div className="space-y-3">
            {actions.map((action) => (
              <div key={action.id} className="flex items-start gap-2">
                <div className="mt-0.5 h-2 w-2 rounded-full bg-muted-foreground/30 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-medium capitalize">
                    {action.action.replace(/_/g, " ")}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {action.admin.first_name} {action.admin.last_name} &middot;{" "}
                    {formatTimeAgo(action.created_at)}
                  </p>
                  {action.notes && (
                    <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">
                      {action.notes}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
});