import type { Metadata } from 'next';
import { SiteHeader } from '@/components/site-header';
import SkyGradient from '@/components/home/sky-gradient';

export const metadata: Metadata = {
  title: 'M2PDocs',
  description: 'M2PDocs 文档与博客入口。',
};

export default function HomePage() {
  return (
    <div className="home-entry">
      <SiteHeader />
      <main>
        <SkyGradient style={{ height: '100dvh', aspectRatio: 'auto' }} />
        <h1 className="home-entry-title" aria-label="Docs for M2PTeam">
          <span className="home-title-art" aria-hidden="true">
            <span className="home-title-kicker">Docs <em>for</em></span>
            <span className="home-title-main" data-text="M2PTeam">M2PTeam</span>
            <span className="home-title-orbit" />
            <span className="home-title-star star-one">✦</span>
            <span className="home-title-star star-two">✦</span>
          </span>
        </h1>
      </main>
    </div>
  );
}
