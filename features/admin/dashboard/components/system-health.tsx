"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/client-utils";
import type { SystemServiceStatus } from "../types";

type Props = {
  services: SystemServiceStatus[];
};

const statusIndicator = {
  healthy: { dot: "bg-green-500", text: "Healthy", pulse: true },
  warning: { dot: "bg-yellow-500", text: "Warning", pulse: false },
  offline: { dot: "bg-red-500", text: "Offline", pulse: false },
};

export function SystemHealth({ services }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">System Health</CardTitle>
        <p className="text-muted-foreground text-xs">Service status overview</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {services.map((service, i) => {
            const indicator = statusIndicator[service.status] ?? statusIndicator.offline;
            return (
              <motion.div
                key={service.name}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div
                      className={cn(
                        "h-2.5 w-2.5 rounded-full",
                        indicator.dot,
                        indicator.pulse && "animate-pulse"
                      )}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{service.name}</p>
                    {service.endpoint && (
                      <p className="text-[10px] text-muted-foreground max-w-[180px] truncate">
                        {service.endpoint}
                      </p>
                    )}
                  </div>
                </div>
                <span
                  className={cn(
                    "text-xs font-medium",
                    service.status === "healthy" && "text-green-500",
                    service.status === "warning" && "text-yellow-500",
                    service.status === "offline" && "text-red-500"
                  )}
                >
                  {indicator.text}
                </span>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}