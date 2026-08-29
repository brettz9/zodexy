import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      exclude: [
        ".idea",
        "dist",
        "*.config.js",
        "*.config.ts",
        "*.cjs",
        "*.js",
        "node_modules",
        "infer.ts",
        "zod-types.ts",
      ],
      thresholds: {
        autoUpdate: true,
        lines: 100,
        statements: 99.61,
        functions: 98.03,
        branches: 97.6,
        perFile: true,
      },
    },
    reporters: [
      [
        "default",
        {
          summary: false,
        },
      ],
    ],
  },
});
