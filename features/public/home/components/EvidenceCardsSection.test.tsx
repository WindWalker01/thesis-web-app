import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  EVIDENCE_CARDS,
  EVIDENCE_CARDS_COPY,
  evidenceCardBackground,
} from "@/features/public/home/content";
import { EvidenceCardsSection } from "@/features/public/home/components/EvidenceCardsSection";

const IMAGE_TOP_FADE = "linear-gradient(to bottom, transparent, #000 40px)";

describe("EvidenceCardsSection", () => {
  it("shows the three proofs with a top-to-bottom color and a short image fade", () => {
    const { container } = render(<EvidenceCardsSection />);

    expect(
      screen.getByRole("heading", {
        name: /the record that\s*outlasts the post/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(EVIDENCE_CARDS_COPY.description)).toBeInTheDocument();

    const cards = container.querySelectorAll("[data-evidence-card]");
    expect(cards).toHaveLength(EVIDENCE_CARDS.length);

    EVIDENCE_CARDS.forEach((card, index) => {
      expect(
        screen.getByRole("heading", { name: card.title }),
      ).toBeInTheDocument();
      expect(screen.getByText(card.description)).toBeInTheDocument();
      expect(cards[index]).toHaveStyle({
        background: evidenceCardBackground(card),
      });

      const image = screen.getByRole("img", { name: card.imageAlt });
      expect(image).toHaveAttribute("src", card.image);
      expect(image).toHaveStyle({
        maskImage: IMAGE_TOP_FADE,
        objectPosition: card.imagePosition,
      });
    });
  });
});
