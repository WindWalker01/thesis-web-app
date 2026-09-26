import type { SimilarityReport } from "../server/art-similarity-scan";
import type { PlagiarismMatchContext } from "@/features/public/plagiarise-checker/lib/match-source";

/**
 * Adapts an upload-flow similarity report into the shared plagiarism match
 * context so the registration-blocked cards can reuse the same
 * report/manual-review actions as the public plagiarism checker.
 */
export function similarityReportToMatchContext(
  report: SimilarityReport,
): PlagiarismMatchContext {
  const internal = report.type === "database";
  return {
    origin: internal ? "internal" : "external",
    matchedArtworkId: internal ? report.matchedArtworkId : null,
    matchedArtworkTitle: internal ? report.matchedArtworkTitle : null,
    matchedArtworkUrl: internal
      ? report.matchedArtworkCommunityUrl ?? report.matchedArtworkImageUrl
      : null,
    // Kept separate so the copyright-report modal can render the artwork as an
    // image instead of a bare URL.
    matchedArtworkImageUrl: internal ? report.matchedArtworkImageUrl : null,
    matchedArtworkCommunityUrl: internal ? report.matchedArtworkCommunityUrl : null,
    matchedArtworkAuthor: internal ? report.matchedArtworkAuthorName : null,
    externalUrl: internal ? null : report.link ?? report.url,
    externalSource: internal ? null : report.source,
    similarity: report.similarityPercentage,
    originalHash: null,
    scanId: null,
  };
}
