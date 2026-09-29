"use client";

import Link from "next/link";
import { HOME_CTA } from "@/features/public/home/content";
import {
  BUTTON_CORNER_CLIP,
  ScrambledText,
  useScrambleHover,
} from "@/features/public/home/components/ScrambledText";

const PANEL_CLIP =
  "polygon(0 0, 100% 0, 100% calc(100% - 28px), calc(100% - 28px) 100%, 0 100%)";

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
        className="inline-flex bg-white/25 p-px text-sm whitespace-nowrap text-white"
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
      className="mt-16 scroll-mt-24 px-4 sm:px-6 md:mt-24 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden border border-white/5 bg-linear-to-t from-blue-800 to-blue-600 px-6 py-14 text-center text-white sm:px-10 md:px-16 md:py-40">
          <div className="relative mx-auto max-w-3xl">
            <h2
              id="get-started-heading"
              className="mt-4 text-4xl font-normal tracking-tight md:text-5xl"
            >
              {HOME_CTA.titleLead}{" "}
              <span className="text-blue-500">{HOME_CTA.titleAccent}</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-300 md:text-lg">
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
