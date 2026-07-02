import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";
import * as React from "react";

// next/image renders a plain <img> in jsdom. Strip Next-only boolean props
// (fill, unoptimized, priority) so React does not warn about unknown DOM attrs.
vi.mock("next/image", () => ({
  __esModule: true,
  default: ({
    fill,
    unoptimized,
    priority,
    ...props
  }: Record<string, unknown>) => {
    void fill;
    void unoptimized;
    void priority;
    return React.createElement("img", props);
  },
}));

// next/link renders a plain <a> so href/target assertions work in jsdom.
vi.mock("next/link", () => ({
  __esModule: true,
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
  } & Record<string, unknown>) =>
    React.createElement("a", { href, ...props }, children),
}));

afterEach(() => {
  cleanup();
});

