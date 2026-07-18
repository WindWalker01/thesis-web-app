"use client";

import { useState, useEffect } from "react";

type MaintenanceCountdownProps = {
  endTime: string;
};

/**
 * Client-side countdown timer that shows remaining time until
 * scheduled maintenance ends.
 */
export function MaintenanceCountdown({ endTime }: MaintenanceCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    const end = new Date(endTime).getTime();

    function update() {
      const now = Date.now();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft("Ending soon…");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      } else if (minutes > 0) {
        setTimeLeft(`${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${seconds}s`);
      }
    }

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  if (!timeLeft) return null;

  return (
    <div className="text-center">
      <p className="text-xs text-muted-foreground mb-1">Estimated time remaining:</p>
      <p className="text-2xl font-mono font-bold tracking-wider text-foreground">
        {timeLeft}
      </p>
    </div>
  );
}