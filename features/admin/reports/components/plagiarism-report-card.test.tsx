import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  PlagiarismReportCard,
  isPlagiarismReport,
} from "./PlagiarismReportCard";
import type { AdminReportDetail } from "@/features/reports/types";

function makeDetail(
  overrides: Partial<AdminReportDetail> = {}
): AdminReportDetail {
  return {
    report: {
      id: "report-1",
      reporter_id: "user-1",
      reported_art_post_id: null,
      report_type: "copyright",
      title: "Potential Copyright Concern — \"Sunset\"",
      description: "",
      status: "pending_review",
      created_at: "2026-09-26T10:00:00.000Z",
      resolved_at: null,
      target_type: "artwork",
      target_id: "11111111-1111-4111-8111-111111111111",
      related_scan_id: "scan-1",
      metadata: {
        match_type: "internal",
        origin: "plagiarism_checker",
        similarity_percentage: 100,
        source: "registered_arts",
        matched_url: "/community/post-1",
        original_artwork_url: "https://cdn.test/uploaded.png",
        original_artwork_title: "my-original.png",
        original_hash: "0xabc",
        detected_at: "2026-09-26T09:00:00.000Z",
        reporter_proof: "https://instagram.com/p/original",
        reporter_details: "Published 2023",
      },
      ...(overrides.report ?? {}),
    },
    reporter: {
      id: "user-1",
      first_name: "Ada",
      last_name: null,
      middle_name: null,
      username: "ada",
      c_profile_image: null,
    },
    reported_art_post: null,
    matched_artwork: {
      id: "11111111-1111-4111-8111-111111111111",
      title: "Sunset",
      c_secure_url: "https://cdn.test/artwork.png",
      status: "active",
    },
    evidence: [],
    comments: [],
    decision: null,
    actions: [],
    moderationSummary: {
      user: { warnings: 0, suspensions: 0, bans: 0, previousReports: 0, resolvedReports: 0 },
      artwork: { previousReports: 0, copyrightReports: 0, wasRemoved: false },
    },
    ...overrides,
  } as AdminReportDetail;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("isPlagiarismReport", () => {
  it("detects checker-originated reports", () => {
    expect(isPlagiarismReport(makeDetail())).toBe(true);
  });

  it("ignores ordinary community reports", () => {
    const detail = makeDetail();
    detail.report.related_scan_id = null;
    detail.report.metadata = {};
    expect(isPlagiarismReport(detail)).toBe(false);
  });
});

describe("PlagiarismReportCard", () => {
  it("renders the matched artwork as an image with its title", () => {
    render(<PlagiarismReportCard detail={makeDetail()} />);

    expect(
      screen.getByText(/copyright report — plagiarism detection/i),
    ).toBeInTheDocument();
    expect(screen.getByText("Sunset · active")).toBeInTheDocument();
    expect(
      screen.getByAltText(/matched registered artwork: sunset · active/i),
    ).toHaveAttribute("src", "https://cdn.test/artwork.png");
  });

  it("renders both the uploaded artwork and the matched artwork side by side", () => {
    render(<PlagiarismReportCard detail={makeDetail()} />);

    expect(screen.getByText(/uploaded artwork \(reported copy\)/i)).toBeInTheDocument();
    expect(screen.getByText(/matched registered artwork/i)).toBeInTheDocument();

    // The reporter's own copy renders as an image, not as a URL string.
    expect(
      screen.getByAltText(/uploaded artwork \(reported copy\)/i),
    ).toHaveAttribute("src", "https://cdn.test/uploaded.png");
    expect(screen.getByText("my-original.png")).toBeInTheDocument();
    expect(screen.getByText("Sunset · active")).toBeInTheDocument();
  });

  it("flags a missing uploaded artwork instead of hiding the gap", () => {
    const detail = makeDetail();
    delete detail.report.metadata?.original_artwork_url;
    render(<PlagiarismReportCard detail={detail} />);

    expect(screen.getByText("Not attached")).toBeInTheDocument();
    expect(
      screen.getByText(/upload was not attached to this report/i),
    ).toBeInTheDocument();
    // The matched artwork is still shown.
    expect(screen.getByText("Sunset · active")).toBeInTheDocument();
  });

  it("renders the detection evidence and the reporter statement separately", () => {
    render(<PlagiarismReportCard detail={makeDetail()} />);

    expect(screen.getAllByText("100.0%").length).toBeGreaterThan(0);
    expect(screen.getByText("Registered Artwork Database")).toBeInTheDocument();
    expect(screen.getByText("0xabc")).toBeInTheDocument();
    expect(screen.getByText(/reporter statement/i)).toBeInTheDocument();
    expect(
      screen.getByText("https://instagram.com/p/original"),
    ).toBeInTheDocument();
    expect(screen.getByText("Published 2023")).toBeInTheDocument();
  });

  it("renders the matched artwork URL as a link", () => {
    render(<PlagiarismReportCard detail={makeDetail()} />);

    const links = screen.getAllByRole("link");
    expect(links.length).toBeGreaterThan(0);
    links.forEach((link) => {
      expect(link).toHaveAttribute("href", "/community/post-1");
    });
  });
  /** A report filed before the reporter form: detection data lived in the description. */
  function makeLegacyDetail(): AdminReportDetail {
    const detail = makeDetail();
    detail.report.description =
      "A potentially similar registered artwork was detected by the plagiarism checker.\nSimilarity: 100.0%\nSource: registered_arts\nMatched artwork URL: https://res.cloudinary.com/dz4qgnk5v/image/upload/v1789395564/registered-arts/xvjoq25ct63.png";
    detail.report.metadata = {
      match_type: "internal",
      source: "registered_arts",
      similarity_percentage: 100,
      matched_url: "/community/post-1",
    };
    return detail;
  }

  it("never dumps the generated description blob into the card", () => {
    render(<PlagiarismReportCard detail={makeLegacyDetail()} />);

    // Legacy summary is collapsed behind an expander, not shown inline.
    expect(
      screen.queryByText(/A potentially similar registered artwork/),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /system detection summary/i }),
    ).toBeInTheDocument();
  });

  it("expands the legacy detection summary on demand", async () => {
    render(<PlagiarismReportCard detail={makeLegacyDetail()} />);

    await userEvent.click(
      screen.getByRole("button", { name: /system detection summary/i }),
    );

    expect(
      screen.getByText(/A potentially similar registered artwork/),
    ).toBeInTheDocument();
  });

  it("does not offer a legacy summary when the reporter gave a statement", () => {
    render(<PlagiarismReportCard detail={makeDetail()} />);

    expect(
      screen.queryByRole("button", { name: /system detection summary/i }),
    ).not.toBeInTheDocument();
  });
});