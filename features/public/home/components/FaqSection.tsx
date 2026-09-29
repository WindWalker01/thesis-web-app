"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Plus } from "lucide-react";
import { HOME_FAQS, initialOpenFaqIndex } from "@/features/public/home/content";
import { cn } from "@/lib/client-utils";

const PANEL_EASE = [0.04, 0.62, 0.23, 0.98] as const;

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(() =>
    initialOpenFaqIndex(HOME_FAQS),
  );
  const reduceMotion = useReducedMotion() === true;

  return (
    <section id="faq-section" className="scroll-mt-24 mt-16 pb-24 md:mt-24 md:pb-32">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-foreground text-4xl font-normal tracking-tight md:text-5xl">
            Frequently asked questions
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600 md:text-lg dark:text-slate-300">
            How registration, similarity checks, and the on-chain record work.
          </p>
        </div>

        <div className="mt-12 space-y-3">
          {HOME_FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            const panelId = `faq-panel-${index}`;
            const triggerId = `faq-trigger-${index}`;

            return (
              <div
                key={faq.q}
                className={cn(
                  "overflow-hidden rounded-2xl border bg-white transition-colors duration-300 dark:bg-slate-900",
                  isOpen
                    ? "border-blue-400/70 shadow-[0_8px_28px_rgba(59,130,246,0.1)]"
                    : "border-slate-200 hover:border-blue-300/70 dark:border-slate-800 dark:hover:border-blue-500/40",
                )}
              >
                <button
                  id={triggerId}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  className="group flex w-full cursor-pointer items-center justify-between gap-4 p-5 text-left focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none focus-visible:ring-inset md:p-6"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                >
                  <span
                    className={cn(
                      "text-base font-medium transition-colors",
                      isOpen
                        ? "text-blue-500"
                        : "text-foreground group-hover:text-blue-500",
                    )}
                  >
                    {faq.q}
                  </span>
                  <span
                    className={cn(
                      "flex size-7 shrink-0 items-center justify-center rounded-lg transition-all duration-300",
                      isOpen
                        ? "rotate-45 bg-blue-500"
                        : "bg-slate-100 group-hover:bg-blue-500/10 dark:bg-slate-800",
                    )}
                  >
                    <Plus
                      className={cn(
                        "size-4 transition-colors",
                        isOpen
                          ? "text-white"
                          : "text-slate-500 group-hover:text-blue-500",
                      )}
                    />
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen ? (
                    <motion.div
                      id={panelId}
                      role="region"
                      aria-labelledby={triggerId}
                      initial={reduceMotion ? false : { height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={
                        reduceMotion ? undefined : { height: 0, opacity: 0 }
                      }
                      transition={
                        reduceMotion
                          ? { duration: 0 }
                          : {
                              height: { duration: 0.28, ease: PANEL_EASE },
                              opacity: { duration: 0.2 },
                            }
                      }
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 md:px-6 md:pb-6">
                        <div className="mb-4 h-px bg-slate-100 dark:bg-slate-800" />
                        <p className="text-base leading-relaxed text-slate-600 dark:text-slate-300">
                          {faq.a}
                        </p>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
