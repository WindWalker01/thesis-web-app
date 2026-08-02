import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/*.{test,spec}.{ts,tsx}"],
    // `tests/` is reserved for Playwright E2E specs (see tests/README.md).
    // Exclude it so Vitest never attempts to load Playwright test files.
    exclude: ["node_modules", ".next", "dist", "tests"],
  },
});
