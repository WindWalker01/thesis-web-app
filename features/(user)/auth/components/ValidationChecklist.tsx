"use client";

import { CheckCircle2, CircleX } from "lucide-react";

interface ValidationRule {
  label: string;
  passed: boolean;
}

interface ValidationChecklistProps {
  rules: ValidationRule[];
}

export function ValidationChecklist({ rules }: ValidationChecklistProps) {
  return (
    <div className="mt-2 space-y-1">
      {rules.map((rule) => (
        <div key={rule.label} className="flex items-center gap-2 text-xs">
          {rule.passed ? (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          ) : (
            <CircleX className="h-4 w-4 text-gray-400" />
          )}

          <span className={rule.passed ? "text-green-500" : "text-gray-500"}>
            {rule.label}
          </span>
        </div>
      ))}
    </div>
  );
}
