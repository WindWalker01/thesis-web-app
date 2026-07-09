"use client";

import type { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SettingBadge } from "./SettingBadge";
import type { SettingBadgeType } from "../types";

type SettingCardProps = {
  title: string;
  description?: string;
  badge?: SettingBadgeType;
  children: ReactNode;
  className?: string;
};

export function SettingCard({ title, description, badge, children, className }: SettingCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          {badge && <SettingBadge type={badge} />}
        </div>
        {description && (
          <CardDescription className="text-sm">{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}