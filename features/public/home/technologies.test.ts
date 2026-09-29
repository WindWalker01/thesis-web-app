import { describe, expect, it } from "vitest";
import { PROJECT_TECHNOLOGIES } from "@/features/public/home/technologies";

describe("PROJECT_TECHNOLOGIES", () => {
  it("lists each technology once, with an icon", () => {
    const names = PROJECT_TECHNOLOGIES.map((tech) => tech.name);

    expect(new Set(names).size).toBe(names.length);
    expect(names).toEqual(
      expect.arrayContaining([
        "Next.js",
        "React",
        "TypeScript",
        "Supabase",
        "Polygon",
        "Cloudinary",
      ]),
    );
    expect(PROJECT_TECHNOLOGIES.every((tech) => typeof tech.Icon === "function")).toBe(
      true,
    );
  });
});
