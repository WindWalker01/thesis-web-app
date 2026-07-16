"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

type SettingToggleProps = {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
};

export function SettingToggle({ label, value, onChange, disabled }: SettingToggleProps) {
  const id = `toggle-${label.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div className="flex items-center justify-between gap-4">
      <Label htmlFor={id} className="cursor-pointer font-normal">
        {label}
      </Label>
      <Switch
        id={id}
        checked={value}
        onCheckedChange={onChange}
        disabled={disabled}
      />
    </div>
  );
}