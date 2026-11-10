'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { AnchorProvider, TOCItem, type TOCItemType } from 'fumadocs-core/toc';

export function BlogArticleNavigation({ toc }: { toc: TOCItemType[] }) {
  return (
    <aside className="article-chapters">
      <Link className="article-back" href="/blog"><ArrowLeft size={15} /> All posts</Link>
      <AnchorProvider toc={toc} single>
        <nav aria-label="文章章节">
          {toc.map((item, index) => (
            <TOCItem key={item.url} href={item.url}>
              <span className="article-chapter-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
              <span>{item.title}</span>
            </TOCItem>
          ))}
        </nav>
      </AnchorProvider>
    </aside>
  );
}
