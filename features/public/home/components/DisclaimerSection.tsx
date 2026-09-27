import { InfoIcon } from "lucide-react";

export function DisclaimerSection() {
  return (
    <section className="bg-slate-50 px-4 py-12 dark:bg-slate-950">
      <div className="mx-auto max-w-3xl text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-1.5">
          <InfoIcon className="h-3 w-3 text-blue-400" />
          <span className="text-[10px] font-bold tracking-widest text-blue-400 uppercase">
            Disclaimer
          </span>
        </div>
        <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          ArtForgeLab is a research-based intellectual property rights
          management system developed as an undergraduate thesis. It is
          designed to assist digital artists in documenting authorship,
          detecting visually similar artworks, and maintaining transparent
          records. It does not replace formal copyright registration with
          IPOPHL or other legal authorities. The platform does not grant
          copyright, guarantee ownership dispute resolution, or automatically
          determine legal infringement.
        </p>
      </div>
    </section>
  );
}
