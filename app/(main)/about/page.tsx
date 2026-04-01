"use client";

import Link from "next/link";
import Image from "next/image";
import NavBar from "@/components/blocks/navbar";
import { useEffect, useRef } from "react";
import {
  BrainCircuitIcon, BrainCircuit, ShieldCheck, Fingerprint, Users, Blocks,
  FileText, FileClockIcon, Scale, AlertTriangle, BookOpen, Mail,
  Share2Icon, Globe, MapPin,
} from "lucide-react";

/* ── Canva-style scroll reveal ── */
function Reveal({
  children, delay = 0, className = "",
}: {
  children: React.ReactNode; delay?: number; className?: string;
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
      { threshold: 0.1 }
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
        transition: "opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)",
      }}
    >
      {children}
    </div>
  );
}

const ABOUT_SECTIONS = [
  { icon: BrainCircuitIcon, num: "01", title: "Project Overview", body: "ArtForgeLab is an academic research initiative that aims to develop a web-based system addressing the growing problem of plagiarism, unauthorized reproduction, and ownership disputes faced by digital artists online. By leveraging Perceptual Hashing algorithms and Blockchain Technology, the system provides accessible, cryptographic proof of authorship without the cost and complexity of formal IPOPHL registration." },
  { icon: ShieldCheck, num: "02", title: "The Problem We Address", body: "The rapid growth of digital platforms has exposed artists to serious risks: plagiarism, unauthorized reproduction, art tracing, and disputes over ownership. Existing copyright systems often rely on manual registration that can be costly and time-consuming, especially for students and small-scale artists. The absence of an accessible digital verification system further complicates the detection of copied and infringed digital artworks shared across multiple online platforms." },
  { icon: Fingerprint, num: "03", title: "Our Solution", body: "The system integrates two core technologies: Perceptual Hashing, which generates a visual fingerprint of an uploaded artwork resilient to cropping, compression, and color shifts; and Blockchain Technology, which stores proof-of-authorship records in a tamper-proof, decentralized ledger. Together, they enable artists to register their works, detect similar or copied content using Hamming distance comparison, and establish verifiable ownership all through a simple web interface." },
  { icon: Blocks, num: "04", title: "System Modules", body: "The platform is built around seven functional modules: (a) Artwork Upload and Maintenance securely storing portfolios and user information; (b) Automatic Artwork Classification categorizing uploads by visual characteristics; (c) Proof of Authorship and Ownership verifying rights through cryptographic proof; (d) Decentralized IP Registry generating immutable blockchain records; (e) Plagiarism Detection comparing perceptual hashes to flag duplicate content; (f) Community Interaction upvoting and reputation building; and (g) Dispute and Complaint Management a transparent channel for reporting copyright infringements." },
  { icon: FileText, num: "05", title: "Technology Stack", body: "The system is developed using TypeScript, Next.js, and React for the frontend; Python for the perceptual hashing engine; Solidity and Ethereum for smart contract deployment; Supabase and PostgreSQL as the cloud database backend; and Cloudinary for media storage. The UI was designed in Figma, and the entire codebase is maintained on GitHub. The system is evaluated based on ISO 25010:2011 quality characteristics." },
  { icon: Scale, num: "06", title: "Scope and Delimitations", body: "The system covers user authentication, artwork registration, plagiarism detection, a community gallery, upvoting, and copyright dispute reporting. It supports digital image formats including illustrations, digital paintings, and graphic art. Other media types such as audio and video are not supported. The platform provides first-check verification and documentation but does not replace formal copyright registration managed by IPOPHL." },
  { icon: FileClockIcon, num: "07", title: "Academic Context", body: "ArtForgeLab was developed as partial fulfillment of an undergraduate thesis requirement in the Philippines. The study respondents are composed of digital artists and art enthusiasts. The system is evaluated based on the ISO 25010:2011 software quality model, covering functional suitability, performance efficiency, compatibility, usability, reliability, security, maintainability, and portability." },
];

