"use client";

import Link from "next/link";
import { HOME_CTA } from "@/features/public/home/content";
import {
  BUTTON_CORNER_CLIP,
  ScrambledText,
  useScrambleHover,
} from "@/features/public/home/components/ScrambledText";

/** Width and height of each CTA background grid cell, in pixels. */
const CTA_GRID_SIZE = 48;

function CtaGrid() {
  const cell = `${CTA_GRID_SIZE}px`;

  return (
    <div
      aria-hidden
      data-cta-grid=""
      className="pointer-events-none absolute inset-0 text-blue-500/40 dark:text-blue-200/30"
      style={{
        backgroundImage:
          "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
        backgroundSize: `${cell} ${cell}`,
        maskImage:
          "linear-gradient(to top, black 0%, rgba(0, 0, 0, 0.45) 32%, transparent 68%)",
        WebkitMaskImage:
          "linear-gradient(to top, black 0%, rgba(0, 0, 0, 0.45) 32%, transparent 68%)",
      }}
    />
  );
}

function ChamferLink({
  href,
  label,
  tone,
}: {
  href: string;
  label: string;
  tone: "solid" | "outline";
}) {
  const { display, scrambleHover } = useScrambleHover(label);

  if (tone === "outline") {
    return (
      <Link
        href={href}
        aria-label={label}
        {...scrambleHover}
        className="inline-flex bg-slate-300 p-px text-sm whitespace-nowrap text-white dark:bg-white/25"
        style={{ clipPath: BUTTON_CORNER_CLIP }}
      >
        <span
          className="inline-flex bg-[#0f1013] px-6 py-4"
          style={{ clipPath: BUTTON_CORNER_CLIP }}
        >
          <ScrambledText text={label} display={display} />
        </span>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      aria-label={label}
      {...scrambleHover}
      className="inline-flex bg-blue-700 px-6 py-4 text-sm whitespace-nowrap text-white"
      style={{ clipPath: BUTTON_CORNER_CLIP }}
    >
      <ScrambledText text={label} display={display} />
    </Link>
  );
}

export function CtaSection({ signedIn }: { signedIn: boolean }) {
  const primary = signedIn
    ? HOME_CTA.primarySignedIn
    : HOME_CTA.primarySignedOut;

  return (
    <section
      id="get-started"
      aria-labelledby="get-started-heading"
      className="mt-16 -mb-10 scroll-mt-24 sm:px-6 md:mt-24 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden border border-blue-200 bg-linear-to-t from-blue-100 to-blue-50 px-5 py-12 text-center text-slate-900 sm:px-10 sm:py-16 lg:px-16 lg:py-40 dark:border-white/10 dark:from-blue-950 dark:to-blue-900 dark:text-white">
          <CtaGrid />
          <div className="relative z-10 mx-auto max-w-3xl">
            <h2
              id="get-started-heading"
              className="mt-4 text-3xl leading-tight font-normal tracking-tight text-balance sm:text-4xl md:text-5xl"
            >
              {HOME_CTA.titleLead}{" "}
              <span className="text-blue-600 dark:text-blue-400">
                {HOME_CTA.titleAccent}
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-600 md:text-lg dark:text-slate-300">
              {HOME_CTA.description}
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <ChamferLink
                href={primary.href}
                label={primary.label}
                tone="solid"
              />
              <ChamferLink
                href={HOME_CTA.secondary.href}
                label={HOME_CTA.secondary.label}
                tone="outline"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
