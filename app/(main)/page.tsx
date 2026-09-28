"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { ProductStackSection } from "@/features/public/home/components/ProductStackSection";
import { heroScrollMotion } from "@/features/public/home/hero-scroll";

export default function Home() {
  const heroRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion() === true;

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end end"],
  });

  const y = useTransform(scrollYProgress, (progress) =>
    heroScrollMotion(reduceMotion ? 0 : progress).y,
  );
  const scale = useTransform(scrollYProgress, (progress) =>
    heroScrollMotion(reduceMotion ? 0 : progress).scale,
  );
  const opacity = useTransform(scrollYProgress, (progress) =>
    heroScrollMotion(reduceMotion ? 0 : progress).opacity,
  );
  const maskImage = useTransform(scrollYProgress, (progress) =>
    heroScrollMotion(reduceMotion ? 0 : progress).maskImage,
  );

  return (
    <main className="h-full w-full">
      <section
        ref={heroRef}
        className={reduceMotion ? "min-h-screen" : "relative h-[160vh]"}
      >
        <div className="sticky top-0 flex h-screen flex-col items-center justify-center">
          <motion.div
            style={{ y, scale, opacity, maskImage, WebkitMaskImage: maskImage }}
            className="flex origin-center flex-col items-center will-change-transform"
          >
            <h1 className="text-center text-6xl leading-18 font-semibold tracking-wider">
              Document your <br />{" "}
              <span className="text-blue-500">Digital Artwork</span>
            </h1>
            <p className="text-normal mt-7 max-w-120 text-center">
              Upload, classify, and document your digital artwork. Detect visually
              similar works using perceptual hashing. Secure immutable evidence on
              the blockchain and establish verifiable proof of authorship.
            </p>

            <Link
              href={"upload-artwork"}
              className="mt-7 rounded-xs bg-blue-700 px-6 py-4 text-sm"
            >
              TRY UPLOADING ARTWORK
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="min-h-screen">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <h1 className="text-start text-6xl leading-15 font-semibold tracking-wider">
            End-to-end money movement in{" "}
            <span className="text-blue-500">one dashboard.</span>
          </h1>

          <p>
            Accept deposits, convert currencies, move funds, pay out to 100+
            countries, and monitor every transaction in real time — from a
            single interface.
          </p>
        </div>

        <div className="relative mx-auto mt-20 max-w-4xl">
          <Image
            src="/landing-page-elements/transactions.png"
            alt="Polygonscan contract transactions"
            width={1280}
            height={900}
            className="h-auto w-full rounded-t-lg"
          />
          <div className="from-background pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t to-transparent" />
        </div>

        <div className="mx-auto mt-20 h-25 max-w-[100rem] bg-green-100">
          <p>all technologies used</p>
        </div>
      </section>

      <section className="mx-auto mt-20 mb-16 max-w-7xl">
        <div className="flex flex-col gap-5 text-start">
          <h1 className="text-5xl font-normal">
            The first new money rail
            <br /> in fifty years
          </h1>
          <p className="max-w-2xl">
            If your business moves money across borders, you&apos;re used to
            cut-off times, weekend delays, and fees taken by every bank in
            between. Stablecoins settle in seconds, any day of the year, cost a
            fraction as much, and can be programmed to move the moment they
            land.
          </p>
        </div>

        <div className="mt-10 flex gap-2">
          <div
            className="h-110 w-100 overflow-hidden rounded-tl-lg rounded-tr-lg rounded-bl-lg bg-black px-7 py-5"
            style={{
              clipPath:
                "polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)",
            }}
          >
            <div>
              <p className="mb-2 text-2xl">Move money in seconds</p>
              <p className="text-sm">Instant, final, weekends included.</p>
            </div>

            <div className="h-full bg-amber-200">image</div>
          </div>

          <div
            className="h-110 w-100 overflow-hidden rounded-tl-lg rounded-tr-lg rounded-bl-lg bg-black px-7 py-5"
            style={{
              clipPath:
                "polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)",
            }}
          >
            <div>
              <p className="mb-2 text-2xl">Move money in seconds</p>
              <p className="text-sm">Instant, final, weekends included.</p>
            </div>

            <div className="h-full bg-amber-200">image</div>
          </div>

          <div
            className="h-110 w-100 overflow-hidden rounded-tl-lg rounded-tr-lg rounded-bl-lg bg-black px-7 py-5"
            style={{
              clipPath:
                "polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)",
            }}
          >
            <div>
              <p className="mb-2 text-2xl">Move money in seconds</p>
              <p className="text-sm">Instant, final, weekends included.</p>
            </div>

            <div className="h-full bg-amber-200">image</div>
          </div>
        </div>
      </section>

      <ProductStackSection />
    </main>
  );
}
