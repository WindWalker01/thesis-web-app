"use client";

import { ShieldUser } from "lucide-react";
import { motion } from "framer-motion";
import { WHY_CHOOSE_ITEMS } from "@/features/public/home/content";

type WhyChooseSectionProps = {
  platformName: string;
};

export function WhyChooseSection({ platformName }: WhyChooseSectionProps) {
  return (
    <section className="relative overflow-hidden bg-blue-950 py-16 text-white select-none md:py-24">
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/8 blur-3xl" />
      <div className="pointer-events-none absolute top-0 left-0 h-72 w-72 -translate-x-1/3 rounded-full bg-blue-400/5 blur-3xl" />
      <div className="pointer-events-none absolute right-0 bottom-0 h-72 w-72 translate-x-1/3 rounded-full bg-blue-400/5 blur-3xl" />

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "radial-gradient(rgba(148,163,184,1) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center md:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true, amount: 0.5 }}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-4 py-1.5"
          >
            <ShieldUser className="h-3 w-3 text-blue-300" />
            <span className="text-[10px] font-bold tracking-widest text-blue-300 uppercase">
              Why Choose {platformName}?
            </span>
          </motion.div>
          <motion.h2
            className="mb-3 text-2xl font-black md:text-3xl lg:text-4xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            viewport={{ once: true, amount: 0.5 }}
          >
            Built for Digital Artists
          </motion.h2>
          <motion.p
            className="text-base text-slate-400 md:text-base"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true, amount: 0.5 }}
          >
            Research-driven tools for documenting authorship and detecting
            possible plagiarism.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {WHY_CHOOSE_ITEMS.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.09 }}
                viewport={{ once: true, amount: 0.2 }}
                className="group relative cursor-default overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 transition-all duration-300 md:p-7"
                style={{
                  ["--glow" as string]: item.glow,
                  ["--border-glow" as string]: item.border,
                }}
              >
                <div
                  className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{
                    background: `radial-gradient(ellipse at 30% 30%, ${item.glow}, transparent 70%)`,
                  }}
                />
                <div
                  className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{
                    boxShadow: `inset 0 0 0 1px ${item.border}, 0 0 32px ${item.glow}`,
                  }}
                />
                <div
                  className="pointer-events-none absolute -top-4 -left-4 h-20 w-20 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-60"
                  style={{ background: item.glow }}
                />

                <div className="relative z-10">
                  <div
                    className={`h-12 w-12 rounded-xl ${item.iconBg} mb-5 flex items-center justify-center transition-colors duration-300 group-hover:scale-110 group-hover:brightness-110`}
                  >
                    <Icon
                      className={`h-6 w-6 ${item.iconColor}`}
                      strokeWidth={1.8}
                    />
                  </div>
                  <h3 className="mb-2 text-lg font-black text-white">
                    {item.title}
                  </h3>
                  <p className="text-base leading-relaxed text-slate-400 transition-colors duration-300 group-hover:text-slate-300">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
