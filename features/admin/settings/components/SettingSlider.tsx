"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/client-utils";
import type { SettingValue } from "../types";

type SettingSliderProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: SettingValue) => void;
  disabled?: boolean;
};

export function SettingSlider({
  label,
  value,
  min,
  max,
  step = 1,
  unit,
  onChange,
  disabled,
}: SettingSliderProps) {
  const [localValue, setLocalValue] = useState(value);
  const id = `slider-${label.toLowerCase().replace(/\s+/g, "-")}`;

  const percentage = ((localValue - min) / (max - min)) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="font-normal">{label}</Label>
        <span className="text-sm font-medium text-foreground tabular-nums">
          {localValue}{unit && <span className="text-muted-foreground ml-0.5">{unit}</span>}
        </span>
      </div>
      <div className="relative">
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={localValue}
          onChange={(e) => {
            const val = Number(e.target.value);
            setLocalValue(val);
            onChange(val);
          }}
          disabled={disabled}
          className={cn(
            "h-2 w-full cursor-pointer appearance-none rounded-full bg-muted outline-none",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "[&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4",
            "[&::-webkit-slider-thumb]:appearance-none",
            "[&::-webkit-slider-thumb]:rounded-full",
            "[&::-webkit-slider-thumb]:bg-primary",
            "[&::-webkit-slider-thumb]:shadow-sm",
            "[&::-webkit-slider-thumb]:transition-colors",
            "[&::-webkit-slider-thumb]:hover:bg-primary/90",
            "[&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4",
            "[&::-moz-range-thumb]:appearance-none",
            "[&::-moz-range-thumb]:rounded-full",
            "[&::-moz-range-thumb]:bg-primary",
            "[&::-moz-range-thumb]:border-0",
            "[&::-moz-range-thumb]:shadow-sm"
          )}
          style={{
            background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${percentage}%, hsl(var(--muted)) ${percentage}%, hsl(var(--muted)) 100%)`,
          }}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={localValue}
        />
      </div>
    </div>
  );
}