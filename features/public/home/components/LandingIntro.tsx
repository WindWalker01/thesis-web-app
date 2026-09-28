"use client";

import Link from "next/link";
import Image from "next/image";
import { useLayoutEffect, useRef, useState } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  imageClipCss,
  imageClipPixels,
  imageLiftPixels,
  IMAGE_REVEAL_FRACTION,
  landingSceneMotion,
} from "@/features/public/home/landing-scene";

function HeroCopy() {
  return (
    <>
      <h1 className="text-center text-6xl leading-18 font-semibold tracking-wider">
        Document your <br /> <span className="text-blue-500">Digital Artwork</span>
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
    </>
  );
}

function DashboardCopy() {
  return (
    <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-12 px-6">
      <h1 className="max-w-3xl text-start text-6xl leading-15 font-semibold tracking-wider">
        End-to-end money movement in{" "}
        <span className="text-blue-500">one dashboard.</span>
      </h1>
      <p className="max-w-sm shrink-0">
        Accept deposits, convert currencies, move funds, pay out to 100+
        countries, and monitor every transaction in real time — from a single
        interface.
      </p>
    </div>
  );
}

function TransactionsImage({
  clip,
  fade = 1,
}: {
  clip: string;
  fade?: number;
}) {
  return (
    <div className="@container mx-auto w-full max-w-4xl">
      <div
        className="relative overflow-hidden rounded-t-lg"
        style={{ height: clip }}
      >
        <Image
          src="/landing-page-elements/transactions.png"
          alt="Polygonscan contract transactions"
          width={1280}
          height={900}
          priority
          className="absolute inset-x-0 top-0 h-auto w-full"
        />
        <div
          className="from-background pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t to-transparent"
          style={{ opacity: fade }}
        />
      </div>
    </div>
  );
}

export function LandingIntro() {
  const sceneRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const imageFrameRef = useRef<HTMLDivElement>(null);
  const [frameWidth, setFrameWidth] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [headingHeight, setHeadingHeight] = useState(0);
  const reduceMotion = useReducedMotion() === true;
  const { scrollYProgress } = useScroll({
    target: sceneRef,
    offset: ["start start", "end end"],
  });

  useLayoutEffect(() => {
    const measure = () => {
      setFrameWidth(imageFrameRef.current?.offsetWidth ?? 0);
      setHeadingHeight(headingRef.current?.offsetHeight ?? 0);
      setViewportHeight(window.innerHeight);
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (imageFrameRef.current) observer.observe(imageFrameRef.current);
    if (headingRef.current) observer.observe(headingRef.current);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [reduceMotion]);

  const scene = useTransform(scrollYProgress, (progress) =>
    landingSceneMotion(progress),
  );
  const y = useTransform(scene, (frame) => frame.hero.y);
  const scale = useTransform(scene, (frame) => frame.hero.scale);
  const opacity = useTransform(scene, (frame) => frame.hero.opacity);
  const maskImage = useTransform(scene, (frame) => frame.hero.maskImage);
  const heroPointerEvents = useTransform(scene, (frame) =>
    frame.hero.opacity > 0.4 ? "auto" : "none",
  );
  const headingOpacity = useTransform(scene, (frame) => frame.heading.opacity);
  const headingY = useTransform(scene, (frame) => frame.heading.y);
  const imageHeight = useTransform(scene, (frame) =>
    imageClipPixels(frameWidth, frame.imageFraction, viewportHeight),
  );
  const imageY = useTransform(scene, (frame) =>
    imageLiftPixels(
      frameWidth,
      frame.imageFraction,
      viewportHeight,
      headingHeight > 0 ? headingHeight + 80 : 0,
    ),
  );
  const imageFade = useTransform(scene, (frame) => frame.imageFade);

  if (reduceMotion) {
    return (
      <>
        <section className="flex min-h-screen flex-col items-center justify-center px-6">
          <HeroCopy />
        </section>
        <section className="pt-24">
          <DashboardCopy />
          <div className="mt-20">
            <TransactionsImage clip={imageClipCss(IMAGE_REVEAL_FRACTION)} />
          </div>
          <div className="mx-auto mt-20 h-25 max-w-[100rem] bg-green-100">
            <p>all technologies used</p>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <section ref={sceneRef} className="relative h-[135vh]">
        <div className="sticky top-0 h-screen overflow-hidden">
          <motion.div
            ref={headingRef}
            style={{ opacity: headingOpacity, y: headingY }}
            className="absolute inset-x-0 top-0 z-30 pt-24"
          >
            <DashboardCopy />
          </motion.div>

          <motion.div
            style={{
              y,
              scale,
              opacity,
              maskImage,
              WebkitMaskImage: maskImage,
              pointerEvents: heroPointerEvents,
            }}
            className="absolute inset-0 z-20 flex origin-center flex-col items-center justify-center px-6 pb-28 will-change-transform"
          >
            <HeroCopy />
          </motion.div>

          <motion.div
            ref={imageFrameRef}
            style={{ height: imageHeight, y: imageY }}
            className="pointer-events-none absolute inset-x-0 bottom-0 z-10 mx-auto w-full max-w-4xl overflow-hidden rounded-t-lg"
          >
            <Image
              src="/landing-page-elements/transactions.png"
              alt="Polygonscan contract transactions"
              width={1280}
              height={900}
              priority
              className="absolute inset-x-0 top-0 h-auto w-full"
            />
            <motion.div
              style={{ opacity: imageFade }}
              className="from-background pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t to-transparent"
            />
          </motion.div>
        </div>
      </section>

      <div className="mx-auto mt-20 h-25 max-w-[100rem] bg-green-100">
        <p>all technologies used</p>
      </div>
    </>
  );
}
