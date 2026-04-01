import Image from "next/image";
import {
    FileClockIcon, Scale,
    Mail, Share2Icon, Globe, BookOpen, ShieldCheck,
    FileText, Users, Blocks, AlertTriangle, MapPin, BrainCircuit,
} from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-background text-white mt-10">

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
                <hr className="bg-white/5 mb-10" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12 mb-12 md:mb-14">
                    <div className="sm:col-span-2 lg:col-span-1 space-y-5">
                        <div className="flex items-center gap-2">
                            <Image src="/landing-page-elements/AFL_logoWeb.png" alt="Logo" width={60} height={70} className="shrink-0" />
                            <span className="text-lg font-bold tracking-tight">
                                <span className="text-blue-400">Art</span>
                                <span className="text-orange-500">Forge</span>
                                <span className="text-white">Lab</span>
                            </span>
                        </div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-blue-400 border-l-2 border-blue-500 pl-3">Advancing Digital IP Protection</p>
                        <p className="text-sm text-slate-400 leading-relaxed text-justify">
                            ArtForgeLab is an academic research initiative developing a Web-based Intellectual Property Rights Management System for Digital Artists. The system integrates{" "}
                            <span className="text-slate-200 font-medium">Perceptual Hashing</span> algorithms and{" "}
                            <span className="text-slate-200 font-medium">Blockchain Technology</span>{" "}
                            to provide secure proof of authorship, plagiarism detection, and transparent ownership verification.
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
                                { icon: FileText, label: "Artwork Registration" },
                                { icon: ShieldCheck, label: "Proof of Authorship" },
                                { icon: Blocks, label: "Plagiarism Detection" },
                                { icon: Scale, label: "Ownership Verification" },
                                { icon: Users, label: "Community Gallery" },
                                { icon: FileClockIcon, label: "Dispute & Complaint Management" },
                            ].map(({ icon: Icon, label }) => (
                                <li key={label}>
                                    <a href="#" className="flex items-center gap-2 hover:text-blue-400 transition-colors group">
                                        <Icon className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 shrink-0" />
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
                                { icon: BookOpen, label: "Intellectual Property Guide" },
                                { icon: BrainCircuit, label: "How Perceptual Hashing Works" },
                                { icon: Scale, label: "Research Documentation" },
                            ].map(({ icon: Icon, label }) => (
                                <li key={label}>
                                    <a href="#" className="flex items-center gap-2 hover:text-blue-400 transition-colors group">
                                        <Icon className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 shrink-0" />
                                        <span>{label}</span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="space-y-5">
                        <h4 className="text-sm font-bold uppercase tracking-widest text-slate-200 border-b border-slate-700 pb-3">Research Team</h4>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            This system was developed as partial fulfillment of an undergraduate thesis requirement. For academic inquiries or collaboration proposals, please reach out below.
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
    );
}