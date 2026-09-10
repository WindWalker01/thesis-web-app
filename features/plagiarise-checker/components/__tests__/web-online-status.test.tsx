import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { WebModeResult } from "@/features/plagiarise-checker/components/WebModeResult";
import type { SearchResponse } from "@/features/plagiarise-checker/types";

function base(overrides: Partial<SearchResponse> = {}): SearchResponse {
  return {
    filename: "test.jpg",
    success: true,
    original_hash: "abc123",
    db: null,
    web: null,
    best_match: null,
    hashes: { transforms: {}, blocks: {} },
    other_matches: [],
    ...overrides,
  };
}

const PREVIEW = "blob:http://localhost/preview";

describe("WebModeResult online-check migration", () => {
  it("ok: renders web match, no warning banner", () => {
    const r = base({
      web: {
        type: "internet",
        source: "Example",
        url: "https://example.com/img.jpg",
        link: "https://example.com/page",
        similarity: 22,
        calibrated_confidence: 99,
      },
      web_warning: null,
      web_diagnostics: { status: "ok", attempted: 5, hashed_ok: 5 },
    });
    render(<WebModeResult preview={PREVIEW} result={r} />);
    expect(screen.getByTestId("online-check-chip")).toHaveTextContent("Verified");
    expect(screen.queryByTestId("web-status-degraded")).toBeNull();
    expect(screen.queryByTestId("web-status-no-candidates")).toBeNull();
  });

  it("no_matches: green neutral message with counts", () => {
    const r = base({
      web_warning: null,
      web_diagnostics: {
        status: "no_matches",
        attempted: 12,
        hashed_ok: 12,
        hashed_failed: 0,
      },
    });
    render(<WebModeResult preview={PREVIEW} result={r} />);
    expect(screen.getByTestId("online-check-chip")).toHaveTextContent("No similar images");
    expect(screen.getByTestId("web-status-no-matches")).toHaveTextContent(
      "Checked 12 online images, none similar.",
    );
  });

  it("no_candidates fixture (a): informative, db still rendered", () => {
    const r = base({
      db: {
        type: "database",
        source: "Registered Artwork",
        url: "https://example.com/db.jpg",
        similarity: 10,
        calibrated_confidence: 80,
      },
      web_warning: "Serper found no online candidates...",
      web_diagnostics: {
        status: "no_candidates",
        list_key: "organic(empty)",
        serp_returned: 0,
        attempted: 0,
        hashed_ok: 0,
        hashed_failed: 0,
      },
    });
    const { container } = render(<WebModeResult preview={PREVIEW} result={r} />);
    expect(screen.getByTestId("online-check-chip")).toHaveTextContent("No candidates");
    expect(screen.getByTestId("web-status-no-candidates")).toHaveTextContent("no footprint found");
    expect(container.textContent).toContain("Registered Artwork");
  });

  it("degraded cloudinary-not-ready fixture (b): amber banner + retry + technical details", () => {
    const onRetry = vi.fn();
    const r = base({
      web_warning: "Online check skipped...",
      web_diagnostics: {
        status: "degraded",
        cloudinary_ready: false,
        readiness_status: 404,
        readiness_attempts: 3,
        error: "cloudinary_url_not_ready",
      },
    });
    render(<WebModeResult preview={PREVIEW} result={r} onRetry={onRetry} />);
    expect(screen.getByTestId("online-check-chip")).toHaveTextContent("Check incomplete");
    expect(screen.getByTestId("web-status-degraded")).toHaveTextContent("Online check skipped");
    expect(screen.getByTestId("web-status-degraded")).toHaveTextContent("wasn't fetchable yet");
    fireEvent.click(screen.getByTestId("web-retry-button"));
    expect(onRetry).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByTestId("technical-details-toggle"));
    expect(screen.getByTestId("technical-details")).toHaveTextContent("cloudinary_ready");
  });

  it("degraded serper-error fixture (c): failure reasons expandable", () => {
    const r = base({
      web_warning: null,
      web_diagnostics: {
        status: "degraded",
        cloudinary_ready: true,
        attempted: 9,
        hashed_ok: 0,
        hashed_failed: 9,
        failure_reasons: {
          "fetch_timeout:lookaside.instagram.com": 4,
          "undecodable_image:html_or_text_page_not_image:page": 5,
        },
      },
    });
    render(<WebModeResult preview={PREVIEW} result={r} />);
    expect(screen.getByTestId("web-status-degraded")).toHaveTextContent(
      "9 of 9 online images couldn't be checked",
    );
    fireEvent.click(screen.getByTestId("failure-reasons-toggle"));
    expect(screen.getByTestId("failure-reasons-list")).toHaveTextContent(
      "fetch_timeout:lookaside.instagram.com",
    );
  });

  it("legacy response with no new keys does not crash", () => {
    const r = base();
    delete (r as Partial<SearchResponse>).web_diagnostics;
    delete (r as Partial<SearchResponse>).web_warning;
    render(<WebModeResult preview={PREVIEW} result={r} />);
    expect(screen.getByTestId("online-check-chip")).toHaveTextContent("Online check");
    expect(screen.getByText("No web match found.")).toBeDefined();
    expect(screen.getByText("No database match found.")).toBeDefined();
  });
});

