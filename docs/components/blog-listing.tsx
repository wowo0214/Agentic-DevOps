'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { BlogPost } from '@/lib/blog';
import { BlogArt } from './blog-art';
import { BlogReveal } from './blog-reveal';

export function BlogListing({ posts }: { posts: BlogPost[] }) {
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');
  const reduceMotion = useReducedMotion();
  const featured = posts[featuredIndex];
  const categories = ['All', ...new Set(posts.map((post) => post.category))];
  const matching = posts.filter((post) =>
    (category === 'All' || post.category === category) &&
    `${post.title} ${post.excerpt} ${post.category}`.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return <>
    {featured && <section className="blog-carousel" aria-label="精选文章" aria-roledescription="carousel" data-autoplay={!reduceMotion}>
      <BlogReveal duration={0.4}>
      <AnimatePresence mode="wait" initial={false}>
      <motion.div key={featured.slug} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduceMotion ? 0 : 0.4 }}>
      <Link className="blog-featured" href={`/blog/${featured.slug}`}>
        <div className="blog-feature-copy">
          <span className="blog-tag">{featured.category}</span>
          <p className="blog-eyebrow">FEATURED POST</p>
          <h2>{featured.title}</h2>
          <p className="blog-excerpt">{featured.excerpt}</p>
          <p className="blog-byline">{featured.date} · By {featured.author}</p>
        </div>
        <div className="blog-art-viewport"><BlogArt slug={featured.slug} accent={featured.accent} /></div>
      </Link>
      </motion.div>
      </AnimatePresence>
      </BlogReveal>
      <BlogReveal delay={0.05} duration={0.4}>
      <div className="blog-feature-controls" aria-label="切换精选文章">
        {posts.map((post, index) => <button key={post.slug} aria-label={`查看精选文章 ${index + 1}`} aria-pressed={index === featuredIndex} onClick={() => setFeaturedIndex(index)}>
          {index === featuredIndex && <span className="blog-feature-progress" onAnimationEnd={() => setFeaturedIndex((current) => (current + 1) % posts.length)} />}
        </button>)}
      </div>
      </BlogReveal>
    </section>}
    <section className="blog-browse" aria-label="浏览文章">
      <BlogReveal><div className="blog-categories" aria-label="文章标签">
        {categories.map((item) => <button key={item} aria-pressed={item === category} onClick={() => setCategory(item)}>{item}</button>)}
      </div></BlogReveal>
      <BlogReveal delay={0.05}><label className="blog-search"><Search size={18} /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="按标题、主题或关键词搜索文章…" aria-label="搜索文章" /></label></BlogReveal>
      <BlogReveal><h2 className="blog-list-title">{category === 'All' ? 'All Posts' : category}</h2></BlogReveal>
      <div className="blog-grid">
        {matching.map((post, index) => <motion.article className="blog-card" key={post.slug} initial={reduceMotion ? false : { opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.1, margin: '0px 0px -80px 0px' }} transition={{
          opacity: { duration: reduceMotion ? 0 : 0.4, delay: reduceMotion ? 0 : (index % 4) * 0.1, ease: [0.42, 0, 0.58, 1] },
          y: { duration: reduceMotion ? 0 : 0.4, delay: reduceMotion ? 0 : (index % 4) * 0.1, ease: [0.25, 0.1, 0.25, 1] },
        }}>
          <Link href={`/blog/${post.slug}`}>
            <div className="blog-art-viewport">
              <BlogArt slug={post.slug} accent={post.accent} />
              <span className="blog-card-pixels" aria-hidden="true">
                {Array.from({ length: 72 }, (_, pixel) => (
                  <i key={pixel} style={{
                    left: `${4 + (pixel % 12) * 8}%`,
                    top: `${10 + Math.floor(pixel / 12) * 15}%`,
                    animationDelay: `${-((pixel * 613) % 1800)}ms`,
                  }} />
                ))}
              </span>
            </div>
            <div className="blog-card-copy">
              <span className="blog-tag">{post.category}</span>
              <h3>{post.title}</h3>
              <p className="blog-excerpt">{post.excerpt}</p>
              <div className="blog-card-foot"><span><span className="blog-avatar">{post.author.charAt(0)}</span>{post.author}</span><time>{post.date}</time></div>
            </div>
          </Link>
        </motion.article>)}
      </div>
      {matching.length === 0 && <p className="blog-empty" role="status">没有找到匹配的文章，试试其他关键词。</p>}
    </section>
  </>;
}
