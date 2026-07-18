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
      icon: "/landing-page-elements/AFL_logoWeb.png",
      shortcut: "/landing-page-elements/AFL_logoWeb.png",
      apple: "/landing-page-elements/AFL_logoWeb.png",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { default_language } = await getRuntimeSettings();
  
  return (
    <html lang={default_language} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
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