const TEAM_MEMBERS = [
  { name: "Ruzzel", role: "Lead Developer", img: "/team-image/ruzzel.jpg", desc: "System architecture, blockchain integration, and backend development." },
  { name: "Tenshin", role: "Front/Backend Engineer", img: "/team-image/tenshin.jpg", desc: "Frontend components, API integrations, and full-stack development." },
  { name: "Nathaniel", role: "UI/UX Designer", img: "/team-image/nathanielSD.jpg", desc: "Visual design, wireframing, and usability across all system modules." },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100">
      <div className="h-1 w-full bg-linear-to-r from-blue-600 via-blue-400 to-orange-400" />

      {/* ── Hero ── */}
      <div className="relative bg-slate-900 pt-28 pb-20 px-6 text-center overflow-hidden">
        {/* Dot-grid texture */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: "radial-linear(rgba(96,165,250,1) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        {/* Radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-175 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto">
          <Reveal>
            <div className="inline-flex items-center gap-2 bg-blue-500/15 border border-blue-400/25 rounded-full px-5 py-2 mb-6">
              <BrainCircuitIcon className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-xs font-bold text-blue-300 uppercase tracking-widest">About the Project</span>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-none mb-5">
              About{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-orange-400">
                ArtForgeLab
              </span>
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="text-slate-300 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
              An undergraduate thesis project building a web-based Intellectual Property Rights Management System for digital artists using Perceptual Hashing and Blockchain Technology.
            </p>
          </Reveal>
          <Reveal delay={220}>
            <div className="flex items-center justify-center gap-3 mt-5 text-xs text-slate-500">
              <span>Philippines</span>
              <span className="w-1 h-1 rounded-full bg-slate-600" />
              <span>2026</span>
              <span className="w-1 h-1 rounded-full bg-slate-600" />
              <span>Undergraduate Thesis Research</span>
            </div>
          </Reveal>
        </div>
      </div>

      {/* ── Info bar ── */}
      <div className="bg-blue-600">
        <div className="max-w-5xl mx-auto px-6 py-3.5 flex flex-wrap items-center justify-center gap-6 md:gap-10">
          {[
            { label: "Sections", value: "7" },
            { label: "Technology", value: "Blockchain" },
            { label: "Algorithm", value: "Perceptual Hash" },
            { label: "Year", value: "2026" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-sm">
              <span className="text-blue-200 text-xs uppercase tracking-widest font-medium">{item.label}</span>
              <span className="text-white font-black">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section cards ── */}
      <div className="max-w-5xl mx-auto px-6 sm:px-10 lg:px-16 py-16 md:py-24 space-y-4 cursor-pointer select-text">

        {ABOUT_SECTIONS.map((section) => {
          const Icon = section.icon;
          return (
            <Reveal key={section.num}>
              <div className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-400/60 dark:hover:border-blue-500/50 hover:shadow-[0_6px_28px_rgba(59,130,246,0.09)] transition-all duration-300 overflow-hidden">

                {/* Hover left accent */}
                <div className="absolute left-0 top-0 bottom-0 w-0.75 bg-linear-to-b from-blue-400 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-l-2xl" />

                <div className="flex gap-0 md:gap-2">
                  {/* Section number column */}
                  <div className="hidden sm:flex flex-col items-center justify-start pt-6 pl-6 pr-2 shrink-0 w-20">
                    <span className="text-5xl font-black leading-none text-slate-100 dark:text-slate-800 group-hover:text-blue-100 dark:group-hover:text-blue-900/70 transition-colors select-none">
                      {section.num}
                    </span>
                  </div>

                  {/* Divider */}
                  <div className="hidden sm:block w-px bg-slate-100 dark:bg-slate-800 my-5 shrink-0" />

                  {/* Body */}
                  <div className="flex-1 min-w-0 p-6 md:p-7">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 flex items-center justify-center transition-colors shrink-0">
                        <Icon className="w-4 h-4 text-blue-500" />
                      </div>
                      <span className="sm:hidden text-xl font-black text-slate-200 dark:text-slate-700 select-none">{section.num}</span>
                      <h2 className="text-base md:text-lg font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {section.title}
                      </h2>
                    </div>
                    <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 leading-relaxed">
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
          <div className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-orange-400/60 hover:shadow-[0_6px_28px_rgba(251,146,60,0.09)] transition-all duration-300 overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-0.75 bg-linear-to-b from-orange-400 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-l-2xl" />
            <div className="flex gap-0 md:gap-2">
              <div className="hidden sm:flex flex-col items-center justify-start pt-6 pl-6 pr-2 shrink-0 w-20">
                <span className="text-5xl font-black leading-none text-slate-100 dark:text-slate-800 group-hover:text-orange-100 dark:group-hover:text-orange-900/60 transition-colors select-none">08</span>
              </div>
              <div className="hidden sm:block w-px bg-slate-100 dark:bg-slate-800 my-5 shrink-0" />
              <div className="flex-1 min-w-0 p-6 md:p-7">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 group-hover:bg-orange-500/20 flex items-center justify-center transition-colors shrink-0">
                    <Users className="w-4 h-4 text-orange-500" />
                  </div>
                  <h2 className="text-base md:text-lg font-black text-slate-900 dark:text-white group-hover:text-orange-500 transition-colors">
                    Research Team
                  </h2>
                </div>
                <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 leading-relaxed">
                  ArtForgeLab was built by a three-member undergraduate research team, each contributing specialized expertise to the development and design of the system.
                </p>
              </div>
            </div>
          </div>
        </Reveal>

        {/* ── Team cards — staggered ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {TEAM_MEMBERS.map((member, i) => (
            <Reveal key={member.name} delay={i * 130}>
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col items-center text-center gap-4 hover:border-orange-400/60 hover:shadow-[0_8px_32px_rgba(251,146,60,0.12)] transition-all duration-300 group cursor-pointer h-full overflow-hidden relative">
                {/* Hover left accent */}
                <div className="absolute left-0 top-0 bottom-0 w-0.75 bg-linear-to-b from-orange-400 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-l-2xl" />
                {/* Avatar */}
                <div className="relative w-22 h-22 rounded-full overflow-hidden shrink-0 border-[3px] border-dotted border-orange-400 shadow-[0_0_14px_rgba(251,146,60,0.25)] group-hover:shadow-[0_0_28px_rgba(251,146,60,0.5)] transition-all duration-300">
                  <Image
                    src={member.img}
                    alt={`${member.name} profile`}
                    width={88}
                    height={88}
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                {/* Info */}
                <div>
                  <p className="font-black text-base text-slate-900 dark:text-white">{member.name}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-orange-400 mt-0.5 mb-2">{member.role}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{member.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* ── Legal disclaimer ── */}
        <Reveal className="pt-4">
          <div className="relative rounded-2xl border border-amber-500/25 bg-linear-to-br from-amber-500/8 to-orange-400/5 p-7 overflow-hidden">
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-amber-400/8 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-start gap-4 relative">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-2">Legal Disclaimer</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  ArtForgeLab is an{" "}
                  <span className="text-slate-700 dark:text-slate-200 font-semibold">academic thesis project</span>{" "}
                  and does not constitute a registered legal service. All features are provided for research and evaluation purposes only under{" "}
                  <span className="text-slate-700 dark:text-slate-200 font-semibold">R.A. 8293</span>{" "}
                  and administered by{" "}
                  <span className="text-slate-700 dark:text-slate-200 font-semibold">IPOPHL</span>.
                </p>
              </div>
            </div>
          </div>
        </Reveal>

        {/* ── Back link ── */}
        <Reveal className="pt-4 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-500 hover:text-blue-400 transition-colors group">
            <span className="group-hover:-translate-x-1 transition-transform inline-block">←</span>
            Back to Home
          </Link>
        </Reveal>
      </div>
    </main>
  );
}