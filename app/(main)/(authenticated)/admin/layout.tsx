"use client";

import Link from "next/link";
import { ArrowLeft, PanelLeftIcon } from "lucide-react";
import { useState } from "react";
import { Sidebar } from "@/features/admin/dashboard/components/sidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/client-utils";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="bg-background flex h-screen overflow-hidden">
      {/* Persistent sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen((current) => current)}
      />

      {/* Main content area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Minimal top bar with "Back to Home" button */}
        <header className="border-border bg-background/80 sticky top-0 z-30 h-16 border-b backdrop-blur-md">
          <div className="flex h-14 items-center gap-1 px-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen((prev) => !prev)}
              aria-label="Toggle sidebar"
              className="text-muted-foreground hidden lg:inline-flex"
            >
              <PanelLeftIcon
                className={cn(
                  "h-4 w-4 shrink-0 transition-transform",
                  !sidebarOpen && "rotate-180",
                )}
              />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-muted-foreground ml-5 gap-2"
            >
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </Button>

            <div className="ml-auto flex items-center gap-2">
              
              <ThemeToggle className="mr-5 ml-auto" />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
