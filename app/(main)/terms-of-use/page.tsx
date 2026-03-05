import Link from "next/link";
import Image from "next/image";
import NavBar from "@/components/blocks/navbar";
import {
  AlertTriangle,
  FileText,
  ShieldCheck,
  Scale,
  UserCheck,
  ThumbsUp,
  Flag,
  RefreshCw,
  Globe,
  BookOpen,
  Mail,
  Share2Icon,
  MapPin,
  BrainCircuitIcon,
  BrainCircuit,
  FileClockIcon,
  Users,
  Blocks,
} from "lucide-react";

export default function TermsOfUsePage() {
  return (
    <main className="min-h-screen bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100">

      <NavBar />

      {/* Top gradient accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-blue-400 to-orange-400" />

      {/* Hero strip — matches About page */}
      <div className="bg-slate-900 pt-24 pb-16 px-6 text-center">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-4">
          Terms of <span className="text-blue-400">Use</span>
        </h1>
        <p className="text-slate-300 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          Please read these terms carefully before using the ArtForgeLab platform.
        </p>
        <p className="text-sm text-slate-400 mt-4">
          Last updated: January 2026 · ArtForgeLab Undergraduate Thesis Project
        </p>
      </div>

      {/* Content — border-l-4 sections matching About page exactly */}
      <div className="max-w-5xl mx-auto px-6 sm:px-10 lg:px-16 py-16 md:py-20 space-y-12">

        {[
          {
            icon: FileText,
            title: "1. Acceptance of Terms",
            body: "By accessing or using the ArtForgeLab platform, you agree to be bound by these Terms of Use. If you do not agree, please do not use the system. ArtForgeLab is developed as an academic research initiative and is not a commercially deployed service.",
          },
          {
            icon: ShieldCheck,
            title: "2. Use of the Platform",
            body: "You may use ArtForgeLab solely for lawful purposes related to intellectual property registration, plagiarism detection, and ownership verification of digital artworks. You must not upload content that infringes on the rights of third parties or violates any applicable law.",
          },
          {
            icon: Scale,
            title: "3. Intellectual Property",
            body: "All original content you upload remains your property. By submitting content, you grant ArtForgeLab a limited, non-exclusive license to process and hash your files for the purpose of generating proof-of-authorship records. We do not claim ownership over your uploaded works.",
          },
          {
            icon: ShieldCheck,
            title: "4. Accuracy of Results",
            body: "Similarity scores and plagiarism detection results generated through Perceptual Hashing are indicative only. They are not a legal determination of copyright infringement or originality. Users are encouraged to seek legal counsel before taking formal action based on these results.",
          },
          {
            icon: UserCheck,
            title: "5. Account Responsibility",
            body: "You are responsible for maintaining the confidentiality of your account credentials. Any activity conducted under your account is your responsibility. Report unauthorized access to our research team immediately.",
          },
          {
            icon: AlertTriangle,
            title: "6. Limitation of Liability",
            body: "ArtForgeLab, its developers, and affiliated academic institutions shall not be liable for any direct, indirect, or incidental damages arising from use of this platform. The service is provided on an 'as is' basis for academic evaluation purposes.",
          },
          {
            icon: ThumbsUp,
            title: "7. Community Upvoting System",
            body: "ArtForgeLab features a community upvoting system that allows registered users to upvote digital artworks they find valuable or exceptional. Artworks with higher upvote counts may receive increased visibility and exposure within the platform gallery. Upvotes are intended to reflect community appreciation and may indicate the perceived artistic value of a work. However, upvote counts do not constitute a formal appraisal, monetary valuation, or legal endorsement of any artwork. ArtForgeLab is not responsible for any decisions made based on an artwork's upvote standing.",
          },
          {
            icon: Flag,
            title: "8. Upvoting Conduct",
            body: "Users must not manipulate upvote counts through automated means, multiple accounts, or any form of coordinated inauthentic behavior. Abuse of the upvoting system may result in account suspension. ArtForgeLab reserves the right to remove fraudulent upvotes and adjust visibility rankings accordingly.",
          },
          {
            icon: RefreshCw,
            title: "9. Modifications",
            body: "We reserve the right to update these Terms of Use at any time. Continued use of the platform after changes are posted constitutes your acceptance of the revised terms.",
          },
          {
            icon: Globe,
            title: "10. Governing Law",
            body: "These terms are governed by the laws of the Republic of the Philippines, including the Intellectual Property Code (R.A. 8293), and administered under the jurisdiction of the Intellectual Property Office of the Philippines (IPOPHL).",
          },
        ].map((section) => {
          const Icon = section.icon;
          return (
            <div key={section.title} className="border-l-4 border-blue-400 pl-8 space-y-3">
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5 text-blue-400 shrink-0" />
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">{section.title}</h2>
              </div>
              <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">{section.body}</p>
            </div>
          );
        })}

        {/* Legal disclaimer box */}
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-7">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-amber-400 mt-0.5 shrink-0" />
            <p className="text-base text-slate-400 leading-relaxed">
              ArtForgeLab is an <span className="text-slate-300 font-medium">academic thesis project</span> and
              does not constitute a registered legal service. All features are provided for research and
              evaluation purposes only under <span className="text-slate-300 font-medium">R.A. 8293</span>.
            </p>
          </div>
        </div>

        {/* Back link */}
        <div className="pt-4 text-center">
          <Link href="/" className="text-base text-blue-500 hover:underline">
            ← Back to Home
          </Link>
        </div>

      </div>

      {/* Footer — identical to About page footer */}
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
                  <span className="text-blue-400">Art</span>
                  <span className="text-orange-500">Forge</span>
                  <span className="text-white">Lab</span>
                </span>
              </div>
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-400 border-l-2 border-blue-500 pl-3">
                Advancing Digital IP Protection
              </p>
              <p className="text-sm text-slate-400 leading-relaxed text-justify">
                ArtForgeLab is an academic research initiative developing a
                Web-based Intellectual Property Rights Management System for
                Digital Artists using{" "}
                <span className="text-slate-200 font-medium">Perceptual Hashing</span>{" "}
                and{" "}
                <span className="text-slate-200 font-medium">Blockchain Technology</span>.
              </p>
              <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-lg px-3 py-2">
                <BookOpen className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="text-xs text-blue-300 font-medium">Undergraduate Thesis Research · 2026</span>
              </div>
            </div>

            <div className="space-y-5">
              <h4 className="text-sm font-bold uppercase tracking-widest text-slate-200 border-b border-slate-700 pb-3">Platform</h4>
              <ul className="space-y-3 text-sm text-slate-400">
                {[
                  { icon: FileText,      label: "Artwork Registration" },
                  { icon: ShieldCheck,   label: "Proof of Authorship" },
                  { icon: Blocks,        label: "Plagiarism Detection" },
                  { icon: Scale,         label: "Ownership Verification" },
                  { icon: Users,         label: "Community Gallery" },
                  { icon: FileClockIcon, label: "Dispute & Complaint Management" },
                ].map(({ icon: Icon, label }) => (
                  <li key={label}>
                    <a href="#" className="flex items-center gap-2 hover:text-blue-400 transition-colors group">
                      <Icon className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 transition-colors shrink-0" />
                      <span>{label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-5">
              <h4 className="text-sm font-bold uppercase tracking-widest text-slate-200 border-b border-slate-700 pb-3">Resources</h4>
              <ul className="space-y-3 text-sm text-slate-400">
                {[
                  { icon: BookOpen,     label: "Intellectual Property Guide" },
                  { icon: BrainCircuit, label: "How Perceptual Hashing Works" },
                  { icon: Scale,        label: "Research Documentation" },
                  { icon: ShieldCheck,  label: "Support Center" },
                ].map(({ icon: Icon, label }) => (
                  <li key={label}>
                    <a href="#" className="flex items-center gap-2 hover:text-blue-400 transition-colors group">
                      <Icon className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 transition-colors shrink-0" />
                      <span>{label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-5">
              <h4 className="text-sm font-bold uppercase tracking-widest text-slate-200 border-b border-slate-700 pb-3">Research Team</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Developed as partial fulfillment of an undergraduate thesis requirement.
                For academic inquiries or feedback, reach out below.
              </p>
              <ul className="space-y-3 text-sm text-slate-400">
                <li className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                  <span className="break-all">artforgelab@thesis.edu.ph</span>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                  <span>Philippines, 2026</span>
                </li>
              </ul>
              <div className="flex gap-3 pt-1">
                {[{ icon: Globe, label: "Website" }, { icon: Share2Icon, label: "Share" }, { icon: Mail, label: "Email" }].map(({ icon: Icon, label }) => (
                  <a key={label} href="#" aria-label={label}
                    className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-blue-500/20 hover:border-blue-500/40 transition-all">
                    <Icon className="w-4 h-4 text-blue-400" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 md:p-5 mb-8 md:mb-10">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
              <div className="space-y-1 min-w-0">
                <p className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-2">Legal Disclaimer</p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  ArtForgeLab provides cryptographic proof-of-existence and similarity detection as{" "}
                  <span className="text-slate-300 font-medium">evidentiary support</span> for intellectual property claims.
                  All similarity results are <span className="text-slate-300 font-medium">indicative only</span> and do not
                  constitute a legal determination. This system is intended to complement, not replace, formal copyright
                  registration governed by the{" "}
                  <span className="text-slate-300 font-medium">Intellectual Property Code of the Philippines (R.A. 8293)</span>{" "}
                  and administered by <span className="text-slate-300 font-medium">IPOPHL</span>.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
            <p className="text-center md:text-left leading-relaxed">
              © 2026 ArtForgeLab &mdash; A Thesis Project on{" "}
              <span className="text-slate-400">Intellectual Property Rights Management for Digital Artists</span>{" "}
              Using Perceptual Hashing &amp; Blockchain Technology.
            </p>
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