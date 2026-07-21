import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { ReactQueryClientProvider } from "@/providers/react-query-provider";
import { getRuntimeSettings } from "@/features/admin/settings/lib/runtime-settings";

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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
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