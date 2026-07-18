"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SettingDateTimeProps = {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
};

/**
 * A datetime-local input for scheduled maintenance start/end times.
 * Accepts and returns ISO 8601 strings.
 */
export function SettingDateTime({
  label,
  value,
  placeholder,
  onChange,
}: SettingDateTimeProps) {
  // Convert ISO string to datetime-local format (YYYY-MM-DDTHH:MM)
  const toDatetimeLocal = (iso: string): string => {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return "";
      // Format as YYYY-MM-DDTHH:MM (local time)
      const pad = (n: number) => n.toString().padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch {
      return "";
    }
  };

  // Convert datetime-local string back to ISO 8601
  const toIso = (local: string): string => {
    if (!local) return "";
    try {
      const d = new Date(local);
      return isNaN(d.getTime()) ? local : d.toISOString();
    } catch {
      return local;
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        type="datetime-local"
        value={toDatetimeLocal(value)}
        placeholder={placeholder}
        onChange={(e) => onChange(toIso(e.target.value))}
        className="w-full"
      />
    </div>
  );
}