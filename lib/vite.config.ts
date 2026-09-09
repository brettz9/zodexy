import { defineConfig, configDefaults } from "vitest/config";

export default defineConfig({
  test: {
    exclude: [...configDefaults.exclude, "**/dist/**"],
    coverage: {
      exclude: [
        ".idea",
        "**/dist/**",
        "*.config.js",
        "*.config.ts",
        "*.cjs",
        "*.js",
        "**/node_modules/**",
        "infer.ts",
        "zod-types.ts",
        "zodexySchema.ts",
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
