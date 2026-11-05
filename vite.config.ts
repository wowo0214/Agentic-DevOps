import { defineConfig } from 'vite-plus'

export default defineConfig({
  lint: {
    plugins: ['oxc', 'typescript', 'react', 'nextjs', 'vitest'],
    categories: {
      correctness: 'warn',
    },
    options: {
      typeAware: true,
      typeCheck: true,
    },
    ignorePatterns: [
      '**/node_modules/**',
      '**/dist/**',
      '**/dist-ssr/**',
      '**/build/**',
      '**/out/**',
      '**/.next/**',
      '**/.turbo/**',
      '**/.vercel/**',
      '**/.source/**',
      '**/coverage/**',
      '**/next-env.d.ts',
      'docs/**',
    ],
    overrides: [
      {
        files: ['**/*.config.*'],
        env: {
          browser: false,
          node: true,
        },
      },
      {
        files: ['**/*.{test,spec}.{js,jsx,ts,tsx}', '**/vitest.config.*'],
        env: {
          vitest: true,
        },
      },
    ],
    rules: {
      'no-unused-vars': 'off',
      'no-empty': 'off',
      'prefer-const': 'off',
      'typescript/unbound-method': 'off',
    },
    env: {
      browser: true,
    },
  },
  fmt: {
    printWidth: 80,
    singleQuote: true,
    trailingComma: 'all',
    tabWidth: 2,
    useTabs: false,
    semi: false,
    proseWrap: 'never',
    arrowParens: 'always',
    bracketSameLine: false,
    sortImports: {
      newlinesBetween: false,
      internalPattern: ['@/', '~/', '@repo/'],
      groups: [
        'builtin',
        'external',
        'internal',
        ['parent', 'sibling', 'index'],
        'type',
        ['side_effect_style', 'side_effect'],
        'unknown',
      ],
    },
    sortPackageJson: true,
    ignorePatterns: [
      '**/*.md',
      '**/*.json',
      'pnpm-lock.yaml',
      '**/node_modules/**',
      '**/dist/**',
      '**/dist-ssr/**',
      '**/build/**',
      '**/out/**',
      '**/.next/**',
      '**/.turbo/**',
      '**/.vercel/**',
      '**/.source/**',
      '**/coverage/**',
      '**/next-env.d.ts',
      'docs/**',
      'packages/ui/**',
      'packages/logger/**',
    ],
  },
  staged: {
    '**/*.{js,jsx,ts,tsx}': [
      'vp lint --fix --no-error-on-unmatched-pattern',
      'vp fmt --no-error-on-unmatched-pattern',
    ],
    '**/*.{css,html}': ['vp fmt --no-error-on-unmatched-pattern'],
  },
})
