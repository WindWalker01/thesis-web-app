"use client";

import { ShieldCheck, Info, CheckCircle2 } from "lucide-react";
import type { RecognitionProfileData } from "../types";
import { RecognitionSection } from "./RecognitionSection";

type Props = {
    profile: RecognitionProfileData;
};

/**
 * Count all satisfied facts across all sections, then derive a human-readable
 * summary label and a fill percentage for the progress bar.
 *
 * Rules are transparent and visible — no hidden weights, no algorithms.
 */
function deriveSummary(
    profile: RecognitionProfileData,
): { label: string; satisfied: number; total: number; dense: boolean } {
    const allFacts = profile.sections.flatMap((s) => s.facts);
    const total = allFacts.length;
    const satisfied = allFacts.filter((f) => f.satisfied).length;

    // A profile is "dense" when more than half of the total possible facts
    // are available (i.e. the artwork has at least some data), otherwise it's
    // "sparse" (e.g. just registered but nothing else).
    const dense = total > 0 && satisfied >= Math.ceil(total / 2);

    return { label: dense ? "Recognized" : "Limited", satisfied, total, dense };
}

/**
 * Artwork Recognition Profile — the main card that displays observable
 * evidence about an artwork's status within the platform.
 *
 * The profile is composed of multiple sections (Community Recognition,
 * Protection & Registration, Integrity Checks), each containing individual
 * facts that map to verifiable database values. No blended scores, no
 * weighted formulas, no hidden algorithms.
 *
 * At the top a prominent visual summary bar shows at a glance how many
 * indicators are satisfied, using dots (●●●○○) rather than a percentage
 * to avoid the appearance of a score.
 *
 * A clear explanatory disclaimer at the bottom ensures users and thesis
 * panelists understand what this profile represents — and what it does not.
 */
export function ArtworkRecognitionProfile({ profile }: Props) {
    const { label, satisfied, total, dense } = deriveSummary(profile);

    return (
        <section className="overflow-hidden rounded-3xl border border-border/70 bg-card/85 backdrop-blur-xl">
            {/* Header */}
            <div className="flex items-center gap-2.5 border-b border-border px-5 py-3.5">
                <div className="rounded-lg border border-primary/20 bg-primary/10 p-1.5">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-foreground">
                        Artwork Recognition Profile
                    </h3>
                    <p className="text-xs text-muted-foreground">
                        Observable evidence from the platform
                    </p>
                </div>
            </div>

            {/* Visual Summary Bar — at-a-glance recognition status */}
            {total > 0 && (
                <div
                    className={[
                        "mx-5 mt-5 overflow-hidden rounded-2xl border px-4 py-3.5",
                        dense
                            ? "border-green-500/20 bg-green-500/5"
                            : "border-muted/40 bg-muted/20",
                    ].join(" ")}
                >
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                            {dense ? (
                                <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500 dark:text-green-400" />
                            ) : (
                                <div className="h-5 w-5 shrink-0 rounded-full border-2 border-muted-foreground/30" />
                            )}
                            <div className="min-w-0">
                                <p
                                    className={[
                                        "text-sm font-bold leading-tight",
                                        dense
                                            ? "text-green-600 dark:text-green-400"
                                            : "text-muted-foreground",
                                    ].join(" ")}
                                >
                                    {dense
                                        ? "The community has recognized this artwork"
                                        : "Limited recognition data available"}
                                </p>
                                <p className="text-xs text-muted-foreground/70 mt-0.5">
                                    {satisfied} of {total} indicators satisfied
                                </p>
                            </div>
                        </div>

                        {/* Dot indicators — visually shows how many facts are satisfied */}
                        <div className="hidden sm:flex items-center gap-1 shrink-0">
                            {Array.from({ length: total }).map((_, i) => (
                                <span
                                    key={i}
                                    className={[
                                        "h-2.5 w-2.5 rounded-full transition-colors",
                                        i < satisfied
                                            ? "bg-green-500 dark:bg-green-400"
                                            : "bg-muted-foreground/20",
                                    ].join(" ")}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Thin progress line beneath */}
                    <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-muted">
                        <div
                            className={[
                                "h-full rounded-full transition-all duration-500",
                                dense
                                    ? "bg-green-500/60 dark:bg-green-400/60"
                                    : "bg-muted-foreground/20",
                            ].join(" ")}
                            style={{
                                width: `${total > 0 ? (satisfied / total) * 100 : 0}%`,
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Sections */}
            <div className="space-y-5 p-5 md:p-6">
                {profile.sections.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        No recognition data is available for this artwork yet.
                    </p>
                ) : (
                    profile.sections.map((section, index) => (
                        <div key={section.heading}>
                            <RecognitionSection section={section} />
                            {index < profile.sections.length - 1 && (
                                <div className="mt-5 border-t border-border/50" />
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Divider before disclaimer */}
            <div className="border-t border-border/50" />

            {/* Explanatory Disclaimer */}
            <div className="flex items-start gap-3 bg-muted/30 px-5 py-4">
                <div className="mt-0.5 shrink-0 rounded-full bg-primary/10 p-1">
                    <Info className="h-3.5 w-3.5 text-primary/70" />
                </div>
                <div className="space-y-1">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        What this profile means
                    </p>
                    <p className="text-xs leading-relaxed text-muted-foreground/80">
                        This profile summarizes observable information about the
                        artwork, including community engagement, registration
                        status, blockchain documentation, and similarity scan
                        results. It is intended to help users understand how the
                        artwork has been recognized within the platform. It is{" "}
                        <strong className="text-muted-foreground">
                            not
                        </strong>{" "}
                        a monetary appraisal or a legal determination of
                        ownership.
                    </p>
                </div>
            </div>
        </section>
    );
}