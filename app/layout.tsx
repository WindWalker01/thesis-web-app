import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { ReactQueryClientProvider } from "@/providers/react-query-provider";
import NavBar from "@/components/blocks/navbar";
import Footer from "@/components/blocks/footer";

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
    "Web-based Intellectual Property Rights Management System for Digital Artists " +
    "using Perceptual Hashing and Blockchain Technology.",
  keywords: [
    "digital art", "IP protection", "blockchain",
    "perceptual hashing", "copyright", "Philippines",
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
      <head>
        {/* tweakcn live-preview — lets you change the theme from tweakcn.com */}
        <script
          async
          crossOrigin="anonymous"
          src="https://tweakcn.com/live-preview.min.js"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/*
          ThemeProvider wraps the whole app so every page gets
          dark / light / system mode automatically.
          attribute="class" → adds/removes the "dark" class on <html>
          defaultTheme="system" → respects the OS preference on first visit
        */}
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