import type { ReactNode } from 'react';

export function BlogArticleBody({ children }: { children: ReactNode }) {
  return <article className="article-content prose">{children}</article>;
}
