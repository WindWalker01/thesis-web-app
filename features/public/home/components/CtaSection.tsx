import Link from "next/link";
import { Upload } from "lucide-react";
import {
  closingCtaLabel,
  homeSignupHref,
} from "@/features/public/home/content";

type CtaSectionProps = {
  isAuthenticated: boolean;
};

export function CtaSection({ isAuthenticated }: CtaSectionProps) {
  return (
    <section className="px-4 py-16">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-linear-to-r from-orange-400 via-amber-500 to-amber-400 p-6 text-center text-white sm:p-10 md:p-14">
        <div className="pointer-events-none absolute top-0 left-1/4 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute right-1/4 bottom-0 h-64 w-64 rounded-full bg-orange-300/20 blur-3xl" />

        <div className="relative z-10">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-4 py-1.5">
            <Upload className="h-3 w-3 text-white" />
            <span className="text-[10px] font-bold tracking-widest text-white uppercase">
              Get Started Today
            </span>
          </div>
          <h2 className="mb-4 text-2xl font-black md:mb-5 md:text-4xl">
            Start Documenting Your Artwork Today
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-base leading-relaxed opacity-90 md:mb-10 md:text-xl">
            Build your portfolio, establish proof of authorship, and join a
            community of digital artists documenting their creative work.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href={homeSignupHref(isAuthenticated)}
              className="rounded-xl bg-white px-8 py-4 text-base font-black text-orange-500 shadow-lg transition-transform hover:scale-105 md:px-10"
            >
              {closingCtaLabel(isAuthenticated)}
            </Link>
            <Link
              href="/about"
              className="rounded-xl border border-white/30 bg-white/20 px-8 py-4 text-base font-bold text-white backdrop-blur-md transition-all hover:bg-white/30 md:px-10"
            >
              About Us
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
