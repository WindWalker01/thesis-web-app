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
  sceneAnimationProgress,
  sceneSectionHeight,
} from "@/features/public/home/landing-scene";
import {
  BUTTON_CORNER_CLIP,
  ScrambledText,
  useScrambleHover,
} from "@/features/public/home/components/ScrambledText";
import { TechnologyMarquee } from "@/features/public/home/components/TechnologyMarquee";
import { WireframeBlocks } from "@/features/public/home/components/WireframeBlocks";
import { useMediaQuery } from "@/features/public/home/use-media-query";

/** Wireframe cubes stay off phones and small tablets, where the canvas loop is costly. */
const WIREFRAME_QUERY = "(min-width: 1024px)";

const UPLOAD_LABEL = "TRY UPLOADING ARTWORK";

function UploadArtworkLink() {
  const { display, scrambleHover } = useScrambleHover(UPLOAD_LABEL);

  return (
    <Link
      href="upload-artwork"
      aria-label={UPLOAD_LABEL}
      {...scrambleHover}
      className="mt-7 inline-flex max-w-full rounded-xs bg-blue-700 px-5 py-3.5 text-center text-sm text-white sm:px-6 sm:py-4"
      style={{ clipPath: BUTTON_CORNER_CLIP }}
    >
      <ScrambledText text={UPLOAD_LABEL} display={display} />
    </Link>
  );
}

function HeroCopy() {
  return (
    <>
      <h1 className="text-center text-4xl leading-tight font-semibold tracking-tight sm:text-5xl lg:text-6xl lg:leading-18 lg:tracking-wider">
        Document your <br />{" "}
        <span className="text-blue-500">Digital Artwork</span>
      </h1>
      <p className="mt-6 max-w-120 text-center text-base leading-relaxed sm:mt-7 sm:text-lg">
        Upload, classify, and document your digital artwork. Detect visually
        similar works using perceptual hashing. Secure immutable evidence on the
        blockchain and establish verifiable proof of authorship.
      </p>
      <UploadArtworkLink />
    </>
  );
}

function DashboardCopy() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
      <h1 className="max-w-3xl text-start text-3xl leading-tight font-semibold tracking-tight sm:text-4xl lg:text-6xl lg:leading-15 lg:tracking-wider">
        Artwork evidence, sealed{" "}
        <span className="text-blue-500">on the blockchain.</span>
      </h1>
      <p className="max-w-md text-sm leading-relaxed sm:text-base lg:max-w-sm lg:shrink-0">
        These rows are the live transactions from our own contract address.
        Each one is tamper-proof evidence that authorship was recorded on this
        chain.
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
  const showWireframes = useMediaQuery(WIREFRAME_QUERY);
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
    landingSceneMotion(sceneAnimationProgress(progress, viewportHeight)),
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
      headingHeight > 0 ? headingHeight + 60 : 0,
    ),
  );
  const imageFade = useTransform(scene, (frame) => frame.imageFade);
  const marqueeOpacity = useTransform(scene, (frame) => frame.marqueeOpacity);

  if (reduceMotion) {
    return (
      <>
        <section className="flex min-h-screen flex-col items-center justify-center px-4 sm:px-6">
          <HeroCopy />
        </section>
        <section className="pt-24">
          <DashboardCopy />
          <div className="mt-20">
            <TransactionsImage clip={imageClipCss(IMAGE_REVEAL_FRACTION)} />
          </div>
          <TechnologyMarquee />
        </section>
      </>
    );
  }

  return (
    <>
      <section
        ref={sceneRef}
        className="relative"
        style={{ height: sceneSectionHeight() }}
      >
        <div className="sticky top-0 h-screen overflow-hidden">
          {showWireframes ? (
            <motion.div
              style={{ opacity }}
              className="pointer-events-auto absolute inset-0 z-0 overflow-hidden"
            >
              <WireframeBlocks cubeCount={14} />
            </motion.div>
          ) : null}

          <motion.div
            ref={headingRef}
            style={{ opacity: headingOpacity, y: headingY }}
            className="absolute inset-x-0 top-0 z-30 pt-16 sm:pt-24"
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
            className="pointer-events-none absolute inset-0 z-20 flex origin-center flex-col items-center justify-center px-4 pb-16 will-change-transform sm:px-6 sm:pb-28"
          >
            <div className="pointer-events-auto flex flex-col items-center">
              <HeroCopy />
            </div>
          </motion.div>

          <motion.div
            style={{ height: imageHeight, y: imageY }}
            className="absolute inset-x-0 bottom-0 z-10"
          >
            <div
              ref={imageFrameRef}
              className="pointer-events-none relative mx-auto h-full w-full max-w-4xl overflow-hidden rounded-t-lg"
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
            </div>
            <motion.div
              style={{ opacity: marqueeOpacity }}
              className="absolute inset-x-0 top-full"
            >
              <TechnologyMarquee />
            </motion.div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
