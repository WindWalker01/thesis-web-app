import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { ReactQueryClientProvider } from "@/providers/react-query-provider";
import { getRuntimeSettings } from "@/features/admin/settings/lib/runtime-settings";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getRuntimeSettings();

  return {
    title: settings.platform_name,
    description: settings.platform_description,
    keywords: [
      "digital art",
      "IP protection",
      "blockchain",
      "perceptual hashing",
      "copyright",
      "Philippines",
    ],
    icons: {
      icon: settings.platform_logo_url,
      shortcut: settings.platform_logo_url,
      apple: settings.platform_logo_url,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // ── Server-side Maintenance Mode Check (Fallback) ──
  // This is a secondary enforcement layer that runs on every page render.
  // It uses the admin client (service role key) which bypasses RLS, so it
  // can always read maintenance_mode even for non-admin users.
  // The primary enforcement is in middleware (proxy.ts), but this ensures
  // protection even if middleware is bypassed or fails.
  const settings = await getRuntimeSettings();

  // ── Check maintenance mode (manual or scheduled) ──
  let isInMaintenance = settings.maintenance_mode;

  // Check if scheduled maintenance window is active
  if (!isInMaintenance && settings.scheduled_maintenance) {
    const startStr = settings.scheduled_maintenance_start;
    const endStr = settings.scheduled_maintenance_end;
    if (startStr && endStr) {
      const now = new Date();
      const start = new Date(startStr);
      const end = new Date(endStr);
      if (now >= start && now <= end) {
        isInMaintenance = true;
      }
    }
  }

  if (isInMaintenance) {
    // Check if the current user is an admin (admins bypass maintenance mode)
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    let isAdmin = false;
    if (user) {
      const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();
      isAdmin = profile?.role === "admin";
    }

    // If user is not an admin, render the maintenance page instead
    if (!isAdmin) {
      const { default: MaintenancePage } = await import("@/app/maintenance/page");
      return (
        <html lang="en" suppressHydrationWarning>
          <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          >
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem
            >
              <MaintenancePage />
            </ThemeProvider>
          </body>
        </html>
      );
    }
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
        >
          <ReactQueryClientProvider>
            {children}
            <Toaster position="top-center" />
          </ReactQueryClientProvider>
        </ThemeProvider>

        <Script
          src="https://tweakcn.com/live-preview.min.js"
          strategy="afterInteractive"
          crossOrigin="anonymous"
        />
      </body>
    </html>
  );
}
