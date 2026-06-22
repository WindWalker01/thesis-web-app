"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import {
  ShieldAlert,
  EyeOff,
  AlertTriangle,
  Ban,
  Users,
  Flag,
  Scale,
  Lock,
  Siren,
  HeartHandshake,
  CheckCircle2,
  XCircle,
  Info,
} from "lucide-react";
/* ── Scroll-reveal animation (consistent with Terms / Privacy pages) ── */
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
      { threshold: 0.08 }
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

/* ── NSFW Definition Cards ── */
const NSFW_DEFINITIONS = [
  {
    icon: EyeOff,
    label: "Explicit Sexual Content",
    description:
      "Artwork depicting nudity or sexual acts in a graphic, non-artistic, or pornographic manner that serves no educational or artistic merit recognized by the platform.",
    color: "orange",
  },
  {
    icon: AlertTriangle,
    label: "Graphic Violence",
    description:
      "Imagery that depicts extreme gore, torture, mutilation, or gratuitous acts of violence against humans or animals beyond what is recognized as artistic expression.",
    color: "orange",
  },
  {
    icon: ShieldAlert,
    label: "Disturbing or Shock Content",
    description:
      "Content specifically designed to deeply disturb, traumatize, or shock viewers without artistic, educational, or social commentary purpose.",
    color: "orange",
  },
  {
    icon: Flag,
    label: "Suggestive Depictions of Minors",
    description:
      "Any content that sexualizes, fetishizes, or presents minors in a suggestive context, regardless of whether such depictions are digitally generated or appear fictional.",
    color: "orange",
  },
];

/* ── Strictly Prohibited Sections ── */
const PROHIBITED = [
  {
    icon: Ban,
    num: "01",
    title: "Child Sexual Abuse Material (CSAM)",
    body: "The upload, distribution, or creation of any content that sexually exploits minors — real or simulated — is strictly prohibited and will be reported to relevant authorities immediately. Zero tolerance is enforced without exception.",
    severity: "critical",
  },
  {
    icon: Siren,
    num: "02",
    title: "Hate Speech & Discriminatory Imagery",
    body: "Artworks that promote hatred, dehumanization, or discrimination against individuals or groups based on race, ethnicity, religion, gender, sexual orientation, disability, or nationality are not permitted on this platform.",
    severity: "critical",
  },
  {
    icon: AlertTriangle,
    num: "03",
    title: "Content Glorifying Terrorism or Violence",
    body: "Any artwork that promotes, glorifies, or incites acts of terrorism, mass violence, genocide, or organized crime — including imagery of terrorist symbols, propaganda, or recruitment material — is strictly forbidden.",
    severity: "critical",
  },
  {
    icon: Lock,
    num: "04",
    title: "Non-Consensual Intimate Imagery (NCII)",
    body: "Distributing intimate images of real individuals without their explicit consent, including AI-generated deepfakes that realistically portray identifiable persons in sexual scenarios, is a severe violation of privacy and platform policy.",
    severity: "critical",
  },
  {
    icon: ShieldAlert,
    num: "05",
    title: "Harassment & Targeted Abuse",
    body: "Artwork created with the intent to bully, harass, intimidate, or threaten a specific person or group — including doxxing illustrations, personal attack imagery, or malicious caricatures — will be removed and escalated.",
    severity: "high",
  },
  {
    icon: Flag,
    num: "06",
    title: "Misinformation & Deceptive Content",
    body: "Fabricated imagery designed to deceive the public, spread harmful health misinformation, or manipulate public opinion on critical events without disclosure as satire or fiction is prohibited.",
    severity: "high",
  },
  {
    icon: Scale,
    num: "07",
    title: "Copyright Infringement & Plagiarism",
    body: "Uploading artworks that replicate, trace, or closely reproduce the original work of another artist without attribution or authorization violates intellectual property law and the foundational purpose of ArtForgeLab's plagiarism detection system.",
    severity: "high",
  },
  {
    icon: Users,
    num: "08",
    title: "Impersonation & Identity Fraud",
    body: "Creating artwork or profiles that falsely represent another artist, public figure, or institution — including using their name, style, or likeness to mislead — is prohibited and may constitute fraud.",
    severity: "high",
  },
];

/* ── What is Allowed callout items ── */
const ALLOWED = [
  "Artistic nudity with clear educational or cultural context",
  "Mature themes explored through conceptual or abstract composition",
  "Depictions of historical violence with appropriate scholarly framing",
  "Social or political commentary using satire when clearly labeled",
  "Dark or horror-themed art that does not celebrate real-world harm",
];

/* ── Severity badge helper ── */
function SeverityBadge({ level }: { level: "critical" | "high" }) {
  if (level === "critical") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 border border-destructive/30 text-destructive px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest">
        <XCircle className="w-3 h-3" />
        Zero Tolerance
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/10 border border-orange-400/30 text-orange-500 dark:text-orange-400 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest">
      <AlertTriangle className="w-3 h-3" />
      Strict Violation
    </span>
  );
}

