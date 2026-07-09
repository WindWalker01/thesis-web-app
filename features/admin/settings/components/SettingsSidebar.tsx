"use client";

import { cn } from "@/lib/client-utils";
import type { SettingsCategory } from "../types";
import { SettingsSearch } from "./SettingsSearch";
import {
  Settings2,
  ImageIcon,
  SearchIcon,
  ShieldCheck,
  LinkIcon,
  UsersIcon,
  FlagIcon,
  BellIcon,
  LockIcon,
  HardDriveIcon,
  WrenchIcon,
  InfoIcon,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Settings2,
  ImageIcon,
  SearchIcon,
  ShieldCheck,
  LinkIcon,
  UsersIcon,
  FlagIcon,
  BellIcon,
  LockIcon,
  HardDriveIcon,
  WrenchIcon,
  InfoIcon,
};

type SettingsSidebarProps = {
  categories: SettingsCategory[];
  activeCategory: string;
  onCategoryChange: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onImportExport: () => void;
  className?: string;
};

export function SettingsSidebar({
  categories,
  activeCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  onImportExport,
  className,
}: SettingsSidebarProps) {
  return (
    <aside className={cn("space-y-4", className)}>
      <SettingsSearch value={searchQuery} onChange={onSearchChange} />

      <nav className="space-y-1" role="navigation" aria-label="Settings categories">
        {categories.map((category) => {
          const Icon = iconMap[category.icon] ?? Settings2;
          const isActive = activeCategory === category.id;

          return (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              aria-current={isActive ? "true" : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1 truncate">{category.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="border-t border-border pt-4">
        <button
          onClick={onImportExport}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Settings2 className="h-4 w-4 shrink-0" />
          <span>Import / Export</span>
        </button>
      </div>
    </aside>
  );
}