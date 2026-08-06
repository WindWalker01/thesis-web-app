"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileClockIcon,
  Scale,
  Mail,
  Share2Icon,
  Globe,
  BookOpen,
  ShieldCheck,
  FileText,
  Users,
  Blocks,
  MapPin,
  BrainCircuit,
  Link2,
} from "lucide-react";
import { useSiteSettings } from "@/features/admin/settings/lib/use-site-settings";
import { Logo } from "./Logo";

export default function Footer() {
  const pathname = usePathname();
  const { settings } = useSiteSettings();

  // Hide footer on admin pages
  if (pathname.startsWith("/admin")) return null;

  return (
    <footer className="dark:bg-background mt-10 bg-slate-900 text-white">
      <div className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        <hr className="mb-10 border-slate-200/20 dark:border-white/5" />
        <div className="mb-12 grid grid-cols-1 gap-10 sm:grid-cols-2 md:mb-14 md:gap-12 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-5 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2">
              {/* ── Logo ── */}
              <Logo href="/" />
            </div>
            <p className="border-l-2 border-blue-500 pl-3 text-sm font-semibold tracking-widest text-blue-400 uppercase">
              Advancing Digital IP Protection
            </p>
            <p className="text-justify text-base leading-relaxed text-slate-300 dark:text-slate-300">
              ArtForgeLab is an academic research initiative developing a
              Web-based Intellectual Property Rights Management System for
              Digital Artists. The system integrates{" "}
              <span className="font-medium text-white">Perceptual Hashing</span>{" "}
              algorithms and{" "}
              <span className="font-medium text-white">
                Blockchain Technology
              </span>{" "}
              to provide secure proof of authorship, plagiarism detection, and
              transparent ownership verification.
            </p>
            <div className="inline-flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-2">
              <BookOpen className="h-4 w-4 shrink-0 text-blue-400" />
              <span className="text-sm font-medium text-blue-300">
                Undergraduate Thesis Research · 2026
              </span>
            </div>
          </div>

          {/* Platform */}
          <div className="space-y-5">
            <h4 className="border-b border-slate-700 pb-3 text-base font-bold tracking-widest text-slate-100 uppercase dark:text-slate-200">
              Platform
            </h4>
            <ul className="space-y-3 text-base text-slate-300 dark:text-slate-300">
              {[
                {
                  icon: FileText,
                  label: "Artwork Registration",
                  href: "/upload-artwork",
                },
                {
                  icon: ShieldCheck,
                  label: "Proof of Authorship",
                  href: "/plagiarism-checker",
                },
                {
                  icon: Blocks,
                  label: "Plagiarism Detection",
                  href: "/plagiarism-checker",
                },
                {
                  icon: Scale,
                  label: "Ownership Verification",
                  href: "/verify-artwork",
                },
                { icon: Users, label: "Community Gallery", href: "/community" },
                {
                  icon: FileClockIcon,
                  label: "Dispute & Complaint Management",
                  href: "#",
                },
                { icon: Link2, label: "Blockchain Transactions", href: "/txs" },
              ].map(({ icon: Icon, label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="group flex items-center gap-2 transition-colors hover:text-blue-400"
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0 text-slate-400 group-hover:text-blue-400 dark:text-slate-500" />
                    <span>{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-5">
            <h4 className="border-b border-slate-700 pb-3 text-base font-bold tracking-widest text-slate-100 uppercase dark:text-slate-200">
              Resources
            </h4>
            <ul className="space-y-3 text-base text-slate-300 dark:text-slate-300">
              {[
                {
                  icon: BookOpen,
                  label: "Intellectual Property Guide",
                  href: "/about",
                },
                {
                  icon: BrainCircuit,
                  label: "How Perceptual Hashing Works",
                  href: "/about",
                },
                {
                  icon: Scale,
                  label: "Research Documentation",
                  href: "/about",
                },
              ].map(({ icon: Icon, label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="group flex items-center gap-2 transition-colors hover:text-blue-400"
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0 text-slate-400 group-hover:text-blue-400 dark:text-slate-500" />
                    <span>{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Research Team */}
          <div className="space-y-5">
            <h4 className="border-b border-slate-700 pb-3 text-base font-bold tracking-widest text-slate-100 uppercase dark:text-slate-200">
              Research Team
            </h4>
            <p className="text-base leading-relaxed text-slate-300 dark:text-slate-300">
              This system was developed as partial fulfillment of an
              undergraduate thesis requirement. For academic inquiries or
              collaboration proposals, please reach out below.
            </p>
            <ul className="space-y-3 text-base text-slate-300 dark:text-slate-300">
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
                <a
                  href={`mailto:${settings.support_email}`}
                  className="break-all transition-colors hover:text-blue-400"
                >
                  {settings.support_email}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
                <span>Philippines, 2026</span>
              </li>
            </ul>
            <div className="flex gap-3 pt-1">
              {[
                { icon: Globe, label: "Website", href: "/" },
                { icon: Share2Icon, label: "Share", href: "/about" },
                {
                  icon: Mail,
                  label: "Email",
                  href: `mailto:${settings.support_email}`,
                },
              ].map(({ icon: Icon, label, href }) => (
                <Link
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-white/10 transition-all hover:border-blue-500/40 hover:bg-blue-500/20"
                >
                  <Icon className="h-4 w-4 text-blue-400" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-sm text-slate-400 md:flex-row dark:text-slate-500">
          <p className="text-center leading-relaxed md:text-left">
            {settings.footer_copyright}{" "}
            <span className="text-slate-200 dark:text-slate-300">
              {settings.platform_description}
            </span>{" "}
            Using Perceptual Hashing & Blockchain Technology.
          </p>
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
            {[
              { label: "Privacy Policy", href: "/privacy-policy" },
              { label: "Terms of Use", href: "/terms-of-use" },
              { label: "Community Guidelines", href: "/community-guidelines" },
            ].map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="whitespace-nowrap transition-colors hover:text-white"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
