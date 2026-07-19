"use client";

import Link from "next/link";
import Image from "next/image";
import NavBar from "@/components/blocks/navbar";
import { useEffect, useRef } from "react";
import {
  BrainCircuitIcon,
  BrainCircuit,
  ShieldCheck,
  Fingerprint,
  Users,
  Blocks,
  FileText,
  FileClockIcon,
  Scale,
  AlertTriangle,
  BookOpen,
  Mail,
  Share2Icon,
  Globe,
  MapPin,
} from "lucide-react";

/* ── Canva-style scroll reveal ── */
function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            el.style.opacity = "1";
            el.style.transform = "translateY(0px)";
          }, delay);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: 0,
        transform: "translateY(52px)",
        transition:
          "opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)",
      }}
    >
      {children}
    </div>
  );
}

const ABOUT_SECTIONS = [
  {
    icon: BrainCircuitIcon,
    num: "01",
    title: "Project Overview",
    body: "ArtForgeLab is an academic research initiative that aims to develop a web-based system addressing the growing problem of plagiarism, unauthorized reproduction, and ownership disputes faced by digital artists online. By leveraging Perceptual Hashing algorithms and Blockchain Technology, the system provides accessible, cryptographic proof of authorship without the cost and complexity of formal IPOPHL registration.",
  },
  {
    icon: ShieldCheck,
    num: "02",
    title: "The Problem We Address",
    body: "The rapid growth of digital platforms has exposed artists to serious risks: plagiarism, unauthorized reproduction, art tracing, and disputes over ownership. Existing copyright systems often rely on manual registration that can be costly and time-consuming, especially for students and small-scale artists. The absence of an accessible digital verification system further complicates the detection of copied and infringed digital artworks shared across multiple online platforms.",
  },
  {
    icon: Fingerprint,
    num: "03",
    title: "Our Solution",
    body: "The system integrates two core technologies: Perceptual Hashing, which generates a visual fingerprint of an uploaded artwork resilient to cropping, compression, and color shifts; and Blockchain Technology, which stores proof-of-authorship records in a tamper-proof, decentralized ledger. Together, they enable artists to register their works, detect similar or copied content using Hamming distance comparison, and establish verifiable ownership all through a simple web interface.",
  },
  {
    icon: Blocks,
    num: "04",
    title: "System Modules",
    body: "The platform is built around seven functional modules: (a) Artwork Upload and Maintenance securely storing portfolios and user information; (b) Automatic Artwork Classification categorizing uploads by visual characteristics; (c) Proof of Authorship and Ownership verifying rights through cryptographic proof; (d) Decentralized IP Registry generating immutable blockchain records; (e) Plagiarism Detection comparing perceptual hashes to flag duplicate content; (f) Community Interaction upvoting and reputation building; and (g) Dispute and Complaint Management a transparent channel for reporting copyright infringements.",
  },
  {
    icon: FileText,
    num: "05",
    title: "Technology Stack",
    body: "The system is developed using TypeScript, Next.js, and React for the frontend; Python for the perceptual hashing engine; Solidity and Ethereum for smart contract deployment; Supabase and PostgreSQL as the cloud database backend; and Cloudinary for media storage. The UI was designed in Figma, and the entire codebase is maintained on GitHub. The system is evaluated based on ISO 25010:2011 quality characteristics.",
  },
  {
    icon: Scale,
    num: "06",
    title: "Scope and Delimitations",
    body: "The system covers user authentication, artwork registration, plagiarism detection, a community gallery, upvoting, and copyright dispute reporting. It supports digital image formats including illustrations, digital paintings, and graphic art. Other media types such as audio and video are not supported. The platform provides first-check verification and documentation but does not replace formal copyright registration managed by IPOPHL.",
  },
  {
    icon: FileClockIcon,
    num: "07",
    title: "Academic Context",
    body: "ArtForgeLab was developed as partial fulfillment of an undergraduate thesis requirement in the Philippines. The study respondents are composed of digital artists and art enthusiasts. The system is evaluated based on the ISO 25010:2011 software quality model, covering functional suitability, performance efficiency, compatibility, usability, reliability, security, maintainability, and portability.",
  },
];

