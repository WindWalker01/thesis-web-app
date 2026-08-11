"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useState, useSyncExternalStore } from "react";
import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  LayoutDashboard,
  Loader2,
  LogOut,
  Settings,
  Users,
  ImageIcon,
  FileText,
  ChevronLeft,
  Settings2,
  ShieldCheck,
  User as UserIcon,
  PanelLeftIcon,
} from "lucide-react";
import { cn } from "@/lib/client-utils";
import { Button } from "@/components/ui/button";
import { usePendingReviewCount } from "@/features/admin/artwork-verification/hooks/useReviews";
import { useAuth } from "@/features/(user)/auth/hooks/useAuth";
import { useSiteSettings } from "../../settings/lib/use-site-settings";
import { DEFAULT_SETTINGS } from "@/features/admin/settings/constants";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { clearQueryCache } from "@/providers/react-query-provider";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Artworks", href: "/admin/artworks", icon: ImageIcon },
  { label: "Reports", href: "/admin/reports", icon: FileText },
  {
    label: "Artwork Verification",
    href: "/admin/artwork-verification",
    icon: ShieldCheck,
  },
  { label: "Settings", href: "/admin/settings", icon: Settings2 },
];

const DEFAULT_LOGO = DEFAULT_SETTINGS.platform_logo_url as string;

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { data: pendingCount = 0 } = usePendingReviewCount();
  const { user, signOut } = useAuth();
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const [isPending, setIsPending] = useState(false);
  const { settings } = useSiteSettings();
  const logoUrl = settings.platform_logo_url || DEFAULT_LOGO;

  const handleSignOut = async () => {
    setIsPending(true);
    try {
      await clearQueryCache();
      await signOut();
    } catch (error) {
      console.error("Failed to log out", error);
      setIsPending(false);
    }
  };

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="mb-5 flex h-16 items-center gap-2 px-4 pt-5">
        <Image
          src={logoUrl}
          alt={settings.platform_name}
          width={37}
          height={45}
          className="shrink-0"
        />
        <span
          className={cn(
            "text-base font-bold tracking-tight transition-opacity duration-200",
            !isOpen && "w-0 overflow-hidden opacity-0",
          )}
        >
          Admin Dashboard
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const showBadge =
            item.label === "Artwork Verification" && pendingCount > 0;
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
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {isOpen && <span className="flex-1 truncate">{item.label}</span>}
              {isOpen && showBadge && (
                <span className="bg-primary text-primary-foreground flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold">
                  {pendingCount}
                </span>
              )}
              {isOpen && isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="bg-primary h-1.5 w-1.5 rounded-full"
                />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-border border-t p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Open admin account menu"
              className={cn(
                "hover:bg-muted flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm transition-colors",
                !isOpen && "justify-center",
              )}
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                <UserIcon className="size-4" />
              </div>
              <div
                className={cn(
                  "grid min-w-0 flex-1 text-left text-sm leading-tight transition-opacity duration-200",
                  !isOpen && "sr-only",
                )}
              >
                <span className="truncate font-semibold">
                  {mounted ? user?.email?.split("@")[0] || "Admin" : "..."}
                </span>
                <span className="text-muted-foreground truncate text-xs">
                  {mounted ? user?.email : "..."}
                </span>
              </div>
              <ChevronsUpDown
                className={cn("ml-auto size-4", !isOpen && "hidden")}
              />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side="top"
            align="end"
            sideOffset={8}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-2 py-1.5 text-left text-sm">
                <div className="flex size-8 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                  <UserIcon className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Admin Account</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {mounted ? user?.email : ""}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/admin/settings" onClick={onClose}>
                  <Settings className="mr-2 size-4" />
                  Global Settings
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                void handleSignOut();
              }}
              disabled={isPending}
              className="text-red-600 focus:text-red-600"
            >
              {isPending ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <LogOut className="mr-2 size-4" />
              )}
              {isPending ? "Logging out..." : "Log out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "border-border bg-background sticky top-0 hidden h-screen self-start border-r transition-all duration-300 lg:block",
          isOpen ? "w-60" : "w-16",
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
            className="bg-background h-full w-72 border-r"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
