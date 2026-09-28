"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState, type RefObject } from "react";
import {
  PRODUCT_STACK,
  PRODUCT_STACK_STEPS,
  type ProductStackStep,
} from "@/features/public/home/content";
import {
  activeStackStep,
  RAIL_CURVES,
  railDotMotion,
  railJourney,
  railRole,
  stackScrollProgress,
  stackStepLabel,
  stackStripOffset,
  stackTrackHeight,
  type RailPoint,
} from "@/features/public/home/stack";
import { cn } from "@/lib/client-utils";

const STEPS = PRODUCT_STACK_STEPS;

function usePinnedStack() {
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const query = window.matchMedia(
      "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
    );
    const update = () => setPinned(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return pinned;
}

export function ProductStackSection() {
  const pinned = usePinnedStack();
  const trackRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const active = activeStackStep(progress, STEPS.length);

  useEffect(() => {
    if (!pinned) return;
    const track = trackRef.current;
    if (!track) return;

    let frame = 0;
    const update = () => {
      const rect = track.getBoundingClientRect();
      const scrollable = track.offsetHeight - window.innerHeight;
      const scrolled = Math.min(
        Math.max(-rect.top, 0),
        Math.max(scrollable, 0),
      );
      setProgress(stackScrollProgress(scrolled, scrollable, STEPS.length));
    };
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pinned]);

  function goTo(index: number) {
    const next = Math.min(STEPS.length - 1, Math.max(0, index));
    const track = trackRef.current;
    if (!pinned || !track) {
      setProgress(next);
      return;
    }

    const rect = track.getBoundingClientRect();
    const scrollable = track.offsetHeight - window.innerHeight;
    const target =
      window.scrollY + rect.top + (next / (STEPS.length - 1)) * scrollable;
    window.scrollTo({ top: target, behavior: "smooth" });
  }

  return (
    <section
      id="product-stack"
      aria-labelledby="product-stack-title"
      className="bg-background-light dark:bg-background-dark overflow-x-clip"
    >
      {pinned ? (
        <PinnedStack
          trackRef={trackRef}
          progress={progress}
          active={active}
          onGoTo={goTo}
        />
      ) : (
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <StackHeading />
          <StackStage
            progress={progress}
            active={active}
            animated
            onGoTo={goTo}
          />
        </div>
      )}
    </section>
  );
}

function PinnedStack({
  trackRef,
  progress,
  active,
  onGoTo,
}: {
  trackRef: RefObject<HTMLDivElement | null>;
  progress: number;
  active: number;
  onGoTo: (index: number) => void;
}) {
  return (
    <div ref={trackRef} style={{ height: stackTrackHeight(STEPS.length) }}>
      <div className="sticky top-0 flex h-svh items-center pt-16">
        <div className="mx-auto flex w-full max-w-7xl flex-col px-6 lg:px-8">
          <StackHeading />
          <StackStage progress={progress} active={active} onGoTo={onGoTo} />
        </div>
      </div>
    </div>
  );
}

function StackHeading() {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <h2
        id="product-stack-title"
        className="text-3xl font-normal tracking-wide text-balance text-slate-900 sm:text-4xl md:text-5xl dark:text-white"
      >
        {PRODUCT_STACK.title}
      </h2>
      <p className="mt-4 text-base leading-relaxed text-slate-600 md:text-lg dark:text-slate-300">
        {PRODUCT_STACK.description}
      </p>
    </div>
  );
}

