"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  ImageIcon,
  FileText,
  BarChart3,
  Settings,
  ChevronLeft,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/client-utils";
import { Button } from "@/components/ui/button";

type SidebarProps = {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
};

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Artworks", href: "/admin/artworks", icon: ImageIcon },
  { label: "Reports", href: "/admin/reports", icon: FileText },
  { label: "Analytics", href: "#", icon: BarChart3 },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export function Sidebar({ isOpen, onToggle, onClose }: SidebarProps) {
  const pathname = usePathname();

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="border-border flex h-16 items-center gap-2 border-b px-4">
        <ShieldCheck className="h-6 w-6 text-primary" />
        <span className="text-base font-bold tracking-tight">Admin Panel</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="bg-primary ml-auto h-1.5 w-1.5 rounded-full"
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse button (desktop) */}
      <div className="border-border hidden border-t p-3 lg:block">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="w-full justify-start gap-2 text-muted-foreground"
        >
          <ChevronLeft
            className={cn(
              "h-4 w-4 transition-transform",
              !isOpen && "rotate-180"
            )}
          />
          <span className="text-xs">{isOpen ? "Collapse" : "Expand"}</span>
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "border-border hidden border-r bg-background transition-all duration-300 lg:block",
          isOpen ? "w-60" : "w-16"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 lg:hidden"
          onClick={onClose}
        >
          <aside
            className="h-full w-72 border-r bg-background"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}