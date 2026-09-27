"use client";

import Image from "next/image";
import { ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { AUTHORSHIP_HIGHLIGHTS } from "@/features/public/home/content";

type ProofOfAuthorshipSectionProps = {
  platformName: string;
};

export function ProofOfAuthorshipSection({
  platformName,
}: ProofOfAuthorshipSectionProps) {
  const [collectorsRef, collectorsInView] = useInView({
    threshold: 0.3,
    triggerOnce: true,
    delay: 100,
  });

  return (
    <section className="py-16 md:py-24" ref={collectorsRef}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-24">
          <div className="w-full space-y-8 lg:w-1/2">
            <motion.div
              initial={{ opacity: 0 }}
              animate={collectorsInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-1.5"
            >
              <ShieldCheck className="h-3 w-3 text-blue-400" />
              <span className="text-[10px] font-bold tracking-widest text-blue-400 uppercase">
                Evidence-Based Authorship
              </span>
            </motion.div>
            <motion.h2
              className="text-3xl leading-tight font-black md:text-4xl lg:text-5xl"
              initial={{ y: 30, opacity: 0 }}
              animate={
                collectorsInView ? { y: 0, opacity: 1 } : { y: 30, opacity: 0 }
              }
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              Establish Proof of Authorship
            </motion.h2>
            <motion.p
              className="text-base text-slate-600 md:text-lg dark:text-slate-300"
              initial={{ y: 30, opacity: 0 }}
              animate={
                collectorsInView ? { y: 0, opacity: 1 } : { y: 30, opacity: 0 }
              }
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            >
              When you register an artwork on {platformName}, the system
              generates a cryptographic hash — a unique digital fingerprint of
              your file — and records it on the blockchain. This creates an
              immutable, timestamped record that can serve as evidence of
              authorship at a specific point in time. Combined with perceptual
              hashing for similarity detection, the platform provides
              transparent, auditable documentation that supports your claim as
              the original creator.
            </motion.p>
            <div className="flex flex-col gap-4 sm:flex-row">
              {AUTHORSHIP_HIGHLIGHTS.map((item, index) => (
                <motion.div
                  key={item.label}
                  className="bg-background-light flex-1 rounded-xl border-l-4 border-blue-400 p-5 shadow-[0_4px_24px_rgba(59,130,246,0.12)] md:p-6 dark:bg-slate-900"
                  initial={{ clipPath: "inset(0 100% 0 0)" }}
                  animate={
                    collectorsInView
                      ? { clipPath: "inset(0 0 0 0)" }
                      : { clipPath: "inset(0 100% 0 0)" }
                  }
                  transition={{
                    duration: 0.8,
                    ease: [0.25, 0.1, 0.25, 1],
                    delay: index * 0.15,
                  }}
                >
                  <div className="text-xl font-black text-blue-500 md:text-2xl">
                    {item.stat}
                  </div>
                  <div className="mt-0.5 text-base text-slate-500">
                    {item.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="w-full lg:w-1/2">
            <motion.div
              className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl shadow-[0_8px_60px_rgba(59,130,246,0.2)] sm:aspect-[4/3] lg:aspect-[4/3]"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={
                collectorsInView
                  ? { scale: 1, opacity: 1 }
                  : { scale: 0.8, opacity: 0 }
              }
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <Image
                src="/landing-page-elements/ip-background-image.jpg"
                alt="Proof of authorship documentation"
                fill
                className="object-cover"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
