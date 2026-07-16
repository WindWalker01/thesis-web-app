"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/client-utils";
import type { SettingFieldType, SettingValue } from "../types";

type SettingInputProps = {
  label: string;
  value: SettingValue;
  type: SettingFieldType;
  placeholder?: string;
  onChange: (value: SettingValue) => void;
  error?: string;
  disabled?: boolean;
};

export function SettingInput({
  label,
  value,
  type,
  placeholder,
  onChange,
  error,
  disabled,
}: SettingInputProps) {
  const id = `setting-${label.toLowerCase().replace(/\s+/g, "-")}`;

  if (type === "textarea") {
    return (
      <div className="space-y-2">
        <Label htmlFor={id}>{label}</Label>
        <Textarea
          id={id}
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(error && "border-destructive")}
          rows={3}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    );
  }

  if (type === "email") {
    return (
      <div className="space-y-2">
        <Label htmlFor={id}>{label}</Label>
        <Input
          id={id}
          type="email"
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(error && "border-destructive")}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    );
  }

  if (type === "number") {
    return (
      <div className="space-y-2">
        <Label htmlFor={id}>{label}</Label>
        <Input
          id={id}
          type="number"
          value={String(value ?? "")}
          onChange={(e) => {
            const val = e.target.value;
            onChange(val === "" ? 0 : Number(val));
          }}
          placeholder={placeholder}
          disabled={disabled}
          className={cn("w-32", error && "border-destructive")}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="text"
        value={String(value ?? "")}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(error && "border-destructive")}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}