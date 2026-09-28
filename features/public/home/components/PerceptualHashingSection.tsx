"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
  Check,
  ShieldCheck,
  ArrowRight,
  Terminal as TerminalIcon,
} from "lucide-react";

const CARD_CLIP =
  "polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)";

export function PerceptualHashingSection() {
  return (
    <section className="mx-auto mt-24 mb-20 max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="flex flex-col gap-4 text-start">
        <h2 className="text-foreground text-4xl font-normal tracking-tight md:text-5xl">
          The visual fingerprint that
          <br /> survives any modification
        </h2>
        <p className="text-muted-foreground max-w-2xl text-base leading-relaxed md:text-lg">
          Cryptographic hashes break if a single pixel shifts or an image is
          compressed. Our perceptual hashing engine decomposes visual structure
          across rotations, reflections, and frequency bands — detecting
          unauthorized derivatives and stolen art in milliseconds.
        </p>
      </div>

      {/* 3 Cards Grid */}
      <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
        {/* CARD 1: Transform Invariance */}
        <div
          className="flex min-h-[530px] flex-col justify-between overflow-hidden rounded-tl-xl rounded-tr-xl rounded-bl-xl border border-white/5 bg-[#0f1013] p-7 text-white"
          style={{ clipPath: CARD_CLIP }}
        >
          <div>
            <h3 className="mb-2 text-2xl font-normal">
              Cross-transform invariance
            </h3>
            <p className="text-sm text-neutral-400">
              Rotated, mirrored, or flipped — nothing slips past.
            </p>
          </div>

          {/* Centered White Card Mockup */}
          <div className="my-auto flex w-full flex-1 flex-col items-center justify-center py-4">
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-[340px] rounded-2xl bg-white p-5 text-neutral-900 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <span className="text-xs font-semibold tracking-wider text-neutral-500 uppercase">
                  Variant Normalization
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-600" />
                  </span>
                  Preprocessed
                </span>
              </div>

              {/* WitchCat Comparison preview */}
              <div className="mt-3.5 flex items-center justify-between gap-2.5 rounded-xl bg-neutral-50 p-2.5">
                {/* Original Thumbnail */}
                <div className="flex flex-col items-center gap-1">
                  <div className="relative h-16 w-16 overflow-hidden rounded-lg border border-neutral-200 shadow-xs">
                    <Image
                      src="/landing-page-elements/WitchCat.png"
                      alt="Original WitchCat"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <span className="font-mono text-[10px] text-neutral-500">
                    0° Original
                  </span>
                </div>

                {/* Animated Flow Arrow */}
                <div className="flex flex-col items-center gap-1">

                    <ArrowRight className="h-4 w-4 text-purple-600" />

                  <span className="font-mono text-[9px] font-bold text-purple-600">
                    pHash
                  </span>
                </div>

                {/* Mirrored/Transformed with Laser Scanline */}
                <div className="flex flex-col items-center gap-1">
                  <div className="relative h-16 w-16 overflow-hidden rounded-lg border border-neutral-200 shadow-xs">
                    <Image
                      src="/landing-page-elements/WitchCat.png"
                      alt="Mirrored and Grayscale WitchCat"
                      fill
                      className="-scale-x-100 object-cover blur-[0.4px] grayscale filter"
                    />
                    {/* Animated vertical laser scanline */}
                    <motion.div
                      className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent shadow-[0_0_8px_rgba(168,85,247,0.8)]"
                      animate={{ top: ["0%", "88%", "0%"] }}
                      transition={{
                        repeat: Infinity,
                        duration: 2.2,
                        ease: "linear",
                      }}
                    />
                  </div>
                  <span className="font-mono text-[10px] text-neutral-500">
                    Mirror (L)
                  </span>
                </div>
              </div>

              {/* Transform Specs */}
              <div className="mt-3 space-y-1 text-[11px] text-neutral-600">
                <div className="flex justify-between">
                  <span>Filter applied:</span>
                  <span className="font-mono font-medium text-neutral-900">
                    Gaussian Blur (r=1)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Orientations:</span>
                  <span className="font-mono font-medium text-neutral-900">
                    6 Variant Matrices
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="mt-3.5 w-full rounded-xl bg-[#7b3fe4] py-2.5 text-xs font-medium text-white transition hover:bg-[#682ecf] active:scale-[0.99]"
              >
                Inspect Transform Matrix
              </button>
            </motion.div>
          </div>
        </div>

        {/* CARD 2: Weighted Hamming Distance */}
        <div
          className="flex min-h-[530px] flex-col justify-between overflow-hidden rounded-tl-xl rounded-tr-xl rounded-bl-xl border border-white/5 bg-[#0f1013] p-7 text-white"
          style={{ clipPath: CARD_CLIP }}
        >
          <div>
            <h3 className="mb-2 text-2xl font-normal">
              Weighted Hamming distance
            </h3>
            <p className="text-sm text-neutral-400">
              pHash, dHash, and wHash weighted to eliminate false positives.
            </p>
          </div>

          {/* Centered Dark Terminal Mockup */}
          <div className="my-auto flex w-full flex-1 flex-col items-center justify-center py-4">
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-[340px] rounded-2xl border border-white/10 bg-[#07080a] p-5 font-mono text-xs shadow-2xl"
            >
              {/* macOS window controls */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3 text-neutral-400">
                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
                </div>
                <span className="flex items-center gap-1 text-[11px] text-neutral-400">
                  <TerminalIcon className="h-3 w-3" /> compare_hashes.py
                </span>
              </div>

              {/* Code lines */}
              <div className="mt-3.5 space-y-1.5 text-[11px] leading-relaxed">
                <p className="text-neutral-400">
                  <span className="text-purple-400">target</span> =
                  &quot;WitchCat.png&quot;
                </p>
                <p className="text-purple-400">
                  weights = &#123;
                  <span className="text-amber-300">&quot;phash&quot;</span>: 0.8,{" "}
                  <span className="text-amber-300">&quot;dhash&quot;</span>: 0.1,{" "}
                  <span className="text-amber-300">&quot;whash&quot;</span>: 0.1
                  &#125;
                </p>
                <p className="text-neutral-300">
                  dist = compute_weighted_distance(h1, h2)
                </p>
                <p className="text-neutral-400">
                  score = (1 - (2.4 / 64)) * 100
                </p>
                <div className="pt-0.5 text-neutral-500">
                  <span>&gt; calculating</span>
                  <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    className="ml-1 inline-block h-3 w-1.5 bg-emerald-400 align-middle"
                  />
                </div>
              </div>

              {/* Animated Progress Bar */}
              <div className="mt-3.5">
                <div className="mb-1 flex justify-between text-[10px] text-neutral-400">
                  <span>Consensus Match</span>
                  <span className="font-semibold text-emerald-400">96.25%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-800">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-purple-500 to-emerald-400"
                    initial={{ width: "0%" }}
                    whileInView={{ width: "96.25%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
                  />
                </div>
              </div>

              {/* Terminal Result Status */}
              <div className="mt-3.5 flex items-center gap-2 border-t border-white/10 pt-3 font-sans text-xs text-emerald-400">
                <motion.div
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ repeat: Infinity, duration: 2.2 }}
                >
                  <Check className="h-4 w-4 shrink-0 text-emerald-400" />
                </motion.div>
                <span>
                  <strong className="font-semibold text-white">96.25% Match</strong>{" "}
                  • 0° → mirror pair
                </span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* CARD 3: Reverse Web Scan & Zero Retention */}
        <div
          className="flex min-h-[530px] flex-col justify-between overflow-hidden rounded-tl-xl rounded-tr-xl rounded-bl-xl border border-white/5 bg-[#0f1013] p-7 text-white"
          style={{ clipPath: CARD_CLIP }}
        >
          <div>
            <h3 className="mb-2 text-2xl font-normal">
              Zero-retention web audit
            </h3>
            <p className="text-sm text-neutral-400">
              Scans Google via Serper in real-time, then purges temporary data.
            </p>
          </div>

          {/* Centered White Card Mockup */}
          <div className="my-auto flex w-full flex-1 flex-col items-center justify-center py-4">
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-[340px] rounded-2xl bg-white p-5 text-neutral-900 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <span className="text-xs font-semibold tracking-wider text-neutral-500 uppercase">
                  Reverse Image Audit
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-2 py-0.5 text-[11px] font-medium text-purple-700">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple-500 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-purple-600" />
                  </span>
                  Live Scan
                </span>
              </div>

              {/* Candidate Match details */}
              <div className="mt-3.5 space-y-2 text-xs">
                <div className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 p-2">
                  <div className="flex items-center gap-2.5">
                    <div className="relative h-6 w-6 shrink-0">
                      <Image
                        src="/landing-page-elements/google.png"
                        alt="Google Serper"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-neutral-800">
                        Serper Web Index
                      </p>
                      <p className="text-[10px] text-neutral-500">
                        1 duplicate candidate
                      </p>
                    </div>
                  </div>
                  <span className="rounded bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-600">
                    96.2% Match
                  </span>
                </div>

                <div>
                  <label className="mb-1 block text-[10px] font-semibold tracking-wider text-neutral-400 uppercase">
                    Cloud Retention Policy
                  </label>
                  <div className="flex items-center justify-between rounded-lg border border-emerald-100 bg-emerald-50/60 px-3 py-1.5 text-emerald-800">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium">
                      <motion.div
                        animate={{ scale: [1, 1.15, 1] }}
                        transition={{ repeat: Infinity, duration: 2.5 }}
                      >
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                      </motion.div>
                      Auto-purged from Cloudinary
                    </span>
                    <span className="font-mono text-[10px] font-bold">
                      200 OK
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="mt-3.5 w-full rounded-xl bg-[#7b3fe4] py-2.5 text-xs font-medium text-white transition hover:bg-[#682ecf] active:scale-[0.99]"
              >
                View Similarity Report
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
