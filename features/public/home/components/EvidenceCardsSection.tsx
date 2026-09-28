import Image from "next/image";
import {
  EVIDENCE_CARDS,
  EVIDENCE_CARDS_COPY,
  evidenceCardBackground,
} from "@/features/public/home/content";

const CARD_CLIP =
  "polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)";

/** Short dissolve at the top of the picture so it meets the card color. */
const IMAGE_TOP_FADE = "linear-gradient(to bottom, transparent, #000 40px)";

export function EvidenceCardsSection() {
  return (
    <section
      id="evidence"
      aria-labelledby="evidence-title"
      className="mx-auto mt-20 mb-16 max-w-7xl px-4 sm:px-6 lg:px-8"
    >
      <div className="flex max-w-2xl flex-col gap-5 text-start">
        <h2
          id="evidence-title"
          className="text-5xl font-normal text-slate-900 dark:text-white"
        >
          {EVIDENCE_CARDS_COPY.titleLines[0]}
          <br />
          {EVIDENCE_CARDS_COPY.titleLines[1]}
        </h2>
        <p className="text-base leading-relaxed text-slate-600 md:text-lg dark:text-slate-300">
          {EVIDENCE_CARDS_COPY.description}
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-2 md:grid-cols-3">
        {EVIDENCE_CARDS.map((card) => (
          <article
            key={card.title}
            data-evidence-card=""
            className="flex h-110 flex-col overflow-hidden rounded-tl-lg rounded-tr-lg rounded-bl-lg text-white"
            style={{
              background: evidenceCardBackground(card),
              clipPath: CARD_CLIP,
            }}
          >
            <div className="px-7 pt-6">
              <h3 className="mb-2 text-2xl font-normal">{card.title}</h3>
              <p className="text-sm text-white/75">{card.description}</p>
            </div>

            <div className="relative mt-5 min-h-0 flex-1">
              <Image
                src={card.image}
                alt={card.imageAlt}
                width={800}
                height={640}
                className="absolute inset-0 h-full w-full object-cover"
                style={{
                  objectPosition: card.imagePosition,
                  maskImage: IMAGE_TOP_FADE,
                  WebkitMaskImage: IMAGE_TOP_FADE,
                }}
              />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
