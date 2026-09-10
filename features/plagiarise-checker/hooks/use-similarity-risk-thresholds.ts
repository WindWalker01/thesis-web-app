"use client";

import { useEffect, useState } from "react";
import { getPublicSimilarityRiskThresholds } from "@/features/admin/settings/server/public-settings";
import {
  DEFAULT_SIMILARITY_RISK_THRESHOLDS,
  type SimilarityRiskThresholds,
} from "@/features/plagiarise-checker/lib/similarity-risk";

/**
 * Loads the admin-synced similarity risk thresholds
 * (`similarity_threshold` → critical/red, `manual_review_threshold` → moderate/amber).
 * Falls back to shared defaults until the server action resolves (or on error).
 */
export function useSimilarityRiskThresholds(): SimilarityRiskThresholds {
  const [thresholds, setThresholds] = useState<SimilarityRiskThresholds>(
    DEFAULT_SIMILARITY_RISK_THRESHOLDS,
  );

  useEffect(() => {
    let cancelled = false;
    getPublicSimilarityRiskThresholds()
      .then((t) => {
        if (cancelled) return;
        const critical = Number(t?.critical);
        const moderate = Number(t?.moderate);
        setThresholds({
          critical: Number.isFinite(critical)
            ? critical
            : DEFAULT_SIMILARITY_RISK_THRESHOLDS.critical,
          moderate: Number.isFinite(moderate)
            ? moderate
            : DEFAULT_SIMILARITY_RISK_THRESHOLDS.moderate,
        });
      })
      .catch(() => {
        // Keep shared defaults on failure — indicator still renders.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return thresholds;
}
