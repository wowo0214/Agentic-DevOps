import Link from 'next/link';
import { blogMono } from '@/lib/fonts';
import { SiteHeader } from '@/components/site-header';
import { gitConfig } from '@/lib/shared';
import './blog.css';


export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <div className={`m2p-blog-shell ${blogMono.variable}`}>
    <SiteHeader />
    {children}
    <footer className="blog-footer"><Link className="blog-wordmark" href="/">M2PDocs</Link><p>记录探索，持续构建。</p><nav aria-label="Footer"><Link href="/docs">Docs</Link><Link href="/blog">Blog</Link><a href={`https://github.com/${gitConfig.user}/${gitConfig.repo}`}>GitHub</a></nav><small>© {new Date().getFullYear()} M2PDocs</small></footer>
  </div>;
}
