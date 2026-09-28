"use client";

import Link from "next/link";
import Image from "next/image";
import { ProductStackSection } from "@/features/public/home/components/ProductStackSection";

export default function Home() {
  return (
    <main className="h-full w-full">
      <section className="flex min-h-screen flex-col items-center justify-center">
        <h1 className="text-center text-6xl leading-18 font-semibold tracking-wider">
          Document your <br />{" "}
          <span className="text-blue-500">Digital Artwork</span>
        </h1>
        <p className="text-normal mt-5 max-w-120 text-center">
          Upload, classify, and document your digital artwork. Detect visually
          similar works using perceptual hashing. Secure immutable evidence on
          the blockchain and establish verifiable proof of authorship.
        </p>

        <Link
          href={"upload-artwork"}
          className="mt-5 rounded-xs bg-blue-700 px-4 py-2 text-sm"
        >
          TRY UPLOADING ARTWORK
        </Link>
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

      <section className="mx-auto mt-20 min-h-screen max-w-7xl">
        <div className="flex flex-col gap-5 text-start">
          <h1 className="text-5xl font-normal">
            The first new money rail
            <br /> in fifty years
          </h1>
          <p className="max-w-2xl">
            If your business moves money across borders, you&apos;re used to cut-off
            times, weekend delays, and fees taken by every bank in between.
            Stablecoins settle in seconds, any day of the year, cost a fraction
            as much, and can be programmed to move the moment they land.
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
