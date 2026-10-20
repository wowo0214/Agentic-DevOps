import type { OxlintConfig } from "oxlint";

const base = {
  plugins: ["oxc", "typescript", "react", "nextjs", "vitest"],
  categories: {
    correctness: "warn",
  },
  ignorePatterns: [
    "**/node_modules/**",
    "**/dist/**",
    "**/dist-ssr/**",
    "**/build/**",
    "**/out/**",
    "**/.next/**",
    "**/.turbo/**",
    "**/.vercel/**",
    "**/.source/**",
    "**/coverage/**",
    "**/next-env.d.ts",
  ],
  overrides: [
    {
      files: ["**/*.config.*"],
      env: {
        browser: false,
        node: true,
      },
    },
    {
      files: ["**/*.{test,spec}.{js,jsx,ts,tsx}", "**/vitest.config.*"],
      env: {
        vitest: true,
      },
    },
  ],

  rules: {
    "no-unused-vars": "off",
    "no-empty": "off",
    "prefer-const": "off",
    "typescript/unbound-method": "off",
  },
  env: {
    browser: true,
  },
} satisfies OxlintConfig;

export default base;
