'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight } from 'lucide-react';
import { SiGithub } from 'react-icons/si';
import { appName, gitConfig } from '@/lib/shared';
import { blogMono } from '@/lib/fonts';
import './site-header.css';

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  return <header className={`site-header ${blogMono.variable}`} data-scrolled={scrolled}>
    <div className="site-header-inner">
      <Link className="site-wordmark" href="/" aria-label={`${appName} 首页`}><span className="site-logo-mark" aria-hidden="true" />{appName}</Link>
      <nav aria-label="Main navigation"><Link href="/docs">Docs <ArrowUpRight size={13} /></Link><Link href="/blog" aria-current={pathname.startsWith('/blog') ? 'page' : undefined}>Blog</Link><span aria-disabled="true">Fix Log</span><span aria-disabled="true">Future</span><span aria-disabled="true">Contract</span></nav>
      <a className="site-github" href={`https://github.com/${gitConfig.user}/${gitConfig.repo}`}><SiGithub size={19} /><span>Open Source</span></a>
    </div>
  </header>;
}
