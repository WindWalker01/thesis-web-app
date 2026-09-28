"use client";

import { ProductStackSection } from "@/features/public/home/components/ProductStackSection";
import { LandingIntro } from "@/features/public/home/components/LandingIntro";

export default function Home() {
  return (
    <main className="h-full w-full">
      <LandingIntro />

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
