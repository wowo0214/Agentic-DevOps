import { BlogListing } from '@/components/blog-listing';
import { BlogReveal } from '@/components/blog-reveal';
import { posts, formatBlogDate } from '@/lib/blog-content';

export const metadata = {
  title: 'Blog | M2PDocs',
  description: '技术探索、实践记录，以及构建 M2PDocs 过程中的思考。',
};

export default function BlogPage() {
  return (
    <main className="blog-main">
      <header className="blog-intro">
        <BlogReveal><p className="blog-eyebrow">BLOG</p></BlogReveal>
        <BlogReveal delay={0.05}><h1>探索、实践与新的想法</h1></BlogReveal>
        <BlogReveal delay={0.1}><p className="blog-intro-description">记录构建过程中的发现，让每一次尝试都有迹可循。</p></BlogReveal>
      </header>
      <BlogListing posts={posts.map((post) => ({ ...post, date: formatBlogDate(post.date) }))} />
    </main>
  );
}
