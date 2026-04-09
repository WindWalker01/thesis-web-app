import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { ReactQueryClientProvider } from "@/providers/react-query-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ArtForgeLab",
  description:
    "Web-based Intellectual Property Rights Management System for Digital Artists using Perceptual Hashing and Blockchain Technology.",
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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Script
          src="https://tweakcn.com/live-preview.min.js"
          strategy="afterInteractive"
          crossOrigin="anonymous"
        />

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
      </body>
    </html>
  );
}