const TEAM_MEMBERS = [
  {
    name: "Ruzzel",
    role: "Lead Developer",
    img: "/team-image/ruzzel.jpg",
    desc: "System architecture, blockchain integration, and backend development.",
  },
  {
    name: "Tenshin",
    role: "Front/Backend Engineer",
    img: "/team-image/tenshin.jpg",
    desc: "Frontend components, API integrations, and full-stack development.",
  },
  {
    name: "Nathaniel",
    role: "UI/UX Designer",
    img: "/team-image/nathanielSD.jpg",
    desc: "Visual design, wireframing, and usability across all system modules.",
  },
];

export default function AboutPage() {
  return (
    <main className="bg-background-light dark:bg-background-dark font-display min-h-screen overflow-x-hidden text-slate-900 dark:text-slate-100">
      <div className="h-1 w-full bg-linear-to-r from-blue-600 via-blue-400 to-orange-400" />

      {/* ── Hero ── */}
      <div className="relative overflow-hidden bg-slate-900 px-6 pt-28 pb-20 text-center">
        {/* Dot-grid texture */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "radial-gradient(rgba(96,165,250,1) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        {/* Radial glow */}
        <div className="pointer-events-none absolute top-1/2 left-1/2 h-80 w-175 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-4xl">
          <Reveal>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-400/25 bg-blue-500/15 px-5 py-2">
              <BrainCircuitIcon className="h-3.5 w-3.5 text-blue-400" />
              <span className="text-sm font-bold tracking-widest text-blue-300 uppercase">
                About the Project
              </span>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mb-5 text-5xl leading-none font-black text-white md:text-7xl lg:text-8xl">
              About{" "}
              <span className="bg-linear-to-r from-blue-400 to-orange-400 bg-clip-text text-transparent">
                ArtForgeLab
              </span>
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mx-auto max-w-xl text-base leading-relaxed text-slate-300 md:text-lg">
              An undergraduate thesis project building a web-based Intellectual
              Property Rights Management System for digital artists using
              Perceptual Hashing and Blockchain Technology.
            </p>
          </Reveal>
          <Reveal delay={220}>
            <div className="mt-5 flex items-center justify-center gap-3 text-sm text-slate-500">
              <span>Philippines</span>
              <span className="h-1 w-1 rounded-full bg-slate-600" />
              <span>2026</span>
              <span className="h-1 w-1 rounded-full bg-slate-600" />
              <span>Undergraduate Thesis Research</span>
            </div>
          </Reveal>
        </div>
      </div>

      {/* ── Info bar ── */}
      <div className="bg-blue-600">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-6 px-6 py-3.5 md:gap-10">
          {[
            { label: "Sections", value: "7" },
            { label: "Technology", value: "Blockchain" },
            { label: "Algorithm", value: "Perceptual Hash" },
            { label: "Year", value: "2026" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-base">
              <span className="text-sm font-medium tracking-widest text-blue-200 uppercase">
                {item.label}
              </span>
              <span className="font-black text-white">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section cards ── */}
      <div className="mx-auto max-w-5xl cursor-pointer space-y-4 px-6 py-16 select-text sm:px-10 md:py-24 lg:px-16">
        {ABOUT_SECTIONS.map((section) => {
          const Icon = section.icon;
          return (
            <Reveal key={section.num}>
              <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:border-blue-400/60 hover:shadow-[0_6px_28px_rgba(59,130,246,0.09)] dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-500/50">
                {/* Hover left accent */}
                <div className="absolute top-0 bottom-0 left-0 w-0.75 rounded-l-2xl bg-linear-to-b from-blue-400 to-blue-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <div className="flex gap-0 md:gap-2">
                  {/* Section number column */}
                  <div className="hidden w-20 shrink-0 flex-col items-center justify-start pt-6 pr-2 pl-6 sm:flex">
                    <span className="text-5xl leading-none font-black text-slate-100 transition-colors select-none group-hover:text-blue-100 dark:text-slate-800 dark:group-hover:text-blue-900/70">
                      {section.num}
                    </span>
                  </div>

                  {/* Divider */}
                  <div className="my-5 hidden w-px shrink-0 bg-slate-100 sm:block dark:bg-slate-800" />

                  {/* Body */}
                  <div className="min-w-0 flex-1 p-6 md:p-7">
                    <div className="mb-3 flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 transition-colors group-hover:bg-blue-500/20">
                        <Icon className="h-4 w-4 text-blue-500" />
                      </div>
                      <span className="text-xl font-black text-slate-200 select-none sm:hidden dark:text-slate-700">
                        {section.num}
                      </span>
                      <h2 className="text-base font-black text-slate-900 transition-colors group-hover:text-blue-600 md:text-lg dark:text-white dark:group-hover:text-blue-400">
                        {section.title}
                      </h2>
                    </div>
                    <p className="text-base leading-relaxed text-slate-500 md:text-base dark:text-slate-300">
                      {section.body}
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          );
        })}

        {/* ── Team section header ── */}
        <Reveal className="pt-6">
          <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:border-orange-400/60 hover:shadow-[0_6px_28px_rgba(251,146,60,0.09)] dark:border-slate-800 dark:bg-slate-900">
            <div className="absolute top-0 bottom-0 left-0 w-0.75 rounded-l-2xl bg-linear-to-b from-orange-400 to-orange-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="flex gap-0 md:gap-2">
              <div className="hidden w-20 shrink-0 flex-col items-center justify-start pt-6 pr-2 pl-6 sm:flex">
                <span className="text-5xl leading-none font-black text-slate-100 transition-colors select-none group-hover:text-orange-100 dark:text-slate-800 dark:group-hover:text-orange-900/60">
                  08
                </span>
              </div>
              <div className="my-5 hidden w-px shrink-0 bg-slate-100 sm:block dark:bg-slate-800" />
              <div className="min-w-0 flex-1 p-6 md:p-7">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 transition-colors group-hover:bg-orange-500/20">
                    <Users className="h-4 w-4 text-orange-500" />
                  </div>
                  <h2 className="text-base font-black text-slate-900 transition-colors group-hover:text-orange-500 md:text-lg dark:text-white">
                    Research Team
                  </h2>
                </div>
                <p className="text-base leading-relaxed text-slate-500 md:text-base dark:text-slate-300">
                  ArtForgeLab was built by a three-member undergraduate research
                  team, each contributing specialized expertise to the
                  development and design of the system.
                </p>
              </div>
            </div>
          </div>
        </Reveal>

        {/* ── Team cards — staggered ── */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {TEAM_MEMBERS.map((member, i) => (
            <Reveal key={member.name} delay={i * 130}>
              <div className="group relative flex h-full cursor-pointer flex-col items-center gap-4 overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 text-center transition-all duration-300 hover:border-orange-400/60 hover:shadow-[0_8px_32px_rgba(251,146,60,0.12)] dark:border-slate-800 dark:bg-slate-900">
                {/* Hover left accent */}
                <div className="absolute top-0 bottom-0 left-0 w-0.75 rounded-l-2xl bg-linear-to-b from-orange-400 to-orange-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                {/* Avatar */}
                <div className="relative h-22 w-22 shrink-0 overflow-hidden rounded-full border-[3px] border-dotted border-orange-400 shadow-[0_0_14px_rgba(251,146,60,0.25)] transition-all duration-300 group-hover:shadow-[0_0_28px_rgba(251,146,60,0.5)]">
                  <Image
                    src={member.img}
                    alt={`${member.name} profile`}
                    width={88}
                    height={88}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                {/* Info */}
                <div>
                  <p className="text-base font-black text-slate-900 dark:text-white">
                    {member.name}
                  </p>
                  <p className="mt-0.5 mb-2 text-[10px] font-bold tracking-widest text-orange-400 uppercase">
                    {member.role}
                  </p>
                  <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-300">
                    {member.desc}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* ── Back link ── */}
        <Reveal className="pt-4 text-center">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 text-base font-semibold text-blue-500 transition-colors hover:text-blue-400"
          >
            <span className="inline-block transition-transform group-hover:-translate-x-1">
              ←
            </span>
            Back to Home
          </Link>
        </Reveal>
      </div>
    </main>
  );
}
