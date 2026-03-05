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

/* ─────────────────────────────────────────────
   Canva-style scroll-up reveal
   • translateY(60px) → translateY(0)
   • opacity 0 → 1
   • fires once when element enters viewport
   • delay = stagger offset in ms
───────────────────────────────────────────── */
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
      { threshold: 0.12 }
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
        transform: "translateY(60px)",
        transition:
          "opacity 0.72s cubic-bezier(0.16, 1, 0.3, 1), transform 0.72s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {children}
    </div>
  );
}

const aboutSections = [
  { icon: BrainCircuitIcon, title: "1. Project Overview",       body: "ArtForgeLab is an academic research initiative that aims to develop a web-based system addressing the growing problem of plagiarism, unauthorized reproduction, and ownership disputes faced by digital artists online. By leveraging Perceptual Hashing algorithms and Blockchain Technology, the system provides accessible, cryptographic proof of authorship without the cost and complexity of formal IPOPHL registration." },
  { icon: ShieldCheck,      title: "2. The Problem We Address", body: "The rapid growth of digital platforms has exposed artists to serious risks: plagiarism, unauthorized reproduction, art tracing, and disputes over ownership. Existing copyright systems often rely on manual registration that can be costly and time-consuming, especially for students and small-scale artists. The absence of an accessible digital verification system further complicates the detection of copied and infringed digital artworks shared across multiple online platforms." },
  { icon: Fingerprint,      title: "3. Our Solution",           body: "The system integrates two core technologies: Perceptual Hashing, which generates a visual fingerprint of an uploaded artwork resilient to cropping, compression, and color shifts; and Blockchain Technology, which stores proof-of-authorship records in a tamper-proof, decentralized ledger. Together, they enable artists to register their works, detect similar or copied content using Hamming distance comparison, and establish verifiable ownership all through a simple web interface." },
  { icon: Blocks,           title: "4. System Modules",         body: "The platform is built around seven functional modules: (a) Artwork Upload and Maintenance securely storing portfolios and user information; (b) Automatic Artwork Classification categorizing uploads by visual characteristics; (c) Proof of Authorship and Ownership verifying rights through cryptographic proof; (d) Decentralized IP Registry generating immutable blockchain records; (e) Plagiarism Detection comparing perceptual hashes to flag duplicate content; (f) Community Interaction upvoting and reputation building; and (g) Dispute and Complaint Management a transparent channel for reporting copyright infringements." },
  { icon: FileText,         title: "5. Technology Stack",       body: "The system is developed using TypeScript, Next.js, and React for the frontend; Python for the perceptual hashing engine; Solidity and Ethereum for smart contract deployment; Supabase and PostgreSQL as the cloud database backend; and Cloudinary for media storage. The UI was designed in Figma, and the entire codebase is maintained on GitHub. The system is evaluated based on ISO 25010:2011 quality characteristics." },
  { icon: Scale,            title: "6. Scope and Delimitations", body: "The system covers user authentication, artwork registration, plagiarism detection, a community gallery, upvoting, and copyright dispute reporting. It supports digital image formats including illustrations, digital paintings, and graphic art. Other media types such as audio and video are not supported. The platform provides first-check verification and documentation but does not replace formal copyright registration managed by IPOPHL." },
  { icon: FileClockIcon,    title: "7. Academic Context",       body: "ArtForgeLab was developed as partial fulfillment of an undergraduate thesis requirement in the Philippines. The study respondents are composed of digital artists and art enthusiasts. The system is evaluated based on the ISO 25010:2011 software quality model, covering functional suitability, performance efficiency, compatibility, usability, reliability, security, maintainability, and portability." },
];

