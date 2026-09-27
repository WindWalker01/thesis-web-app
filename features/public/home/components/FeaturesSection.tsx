"use client";

import { Blocks } from "lucide-react";
import { motion } from "framer-motion";
import { PLATFORM_FEATURES } from "@/features/public/home/content";

export function FeaturesSection() {
  return (
    <section id="features" className="bg-orange-300/20 py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center md:mb-16">
          <motion.div
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-400/25 bg-orange-500/10 px-4 py-1.5"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            viewport={{ once: true, amount: 0.5 }}
          >
            <Blocks className="h-3 w-3 text-orange-400" />
            <span className="text-[10px] font-bold tracking-widest text-orange-500 uppercase">
              Platform Features
            </span>
          </motion.div>
          <motion.h2
            className="mb-3 text-2xl font-black md:text-3xl lg:text-4xl"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
            viewport={{ once: true, amount: 0.5 }}
          >
            Tools for Digital Artists
          </motion.h2>
          <motion.p
            className="text-base text-slate-600 md:text-base dark:text-slate-300"
            initial={{ opacity: 0, scale: 0.85, y: 16 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
              duration: 0.4,
              ease: [0.34, 1.56, 0.64, 1],
              delay: 0.1,
            }}
            viewport={{ once: true, amount: 0.5 }}
          >
            Research-backed capabilities designed to assist artists in
            documenting and protecting their work.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
          {PLATFORM_FEATURES.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.35,
                  ease: [0.25, 0.1, 0.25, 1],
                  delay: index * 0.07,
                }}
                viewport={{ once: true, amount: 0.2 }}
                className="group cursor-pointer rounded-2xl border border-transparent bg-white p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-orange-300 hover:shadow-xl md:p-8 dark:bg-slate-900 dark:hover:border-orange-500/30"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500 transition-all duration-300 group-hover:bg-orange-500 group-hover:text-white">
                  <Icon className="h-6 w-6" strokeWidth={1.8} />
                </div>
                <h3 className="mb-2 text-lg font-black transition-colors group-hover:text-orange-500">
                  {item.label}
                </h3>
                <p className="text-base leading-relaxed text-slate-500">
                  {item.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
