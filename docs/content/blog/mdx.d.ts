declare module '@/content/blog/*.mdx' {
  import type { MDXProps } from 'mdx/types';
  import type { ReactElement } from 'react';
  import type { TOCItemType } from 'fumadocs-core/toc';

  export const frontmatter: {
    title: string;
    description: string;
    date: string;
    author: string;
    category: string;
    readTime: string;
  };
  export const toc: TOCItemType[];
  export default function Content(props: MDXProps): ReactElement;
}
