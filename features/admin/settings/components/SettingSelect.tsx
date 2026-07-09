"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { SettingOption, SettingValue } from "../types";

type SettingSelectProps = {
  label: string;
  value: string;
  options: SettingOption[];
  onChange: (value: SettingValue) => void;
  disabled?: boolean;
};

export function SettingSelect({
  label,
  value,
  options,
  onChange,
  disabled,
}: SettingSelectProps) {
  const id = `select-${label.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Select value={String(value)} onValueChange={(v) => onChange(v)} disabled={disabled}>
        <SelectTrigger id={id} className="w-full">
          <SelectValue placeholder="Select..." />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}