function StackStage({
  progress,
  active,
  animated = false,
  onGoTo,
}: {
  progress: number;
  active: number;
  animated?: boolean;
  onGoTo: (index: number) => void;
}) {
  const step = STEPS[active];
  const travel = useRailLoop(1500);
  const journey = railJourney(travel, STEPS.length);

  return (
    <div className="mt-10 grid items-center gap-8 lg:grid-cols-[3fr_7fr] lg:gap-16">
      <div>
        <StackCopy step={step} index={active} />
        <div className="mt-8">
          <StackControls active={active} onGoTo={onGoTo} />
        </div>
      </div>
      <div className="overflow-hidden">
        <div
          className={cn(
            "flex",
            animated && "transition-transform duration-500 ease-out",
          )}
          style={{
            width: `${STEPS.length * 100}%`,
            transform: stackStripOffset(progress, STEPS.length),
          }}
        >
          {STEPS.map((diagramStep, index) => (
            <StackFrame
              key={diagramStep.title}
              step={diagramStep}
              hidden={index !== active}
              role={railRole(index, STEPS.length)}
              journey={journey?.index === index ? journey : null}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function StackCopy({ step, index }: { step: ProductStackStep; index: number }) {
  return (
    <div>
      <p className="text-sm font-semibold tracking-widest text-slate-400">
        {stackStepLabel(index, STEPS.length)}
      </p>
      <h3 className="mt-2 text-4xl font-black text-blue-500 md:text-5xl">
        {step.title}
      </h3>
      <p className="mt-3 max-w-sm text-base leading-relaxed text-slate-600 dark:text-slate-300">
        {step.description}
      </p>
      <Link
        href={step.href}
        className="mt-10 mb-10 inline-flex items-center gap-3 rounded-lg border border-slate-300 px-4 py-2.5 text-xs font-bold tracking-widest text-slate-800 uppercase transition-colors hover:border-blue-500 hover:text-blue-500 dark:border-slate-600 dark:text-slate-100"
      >
        Learn more
        <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

function StackFrame({
  step,
  hidden,
  role,
  journey,
}: {
  step: ProductStackStep;
  hidden: boolean;
  role: "fork" | "line" | "none";
  journey: { role: "fork" | "line"; local: number } | null;
}) {
  return (
    <div
      aria-hidden={hidden}
      className="relative"
      style={{ width: `${100 / STEPS.length}%` }}
    >
      <div className="relative z-10 w-[70%]">
        <div className="relative aspect-[5/4] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <Image
            src={step.image}
            alt={step.imageAlt}
            fill
            className="object-contain object-center p-3"
            sizes="(min-width: 1024px) 42vw, 70vw"
          />
        </div>
      </div>
      {role === "fork" ? (
        <ForkRail motion={journey?.role === "fork" ? railDotMotion(journey.local) : null} />
      ) : null}
      {role === "line" ? (
        <LineRail
          point={
            journey?.role === "line"
              ? { x: 70 + journey.local * 30, y: 50 }
              : null
          }
        />
      ) : null}
    </div>
  );
}

function useRailLoop(duration: number) {
  const [travel, setTravel] = useState(0);

  useEffect(() => {
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      setTravel(((now - start) % duration) / duration);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [duration]);

  return travel;
}

function ForkRail({
  motion,
}: {
  motion: ReturnType<typeof railDotMotion> | null;
}) {
  return (
    <div
      data-stack-rail
      data-rail-role="fork"
      className="pointer-events-none absolute inset-y-0 left-[64%] right-0 z-20"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="h-full w-full overflow-visible text-blue-500"
      >
        <path
          d={RAIL_CURVES.top}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d={RAIL_CURVES.mid}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d={RAIL_CURVES.bot}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d={RAIL_CURVES.line}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      {motion?.merged ? (
        <RailDot point={motion.point} />
      ) : motion ? (
        <>
          <RailDot point={motion.top} />
          <RailDot point={motion.mid} />
          <RailDot point={motion.bot} />
        </>
      ) : null}
    </div>
  );
}

function LineRail({ point }: { point: RailPoint | null }) {
  return (
    <div
      data-stack-rail
      data-rail-role="line"
      className="pointer-events-none absolute inset-0 z-20"
      aria-hidden="true"
    >
      <div className="absolute top-1/2 right-0 left-[70%] h-px -translate-y-1/2 bg-blue-500" />
      {point ? <RailDot point={point} /> : null}
    </div>
  );
}

function RailDot({ point }: { point: { x: number; y: number } }) {
  return (
    <span
      className="absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500 shadow-[0_0_0_4px_rgba(59,130,246,0.28)]"
      style={{ left: `${point.x}%`, top: `${point.y}%` }}
    />
  );
}

function StackControls({
  active,
  onGoTo,
}: {
  active: number;
  onGoTo: (index: number) => void;
}) {
  return (
    <div className="max-w-sm">
      <div className="flex items-center gap-6 text-xs font-bold tracking-widest text-slate-500 uppercase">
        <button
          type="button"
          onClick={() => onGoTo(active - 1)}
          disabled={active === 0}
          className="inline-flex items-center gap-1 transition-colors enabled:hover:text-blue-500 disabled:opacity-40"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Prev
        </button>
        <button
          type="button"
          onClick={() => onGoTo(active + 1)}
          disabled={active === STEPS.length - 1}
          className="inline-flex items-center gap-1 transition-colors enabled:hover:text-blue-500 disabled:opacity-40"
        >
          Next
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="mt-5 flex items-center gap-2">
        {STEPS.map((step, index) => (
          <button
            key={step.title}
            type="button"
            aria-label={`Go to step ${index + 1}`}
            aria-current={index === active ? "step" : undefined}
            onClick={() => onGoTo(index)}
            className={cn(
              "h-1 rounded-full transition-all",
              index === active
                ? "w-10 bg-blue-500"
                : "w-6 bg-slate-300 dark:bg-slate-600",
            )}
          />
        ))}
      </div>
    </div>
  );
}
