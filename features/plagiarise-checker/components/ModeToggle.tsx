import { Globe, Images } from "lucide-react";
import { Mode } from "./types";

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
    <div className="flex items-center gap-1 bg-muted p-1 rounded-xl">
      {MODES.map(({ key, icon: Icon, label }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
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
