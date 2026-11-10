import { createGetUrl } from 'fumadocs-core/source';

export const appName = 'M2PDocs';
export const docsRoute = '/docs';
export const docsImageRoute = '/og/docs';
export const docsContentRoute = '/llms.mdx/docs';

export const gitConfig = {
  user: 'wowo0214',
  repo: 'devops-turbo',
  branch: 'main',
  docsPath: 'docs/content/docs',
};

const getContentUrl = createGetUrl(docsContentRoute);

export function getPageMarkdownUrl(page: { slugs: string[]; locale?: string }) {
  const segments = page.slugs;

  return { segments, url: getContentUrl(segments, page.locale) };
}

const getImageUrl = createGetUrl(docsImageRoute);

export function getPageImageUrl(page: { slugs: string[]; locale?: string }) {
  const segments = page.slugs;

  return { segments, url: getImageUrl(segments, page.locale) };
}
