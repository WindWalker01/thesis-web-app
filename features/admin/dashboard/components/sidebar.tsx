"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  ImageIcon,
  FileText,
  ChevronLeft,
  Settings2,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/client-utils";
import { Button } from "@/components/ui/button";
import { usePendingReviewCount } from "@/features/admin/artwork-verification/hooks/useReviews";

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
  { label: "Artwork Verification", href: "/admin/artwork-verification", icon: ShieldCheck },
  { label: "Settings", href: "/admin/settings", icon: Settings2 },
];

export function Sidebar({ isOpen, onToggle, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { data: pendingCount = 0 } = usePendingReviewCount();

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="border-border flex h-16 items-center gap-2 border-b px-4">
        <ShieldCheck className="h-6 w-6 text-primary shrink-0" />
        <span className={cn("text-base font-bold tracking-tight transition-opacity duration-200", !isOpen && "opacity-0 w-0 overflow-hidden")}>
          Admin Dashboard
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const showBadge = item.label === "Artwork Verification" && pendingCount > 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                !isOpen && "justify-center px-2",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className={cn("flex-1 transition-opacity duration-200", !isOpen && "opacity-0 w-0 overflow-hidden")}>
                {item.label}
              </span>
              {showBadge && (
                <span className={cn("flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground transition-opacity duration-200", !isOpen && "opacity-0 w-0 overflow-hidden")}>
                  {pendingCount}
                </span>
              )}
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className={cn("bg-primary h-1.5 w-1.5 rounded-full transition-opacity duration-200", !isOpen && "hidden")}
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
          className={cn("w-full gap-2 text-muted-foreground", isOpen ? "justify-start" : "justify-center")}
        >
          <ChevronLeft
            className={cn(
              "h-4 w-4 transition-transform shrink-0",
              !isOpen && "rotate-180"
            )}
          />
          <span className={cn("text-xs transition-opacity duration-200", !isOpen && "opacity-0 w-0 overflow-hidden")}>
            {isOpen ? "Collapse" : "Expand"}
          </span>
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