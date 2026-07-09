"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

type SettingsSearchProps = {
  value: string;
  onChange: (value: string) => void;
};

export function SettingsSearch({ value, onChange }: SettingsSearchProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search all settings..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10"
        aria-label="Search settings"
      />
    </div>
  );
}