const teamMembers = [
  { name: "Ruzzel",    role: "Lead Developer",         img: "/team-image/ruzzel.jpg",      desc: "System architecture, blockchain integration, and backend development." },
  { name: "Tenshin",   role: "Front/Backend Engineer", img: "/team-image/tenshin.jpg",     desc: "Frontend components, API integrations, and full-stack development." },
  { name: "Nathaniel", role: "UI/UX Designer",         img: "/team-image/nathanielSD.jpg", desc: "Visual design, wireframing, and usability across all system modules." },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100">
      <NavBar />
      <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-blue-400 to-orange-400" />

      {/* Hero */}
      <div className="bg-blue-900 pt-24 pb-20 px-6 text-center">
        <Reveal delay={100}>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-4 leading-tight">
            About <span className="text-blue-400">Art</span><span className="text-orange-400">Forge</span><span className="text-white">Lab</span>
          </h1>
        </Reveal>
        <Reveal delay={180}>
          <p className="text-slate-300 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            An undergraduate thesis project building a web-based Intellectual Property Rights Management System for digital artists using Perceptual Hashing and Blockchain Technology.
          </p>
        </Reveal>
        <Reveal delay={240}>
          <p className="text-sm text-slate-500 mt-4">Philippines · 2026 · Undergraduate Thesis Research</p>
        </Reveal>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 sm:px-10 lg:px-16 py-16 md:py-20 space-y-12">

        {/* About sections — each ascends independently */}
        {aboutSections.map((section, i) => {
          const Icon = section.icon;
          return (
            <Reveal key={section.title} delay={0}>
              <div className="border-l-4 border-blue-400 pl-8 space-y-3">
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-blue-400 shrink-0" />
                  <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">{section.title}</h2>
                </div>
                <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">{section.body}</p>
              </div>
            </Reveal>
          );
        })}

        {/* Team section */}
        <Reveal>
          <div className="border-l-4 border-orange-400 pl-8 space-y-3">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-orange-400 shrink-0" />
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">8. Research Team</h2>
            </div>
            <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              ArtForgeLab was built by a three-member undergraduate research team, each contributing specialized expertise to the development and design of the system.
            </p>
          </div>
        </Reveal>

        {/* Team cards — staggered ascend */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pl-8">
          {teamMembers.map((member, i) => (
            <Reveal key={member.name} delay={i * 140}>
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col items-center text-center gap-4 hover:border-orange-400 hover:shadow-[0_8px_32px_rgba(251,146,60,0.15)] transition-all duration-300 group cursor-pointer h-full">
                {/* Avatar */}
                <div className="relative w-24 h-24 rounded-full overflow-hidden shrink-0 border-4 border-dotted border-orange-500 shadow-[0_0_12px_rgba(255,165,0,0.3)] group-hover:shadow-[0_0_28px_rgba(255,165,0,0.55)] transition-all duration-300">
                  <Image
                    src={member.img}
                    alt={`${member.name} profile`}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                {/* Info */}
                <div>
                  <p className="font-black text-lg text-slate-900 dark:text-white">{member.name}</p>
                  <p className="text-xs font-semibold uppercase tracking-widest text-orange-400 mt-0.5 mb-2">{member.role}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{member.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Legal disclaimer */}
        <Reveal>
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-7">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-amber-400 mt-0.5 shrink-0" />
              <p className="text-base text-slate-400 leading-relaxed">
                ArtForgeLab is an <span className="text-slate-300 font-medium">academic thesis project</span> and does not constitute a registered legal service. All features are provided for research and evaluation purposes only under <span className="text-slate-300 font-medium">R.A. 8293</span> and administered by <span className="text-slate-300 font-medium">IPOPHL</span>.
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal className="pt-4 text-center">
          <Link href="/" className="text-base text-blue-500 hover:underline">← Back to Home</Link>
        </Reveal>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-white">
        <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-blue-400 to-orange-400" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-16 pb-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12 mb-12 md:mb-14">
            <div className="sm:col-span-2 lg:col-span-1 space-y-5">
              <div className="flex items-center gap-2">
                <Image
                    src="/landing-page-elements/AFL_logoWeb.png"
                    alt="Logo"
                    width={60}
                    height={70}
                    className="shrink-0"
                  />
                <span className="text-lg font-bold tracking-tight">
                  <span className="text-blue-400">Art</span><span className="text-orange-500">Forge</span><span className="text-white">Lab</span>
                </span>
              </div>
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-400 border-l-2 border-blue-500 pl-3">Advancing Digital IP Protection</p>
              <p className="text-sm text-slate-400 leading-relaxed text-justify">
                ArtForgeLab is an academic research initiative developing a Web-based Intellectual Property Rights Management System for Digital Artists using <span className="text-slate-200 font-medium">Perceptual Hashing</span> and <span className="text-slate-200 font-medium">Blockchain Technology</span>.
              </p>
              <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-lg px-3 py-2">
                <BookOpen className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="text-xs text-blue-300 font-medium">Undergraduate Thesis Research · 2026</span>
              </div>
            </div>
            <div className="space-y-5">
              <h4 className="text-sm font-bold uppercase tracking-widest text-slate-200 border-b border-slate-700 pb-3">Platform</h4>
              <ul className="space-y-3 text-sm text-slate-400">
                {[{ icon: FileText, label: "Artwork Registration" }, { icon: ShieldCheck, label: "Proof of Authorship" }, { icon: Blocks, label: "Plagiarism Detection" }, { icon: Scale, label: "Ownership Verification" }, { icon: Users, label: "Community Gallery" }, { icon: FileClockIcon, label: "Dispute & Complaint Management" }].map(({ icon: Icon, label }) => (
                  <li key={label}><a href="#" className="flex items-center gap-2 hover:text-blue-400 transition-colors group"><Icon className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 shrink-0" /><span>{label}</span></a></li>
                ))}
              </ul>
            </div>
            <div className="space-y-5">
              <h4 className="text-sm font-bold uppercase tracking-widest text-slate-200 border-b border-slate-700 pb-3">Resources</h4>
              <ul className="space-y-3 text-sm text-slate-400">
                {[{ icon: BookOpen, label: "Intellectual Property Guide" }, { icon: BrainCircuit, label: "How Perceptual Hashing Works" }, { icon: Scale, label: "Research Documentation" }, { icon: ShieldCheck, label: "Support Center" }].map(({ icon: Icon, label }) => (
                  <li key={label}><a href="#" className="flex items-center gap-2 hover:text-blue-400 transition-colors group"><Icon className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 shrink-0" /><span>{label}</span></a></li>
                ))}
              </ul>
            </div>
            <div className="space-y-5">
              <h4 className="text-sm font-bold uppercase tracking-widest text-slate-200 border-b border-slate-700 pb-3">Research Team</h4>
              <p className="text-sm text-slate-400 leading-relaxed">Developed as partial fulfillment of an undergraduate thesis requirement. For academic inquiries, reach out below.</p>
              <ul className="space-y-3 text-sm text-slate-400">
                <li className="flex items-start gap-3"><Mail className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" /><span className="break-all">artforgelab@thesis.edu.ph</span></li>
                <li className="flex items-start gap-3"><MapPin className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" /><span>Philippines, 2026</span></li>
              </ul>
              <div className="flex gap-3 pt-1">
                {[{ icon: Globe, label: "Website" }, { icon: Share2Icon, label: "Share" }, { icon: Mail, label: "Email" }].map(({ icon: Icon, label }) => (
                  <a key={label} href="#" aria-label={label} className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-blue-500/20 hover:border-blue-500/40 transition-all">
                    <Icon className="w-4 h-4 text-blue-400" />
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 md:p-5 mb-8 md:mb-10">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-2">Legal Disclaimer</p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  ArtForgeLab provides cryptographic proof-of-existence and similarity detection as <span className="text-slate-300 font-medium">evidentiary support</span> for intellectual property claims. All similarity results are <span className="text-slate-300 font-medium">indicative only</span> and do not constitute a legal determination. This system is intended to complement, not replace, formal copyright registration governed by the <span className="text-slate-300 font-medium">Intellectual Property Code of the Philippines (R.A. 8293)</span> and administered by <span className="text-slate-300 font-medium">IPOPHL</span>.
                </p>
              </div>
            </div>
          </div>
          <div className="pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
            <p className="text-center md:text-left leading-relaxed">© 2026 ArtForgeLab &mdash; A Thesis Project on <span className="text-slate-400">Intellectual Property Rights Management for Digital Artists</span> Using Perceptual Hashing &amp; Blockchain Technology.</p>
            <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
              {["Privacy Policy", "Terms of Use"].map((link) => (
                <a key={link} href="#" className="hover:text-white transition-colors whitespace-nowrap">{link}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}