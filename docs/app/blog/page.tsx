import Link from 'next/link';
import { ArrowRight, ArrowUpRight, MoveUpRight } from 'lucide-react';
import { blogPosts, categories } from '@/lib/blog';
import { frontmatter as whyRealEquipmentFrontmatter } from '@/content/blog/why-real-equipment-changes-the-lesson.mdx';
import { frontmatter as controlWorkflowFrontmatter } from '@/content/blog/a-control-workflow-for-shared-labs.mdx';

const blogFrontmatter = {
  'why-real-equipment-changes-the-lesson': whyRealEquipmentFrontmatter,
  'a-control-workflow-for-shared-labs': controlWorkflowFrontmatter,
} as const;

function getBlogPosts() {
  return blogPosts.map((post) => {
    const data = blogFrontmatter[post.slug as keyof typeof blogFrontmatter];
    if (!data) return post;
    return { ...post, title: data.title, excerpt: data.description, date: new Date(`${data.date}T00:00:00Z`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }), author: data.author, category: data.category, readTime: data.readTime };
  });
}

export const metadata = {
  title: 'Blog | M2PLink',
  description: 'Notes about control, remote experiments, and learning with real laboratory equipment.',
};

export default function BlogPage() {
  const [featured, ...posts] = getBlogPosts();
  return <>
    <header className="blog-header">
      <Link className="blog-wordmark" href="/"><i className="blog-logo-mark" />M2P<span>Link</span></Link>
      <nav aria-label="Blog navigation"><button>Platform⌄</button><Link href="/docs">Pricing</Link><button>Resources⌄</button><Link href="/docs">Docs</Link><Link href="/blog" aria-current="page">Blog</Link></nav>
      <div className="blog-header-tools"><button className="blog-search-button">⌕ <span>Search M2PLink</span></button><Link href="/docs">Log in</Link><Link className="blog-header-cta" href="/">Get started <ArrowUpRight size={14} /></Link></div>
    </header>
    <main>
      <section className="blog-intro">
        <h1>Blog</h1>
        <p>Stay up to date with the latest from M2PLink. Guides, announcements, and articles about control, remote laboratories, and physical experiments.</p>
      </section>
      <div className="blog-filter-row"><nav className="blog-category-row" aria-label="Blog categories">
        {categories.map((category, index) => <a key={category} href={index === 0 ? '#stories' : `#${category.toLowerCase().replaceAll(' ', '-')}`}>{category}</a>)}
      </nav><button className="blog-list-search">Search M2PLink <span>⌕</span></button></div>
      <section className="blog-series"><div className="blog-series-label">SERIES</div><Link href="#stories">● Control Lab <b>08</b></Link><Link href="#stories">● Remote Experiments <b>04</b></Link><Link href="#stories">View all series →</Link></section>
      <section className="blog-series-feature"><div><p className="blog-meta">FEATURED SERIES <span>·</span> 08 PARTS</p><h2>Control Lab</h2><p>The story of building a shared physical laboratory for students learning control systems.</p><Link href="#stories">Explore the series <ArrowRight size={16} /></Link></div><div className="blog-series-ribbon" aria-hidden="true" /></section>
      <section className="blog-featured" id="stories">
        <div className="blog-feature-placeholder" aria-hidden="true"><span>M2P</span><i /><i /><i /></div>
        <div className="blog-feature-copy"><p className="blog-meta">{featured.category} <span>·</span> {featured.date}</p><h2>{featured.title}</h2><p>{featured.excerpt}</p><Link className="blog-read-link" href={`/blog/${featured.slug}`}>Read story <ArrowRight size={16} /></Link><p className="blog-byline">{featured.author} <span>·</span> {featured.readTime}</p></div>
      </section>
      <section className="blog-list" aria-label="All stories">
        {posts.map((post, index) => <article className="blog-card" key={post.slug} id={post.category.toLowerCase().replaceAll(' ', '-')}>
          <div className={`blog-card-art ${post.accent}`} aria-hidden="true"><span>{String(index + 2).padStart(2, '0')}</span><b /></div>
          <div className="blog-card-copy"><p className="blog-meta">{post.category} <span>·</span> {post.date}</p><h2><Link href={`/blog/${post.slug}`}>{post.title}</Link></h2><p>{post.excerpt}</p><div className="blog-card-foot"><span>{post.author}</span><Link href={`/blog/${post.slug}`} aria-label={`Read ${post.title}`}><ArrowUpRight size={17} /></Link></div></div>
        </article>)}
      </section>
      <nav className="blog-pagination" aria-label="Blog pagination"><a className="active" href="#stories">1</a><a href="#stories">2</a><a href="#stories">3</a><a href="#stories">Next <ArrowRight size={14} /></a></nav>
    </main>
    <footer className="blog-footer"><div className="blog-footer-top"><div><Link className="blog-wordmark" href="/"><i className="blog-logo-mark" />M2P<span>Link</span></Link><p>Stay up to date with M2PLink. Notes on control, remote laboratories, and the physical world.</p></div><div className="blog-newsletter"><h2>Subscribe to our newsletter</h2><div><input aria-label="Email address" placeholder="Email address" /><button>Subscribe</button></div></div></div><div className="blog-footer-links"><div><b>Product</b><Link href="/docs">M2PLab</Link><Link href="/docs">Experiments</Link><Link href="/docs">Documentation</Link></div><div><b>Resources</b><Link href="/blog">Blog</Link><Link href="/docs">Guides</Link><Link href="/docs">Teaching notes</Link></div><div><b>Company</b><Link href="/">About M2PLink</Link><Link href="/docs">Contact</Link><Link href="/">Status</Link></div></div><div className="blog-footer-bottom"><span>© 2026 M2PLab</span><Link href="/docs">Privacy</Link><Link href="/docs">Terms</Link></div></footer>
  </>;
}
