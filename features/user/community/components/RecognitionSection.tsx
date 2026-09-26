"use client";

import type { RecognitionSection as RecognitionSectionType } from "../types";
import { RecognitionFactRow } from "./RecognitionFactRow";

type Props = {
    section: RecognitionSectionType;
};

/**
 * A named group of related recognition facts within the Artwork Recognition
 * Profile. Each section groups facts by theme (e.g. "Community Recognition",
 * "Protection & Registration", "Integrity Checks").
 */
export function RecognitionSection({ section }: Props) {
    if (section.facts.length === 0) return null;

    return (
        <div className="space-y-3">
            <h4 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                {section.heading}
            </h4>

            <div className="space-y-3">
                {section.facts.map((fact) => (
                    <RecognitionFactRow key={fact.key} fact={fact} />
                ))}
            </div>
        </div>
    );
}