import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SettingSlider } from "./SettingSlider";
import {
  normalizeCommunityRecognitionThresholds,
  updateCommunityRecognitionThresholds,
} from "../lib/community-recognition-thresholds";

describe("community recognition settings thresholds", () => {
  it("normalizes the stored badge thresholds to the expected values", () => {
    expect(
      normalizeCommunityRecognitionThresholds({
        Recognized: 5,
        Acclaimed: 8,
        Master: 11,
      }),
    ).toEqual({
      Recognized: 5,
      Acclaimed: 8,
      Master: 11,
    });
  });

  it("keeps thresholds ascending as the user adjusts a tier", () => {
    const updated = updateCommunityRecognitionThresholds(
      { Recognized: 5, Acclaimed: 8, Master: 11 },
      "Recognized",
      9,
    );

    expect(updated).toEqual({
      Recognized: 9,
      Acclaimed: 10,
      Master: 11,
    });
  });
});

describe("SettingSlider", () => {
  it("renders a visible range track and gradient for the filled portion", () => {
    render(
      <SettingSlider
        label="Similarity threshold"
        value={40}
        min={0}
        max={100}
        step={1}
        unit="%"
        onChange={() => undefined}
      />,
    );

    const slider = screen.getByRole("slider", {
      name: "Similarity threshold",
    });

    expect(slider).toHaveStyle({
      background:
        "linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) 40%, hsl(var(--muted)) 40%, hsl(var(--muted)) 100%)",
    });
    expect(slider.className).toContain(
      "[&::-webkit-slider-runnable-track]:bg-muted",
    );
    expect(slider.className).toContain("[&::-moz-range-track]:bg-muted");
  });
});
