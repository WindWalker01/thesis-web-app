import { Globe, Images } from "lucide-react";
import { Mode } from "./../types";

interface ModeToggleProps {
  mode: Mode;
  onChange: (m: Mode) => void;
}

const MODES = [
  { key: "web", icon: Globe, label: "Search Web" },
  { key: "compare", icon: Images, label: "Compare Two Images" },
] as const;

export function ModeToggle({ mode, onChange }: ModeToggleProps) {
  return (
    <div className="bg-muted flex items-center gap-1 rounded-xl p-1">
      {MODES.map(({ key, icon: Icon, label }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
            mode === key
              ? "bg-background text-foreground border-border border shadow-sm"
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
