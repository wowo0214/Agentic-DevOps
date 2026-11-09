'use client';

import { TOCProvider } from 'fumadocs-ui/layouts/docs/page/slots/toc';
import { DocsTOC } from '@/components/docs-toc';
import { useEffect, useState } from 'react';

type BlogTocProps = {
  sections: string[];
};

function headingId(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
}

export function BlogToc({ sections }: BlogTocProps) {
  const toc = sections.map((title) => ({ title, url: `#${headingId(title)}`, depth: 2 }));
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    const update = () => {
      const firstHeading = document.getElementById(headingId(sections[0] ?? ''));
      if (!firstHeading) return;
      setPinned(firstHeading.getBoundingClientRect().top <= 110);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [sections]);

  return (
    <TOCProvider toc={toc}>
      <DocsTOC style="clerk" container={{ className: `blog-docs-toc${pinned ? ' blog-docs-toc-pinned' : ''}` }} />
    </TOCProvider>
  );
}
