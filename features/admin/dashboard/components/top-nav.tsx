"use client";

import { useState, useRef, useEffect } from "react";
import { Menu, Search, Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type TopNavProps = {
  onMenuClick: () => void;
  unreadCount: number;
};

export function TopNav({ onMenuClick, unreadCount }: TopNavProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="border-border sticky top-0 z-30 border-b bg-background/80 backdrop-blur-md">
      <div className="flex h-16 items-center gap-3 px-4 lg:px-6">
        {/* Mobile menu */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Search */}
        <div ref={searchRef} className="relative flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users, artworks, reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchOpen(true)}
              className="pl-9 h-9 text-sm bg-muted/50"
              aria-label="Global search"
            />
          </div>
          {searchOpen && searchQuery.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border bg-background p-3 shadow-lg">
              <p className="text-xs text-muted-foreground text-center py-4">
                Search results will appear here
              </p>
            </div>
          )}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Button>

          {/* Profile */}
          <Button variant="ghost" size="icon" aria-label="Admin profile">
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}