export default function CommunityGuidelinesPage() {
  return (
    <main className="min-h-screen bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 overflow-x-hidden">
      {/* ── Top accent line ── */}
      <div className="h-1 w-full bg-linear-to-r from-orange-500 via-orange-400 to-blue-500" />

      {/* ── Hero ── */}
      <div className="relative bg-slate-900 pt-28 pb-20 px-6 text-center overflow-hidden">
        {/* Radial orange glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        {/* Secondary blue glow */}
        <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-60 bg-blue-500/8 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto">
          <Reveal>
            <div className="inline-flex items-center gap-2 bg-orange-500/15 border border-orange-400/25 rounded-full px-5 py-2 mb-6">
              <ShieldAlert className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-xs font-bold text-orange-300 uppercase tracking-widest">
                Platform Policy
              </span>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-none mb-5">
              Community{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-orange-400 to-orange-300">
                Guidelines
              </span>
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="text-slate-300 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              ArtForgeLab is committed to fostering a safe and respectful space
              for digital artists. These guidelines define what content is
              permitted, what constitutes NSFW material, and what is strictly
              prohibited on our platform.
            </p>
          </Reveal>

          <Reveal delay={220}>
            <div className="flex items-center justify-center gap-3 mt-5 text-xs text-slate-500">
              <span>Last updated: June 2026</span>
              <span className="w-1 h-1 rounded-full bg-slate-600" />
              <span>ArtForgeLab Undergraduate Thesis Project</span>
            </div>
          </Reveal>
        </div>
      </div>

      {/* ── Info bar ── */}
      <div className="bg-orange-500">
        <div className="max-w-5xl mx-auto px-6 py-3.5 flex flex-wrap items-center justify-center gap-6 md:gap-10">
          {[
            { label: "Total Policies", value: "8" },
            { label: "Jurisdiction", value: "Philippines" },
            { label: "Effective", value: "Jun 2026" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-sm">
              <span className="text-orange-100 text-xs uppercase tracking-widest font-medium">
                {item.label}
              </span>
              <span className="text-white font-black">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 sm:px-10 lg:px-16 py-16 md:py-24 space-y-20">

        {/* ── Section 1: What is NSFW? ── */}
        <section aria-labelledby="nsfw-definition-heading">
          <Reveal>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/15 flex items-center justify-center shrink-0">
                <EyeOff className="w-5 h-5 text-orange-500" />
              </div>
              <h2
                id="nsfw-definition-heading"
                className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white"
              >
                What Constitutes NSFW Content?
              </h2>
            </div>
            <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 leading-relaxed mb-8 ml-13 pl-1">
              NSFW (Not Safe for Work) content on ArtForgeLab refers to
              material that may be inappropriate for general audiences. While we
              respect artistic freedom, the following categories are classified
              as NSFW and are subject to additional moderation review before
              they may be made publicly visible.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {NSFW_DEFINITIONS.map((item, i) => {
              const Icon = item.icon;
              return (
                <Reveal key={item.label} delay={i * 60}>
                  <div className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-orange-400/60 dark:hover:border-orange-500/50 hover:shadow-[0_6px_28px_rgba(249,115,22,0.09)] transition-all duration-300 p-6 overflow-hidden h-full">
                    {/* Top accent line */}
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-orange-400/0 via-orange-400/60 to-orange-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-2xl" />

                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-xl bg-orange-500/10 group-hover:bg-orange-500/20 flex items-center justify-center shrink-0 transition-colors">
                        <Icon className="w-4 h-4 text-orange-500" />
                      </div>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors leading-snug">
                        {item.label}
                      </h3>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </section>

        {/* ── Section 2: What is Allowed (Nuance callout) ── */}
        <Reveal>
          <section
            aria-label="Permissible mature content clarification"
            className="relative bg-blue-500/5 dark:bg-blue-500/10 border border-blue-400/20 dark:border-blue-500/20 rounded-2xl p-6 md:p-8 overflow-hidden"
          >
            {/* Subtle glow */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-blue-500/15 flex items-center justify-center shrink-0">
                  <Info className="w-4.5 h-4.5 text-blue-500" />
                </div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  Context Matters: Permitted Mature Content
                </h2>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-5">
                ArtForgeLab acknowledges that mature themes can carry legitimate
                artistic, cultural, and social merit. The following types of
                content{" "}
                <span className="font-semibold text-slate-900 dark:text-white">
                  may be permitted
                </span>{" "}
                with appropriate context, labeling, and moderation approval:
              </p>
              <ul className="space-y-2.5">
                {ALLOWED.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300"
                  >
                    <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-xs text-slate-400 dark:text-slate-500 italic">
                ArtForgeLab moderators reserve the right to make final
                determinations on borderline content based on community
                standards and the academic mission of this platform.
              </p>
            </div>
          </section>
        </Reveal>

        {/* ── Section 3: Strictly Prohibited ── */}
        <section aria-labelledby="prohibited-heading">
          <Reveal>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-destructive/15 flex items-center justify-center shrink-0">
                <Ban className="w-5 h-5 text-destructive" />
              </div>
              <h2
                id="prohibited-heading"
                className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white"
              >
                Strictly Prohibited Content
              </h2>
            </div>
            <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 leading-relaxed mb-8 ml-13 pl-1">
              The following categories of content are{" "}
              <span className="font-semibold text-destructive">
                absolutely prohibited
              </span>{" "}
              on ArtForgeLab. Violations will result in immediate content
              removal, account suspension, and escalation to appropriate
              authorities where required by law.
            </p>
          </Reveal>

          <div className="space-y-4">
            {PROHIBITED.map((section, i) => {
              const Icon = section.icon;
              const isCritical = section.severity === "critical";
              return (
                <Reveal key={section.num} delay={i * 50}>
                  <div
                    className={`group relative bg-white dark:bg-slate-900 rounded-2xl border transition-all duration-300 overflow-hidden ${
                      isCritical
                        ? "border-destructive/20 dark:border-destructive/20 hover:border-destructive/50 hover:shadow-[0_6px_28px_rgba(220,38,38,0.08)]"
                        : "border-orange-400/20 dark:border-orange-500/15 hover:border-orange-400/50 hover:shadow-[0_6px_28px_rgba(249,115,22,0.08)]"
                    }`}
                  >
                    {/* Left accent */}
                    <div
                      className={`absolute left-0 top-0 bottom-0 w-0.75 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-l-2xl ${
                        isCritical
                          ? "bg-linear-to-b from-destructive/70 to-destructive"
                          : "bg-linear-to-b from-orange-400 to-orange-500"
                      }`}
                    />

                    <div className="flex gap-0 md:gap-2">
                      {/* Clause number */}
                      <div className="hidden sm:flex flex-col items-center justify-start pt-6 pl-6 pr-2 shrink-0 w-20">
                        <span
                          className={`text-5xl font-black leading-none select-none transition-colors ${
                            isCritical
                              ? "text-slate-100 dark:text-slate-800 group-hover:text-red-100 dark:group-hover:text-red-900/50"
                              : "text-slate-100 dark:text-slate-800 group-hover:text-orange-100 dark:group-hover:text-orange-900/40"
                          }`}
                        >
                          {section.num}
                        </span>
                      </div>

                      {/* Divider */}
                      <div className="hidden sm:block w-px bg-slate-100 dark:bg-slate-800 my-5 shrink-0" />

                      {/* Body */}
                      <div className="flex-1 min-w-0 p-6 md:p-7">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-3">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                              isCritical
                                ? "bg-destructive/10 group-hover:bg-destructive/20"
                                : "bg-orange-500/10 group-hover:bg-orange-500/20"
                            }`}
                          >
                            <Icon
                              className={`w-4 h-4 ${isCritical ? "text-destructive" : "text-orange-500"}`}
                            />
                          </div>
                          {/* Mobile clause number */}
                          <span className="sm:hidden text-xl font-black text-slate-200 dark:text-slate-700 select-none">
                            {section.num}
                          </span>
                          <h3
                            className={`text-base md:text-lg font-black text-slate-900 dark:text-white transition-colors ${
                              isCritical
                                ? "group-hover:text-destructive"
                                : "group-hover:text-orange-500 dark:group-hover:text-orange-400"
                            }`}
                          >
                            {section.title}
                          </h3>
                          <SeverityBadge level={section.severity as "critical" | "high"} />
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
          </div>
        </section>

        {/* ── Section 4: Reporting ── */}
        <Reveal>
          <section
            aria-label="How to report violations"
            className="relative bg-slate-900 dark:bg-slate-950 rounded-2xl p-8 md:p-10 text-white overflow-hidden"
          >
            {/* Decorative glow */}
            <div className="absolute -bottom-10 -right-10 w-52 h-52 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -top-6 -left-6 w-36 h-36 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
              <div className="shrink-0">
                <div className="w-14 h-14 rounded-2xl bg-orange-500/15 border border-orange-500/25 flex items-center justify-center">
                  <HeartHandshake className="w-6 h-6 text-orange-400" />
                </div>
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-black mb-3">
                  Help Keep ArtForgeLab Safe
                </h2>
                <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-5">
                  If you encounter content that violates these guidelines,
                  please use the{" "}
                  <span className="text-orange-400 font-semibold">
                    Report
                  </span>{" "}
                  button on any artwork or artwork detail page. Our moderation
                  team reviews all submissions and will act promptly. Repeated
                  violations may result in permanent account termination and
                  legal referral.
                </p>
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                    <span className="text-slate-300">Anonymous reports accepted</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                    <span className="text-slate-300">Reviewed within 24 hours</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                    <span className="text-slate-300">Legal escalation for CSAM</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </Reveal>

        {/* ── Footer navigation ── */}
        <Reveal className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 dark:border-slate-800 pt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-500 hover:text-blue-400 transition-colors group"
          >
            <span className="group-hover:-translate-x-1 transition-transform inline-block">←</span>
            Back to Home
          </Link>
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-slate-400">
            <Link href="/terms-of-use" className="hover:text-blue-400 transition-colors whitespace-nowrap">
              Terms of Use
            </Link>
            <Link href="/privacy-policy" className="hover:text-blue-400 transition-colors whitespace-nowrap">
              Privacy Policy
            </Link>
          </div>
        </Reveal>
      </div>
    </main>
  );
}
