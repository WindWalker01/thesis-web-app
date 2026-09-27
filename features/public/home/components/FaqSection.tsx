"use client";

import { useState } from "react";
import { AlertTriangle, Plus } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import {
  HOME_FAQS,
  initialOpenFaqIndex,
} from "@/features/public/home/content";

type FaqSectionProps = {
  platformName: string;
};

export function FaqSection({ platformName }: FaqSectionProps) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(
    initialOpenFaqIndex(HOME_FAQS),
  );

  return (
    <section
      id="faq-section"
      className="relative overflow-hidden py-16 md:py-24"
    >
      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-slate-50 to-orange-50/30 dark:from-slate-950 dark:to-slate-900" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-400/5 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true, amount: 0.5 }}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-400/25 bg-orange-500/10 px-4 py-1.5"
          >
            <AlertTriangle className="h-3 w-3 text-orange-400" />
            <span className="text-[10px] font-bold tracking-widest text-orange-500 uppercase">
              Got Questions?
            </span>
          </motion.div>
          <motion.h2
            className="mb-3 text-2xl font-black md:text-3xl lg:text-4xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            viewport={{ once: true, amount: 0.5 }}
          >
            Frequently Asked Questions
          </motion.h2>
          <motion.p
            className="text-base text-slate-500 dark:text-slate-300"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true, amount: 0.5 }}
          >
            Everything you need to know about {platformName} and how it works.
          </motion.p>
        </div>

        <div className="space-y-3">
          {HOME_FAQS.map((faq, i) => {
            const isOpen = openFaqIndex === i;

            return (
              <motion.div
                key={faq.q}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                viewport={{ once: true, amount: 0.2 }}
                className={`overflow-hidden rounded-2xl border transition-all duration-300 ${
                  isOpen
                    ? "border-orange-400/50 bg-white shadow-[0_4px_24px_rgba(251,146,60,0.1)] dark:bg-slate-900"
                    : "border-slate-200 bg-white hover:border-orange-300/60 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-orange-500/30"
                }`}
              >
                <button
                  className="group flex w-full cursor-pointer items-center justify-between p-5 text-left md:p-6"
                  onClick={() => setOpenFaqIndex(isOpen ? null : i)}
                >
                  <span
                    className={`pr-4 text-base font-semibold transition-colors md:text-base ${isOpen ? "text-orange-500" : "group-hover:text-orange-500"}`}
                  >
                    {faq.q}
                  </span>
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all duration-300 ${
                      isOpen
                        ? "rotate-45 bg-orange-500"
                        : "bg-slate-100 group-hover:bg-orange-100 dark:bg-slate-800 dark:group-hover:bg-orange-900/30"
                    }`}
                  >
                    <Plus
                      className={`h-4 w-4 transition-colors ${isOpen ? "text-white" : "text-slate-500 group-hover:text-orange-500"}`}
                    />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{
                        height: "auto",
                        opacity: 1,
                        transition: {
                          height: {
                            duration: 0.28,
                            ease: [0.04, 0.62, 0.23, 0.98],
                          },
                          opacity: { duration: 0.22, delay: 0.08 },
                        },
                      }}
                      exit={{
                        height: 0,
                        opacity: 0,
                        transition: {
                          height: {
                            duration: 0.26,
                            ease: [0.04, 0.62, 0.23, 0.98],
                          },
                          opacity: { duration: 0.18 },
                        },
                      }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 md:px-6 md:pb-6">
                        <div className="mb-4 h-px bg-slate-100 dark:bg-slate-800" />
                        <p className="text-base leading-relaxed text-slate-500 dark:text-slate-300">
                          {faq.a}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
