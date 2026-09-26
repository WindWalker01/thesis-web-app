import { Globe, Images } from "lucide-react";
import { Mode } from "../types";

interface ModeToggleProps {
  mode: Mode;
  onChange: (m: Mode) => void;
}

const MODES = [
  { key: "web", icon: Globe, label: "Search Web & Database" },
  { key: "compare", icon: Images, label: "Compare Two Images" },
] as const;

export function ModeToggle({ mode, onChange }: ModeToggleProps) {
  return (
    <div className="flex w-full flex-col gap-1 rounded-xl bg-muted p-1 sm:w-auto sm:flex-row sm:items-center">
      {MODES.map(({ key, icon: Icon, label }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 sm:w-auto sm:justify-start sm:px-4 sm:text-base ${
            mode === key
              ? "bg-background text-foreground shadow-sm border border-border"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Icon size={14} />
          {label}
        </button>
      ))}
    </div>
  );
}
