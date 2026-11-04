import type { OxfmtConfig } from 'oxfmt'

const base = {
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
  ],
} satisfies OxfmtConfig

export default base
