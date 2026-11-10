import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { posts, blogContent, formatBlogDate } from '@/lib/blog-content';
import { BlogArt } from '@/components/blog-art';
import { BlogArticleBody } from '@/components/blog-article-body';
import { BlogArticleNavigation } from '@/components/blog-article-navigation';

function headingId(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
}

export function generateStaticParams() {
  return posts.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = posts.find((item) => item.slug === slug);
  if (!post) notFound();
  return { title: `${post.title} | M2PDocs Blog`, description: post.excerpt };
}

export default async function BlogArticle({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = posts.find((item) => item.slug === slug);
  if (!post) notFound();
  const content = blogContent[slug as keyof typeof blogContent];
  const Content = content?.default;
  const toc = content?.toc.filter((item) => item.depth === 2) ?? post.sections.map(({ heading }) => ({ title: heading, url: `#${headingId(heading)}`, depth: 2 }));

  return <main key={slug} className="article-main">
    <header className="article-hero">
      <h1>{post.title}</h1>
    </header>
    <BlogArticleNavigation toc={toc} />
    <aside className="article-meta" aria-label="文章信息">
      <dl>
        <div><dt>Published</dt><dd><time dateTime={post.date}>{formatBlogDate(post.date)}</time></dd></div>
        <div><dt>Author</dt><dd>{post.author}</dd></div>
        <div><dt>Topics</dt><dd>{post.category}</dd></div>
        <div><dt>Reading</dt><dd>{post.readTime}</dd></div>
      </dl>
    </aside>
    <div className="article-column">
      <div className="article-cover"><BlogArt slug={post.slug} accent={post.accent} /></div>
      <BlogArticleBody>
        {Content ? <Content components={{ h1: () => null }} /> : post.sections.map((section) => <section key={section.heading}><h2 id={headingId(section.heading)}>{section.heading}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section>)}
      </BlogArticleBody>
      <div className="article-end"><Link href="/blog"><ArrowLeft size={16} /> Back to blog</Link><Link href="/docs">Documentation <ArrowUpRight size={16} /></Link></div>
    </div>
  </main>;
}
