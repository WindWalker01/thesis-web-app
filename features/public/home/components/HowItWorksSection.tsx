"use client";

import Image from "next/image";
import { InfoIcon, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { HOW_IT_WORKS_STEPS } from "@/features/public/home/content";

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="bg-background-light dark:bg-background-dark py-16 md:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="border-primary/10 flex flex-col items-center gap-10 rounded-3xl border bg-gray-100 p-6 shadow-2xl md:flex-row md:p-12 lg:gap-20 lg:p-20 dark:bg-slate-900">
          <motion.div
            className="relative aspect-video w-full overflow-hidden rounded-2xl md:w-1/2"
            initial={{ opacity: 0, x: -80 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.3 }}
          >
            <Image
              src="/landing-page-elements/blockchain-digital-icon.webp"
              alt="Artwork Documentation Process"
              fill
              className="object-cover"
            />
          </motion.div>

          <motion.div
            className="w-full space-y-6 md:w-1/2"
            initial={{ opacity: 0, x: 80 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            viewport={{ once: true, amount: 0.3 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-1.5">
              <ShieldCheck className="h-3 w-3 text-blue-400" />
              <span className="text-[10px] font-bold tracking-widest text-blue-400 uppercase">
                How It Works
              </span>
            </div>
            <h2 className="text-2xl leading-tight font-black text-slate-900 md:text-3xl dark:text-white">
              Document, Detect, and
              <br />
              Establish Authorship
            </h2>
            <p className="text-justify text-base leading-relaxed text-slate-600 dark:text-slate-300">
              ArtForgeLab is a research-based intellectual property rights
              management system that helps digital artists document their work,
              detect visually similar artworks, and establish verifiable proof
              of authorship using cryptographic hashing and blockchain
              technology.
            </p>
            <ul className="space-y-3">
              {HOW_IT_WORKS_STEPS.map((item, index) => (
                <motion.li
                  key={item.title}
                  className="group relative flex cursor-pointer items-center gap-3 text-base font-medium"
                  initial={{ opacity: 0, x: 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.15 }}
                  viewport={{ once: true }}
                >
                  <div className="h-6 w-6 shrink-0">
                    <Image
                      src="/landing-page-elements/shield-fill-check1.svg"
                      alt="Check"
                      width={24}
                      height={24}
                    />
                  </div>
                  <span className="transition-colors group-hover:text-blue-500">
                    {item.title}
                  </span>
                  <InfoIcon className="text-primary h-4 w-4 shrink-0 animate-pulse opacity-70 group-hover:opacity-100" />
                  <div className="pointer-events-none absolute top-10 left-0 z-50 w-[min(24rem,90vw)] scale-95 rounded-xl border-2 border-blue-950 bg-blue-300 p-4 opacity-0 shadow-2xl transition-all duration-300 group-hover:-translate-y-1 group-hover:scale-100 group-hover:opacity-100">
                    <p className="text-primary text-justify text-base leading-relaxed dark:text-slate-300">
                      {item.desc}
                    </p>
                  </div>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
