import type { ReactNode } from "react";

/**
 * Splits a brand name into segments for alternating color rendering.
 *
 * Strategy:
 * 1. First try splitting by spaces (e.g. "Art Forge Lab" → ["Art", "Forge", "Lab"])
 * 2. If no spaces, split by capital letter boundaries (e.g. "ArtForgeLab" → ["Art", "Forge", "Lab"])
 * 3. Falls back to the full string as a single segment.
 *
 * @example
 *   splitIntoBrandSegments("ArtForgeLab") // ["Art", "Forge", "Lab"]
 *   splitIntoBrandSegments("Art Forge Lab") // ["Art", "Forge", "Lab"]
 *   splitIntoBrandSegments("My Cool Platform") // ["My", "Cool", "Platform"]
 */
export function splitIntoBrandSegments(name: string): string[] {
  if (!name) return [""];

  const trimmed = name.trim();
  if (!trimmed) return [""];

  // Try splitting by spaces first
  const spaceSegments = trimmed.split(/\s+/);
  if (spaceSegments.length > 1) {
    return spaceSegments;
  }

  // No spaces — split by capital letter boundaries
  const capitalSegments = trimmed.split(/(?=[A-Z])/).filter(Boolean);
  if (capitalSegments.length > 1) {
    return capitalSegments;
  }

  // Fallback: return the whole string as one segment
  return [trimmed];
}

/**
 * Renders a brand name with alternating blue/orange colors per segment.
 * Odd-indexed segments → blue, even-indexed → orange.
 */
export function BrandNameDisplay({
  name,
  variant = "default",
}: {
  name: string;
  variant?: "default" | "light";
}): ReactNode {
  const segments = splitIntoBrandSegments(name);

  const blueClass = variant === "light" ? "text-blue-300" : "text-blue-500";
  const orangeClass =
    variant === "light" ? "text-orange-400" : "text-orange-600";

  return (
    <>
      {segments.map((segment, index) => (
        <span
          key={`${segment}-${index}`}
          className={index % 2 === 0 ? blueClass : orangeClass}
        >
          {segment}
        </span>
      ))}
    </>
  );
}