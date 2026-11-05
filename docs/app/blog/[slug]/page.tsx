import Link from 'next/link';
import { ArrowLeft, ArrowRight, ArrowUpRight, MoveUpRight } from 'lucide-react';
import { blogPosts, getPost } from '@/lib/blog';
import { BlogToc } from '@/components/blog-toc';
import WhyRealEquipment, { frontmatter as whyRealEquipmentFrontmatter } from '@/content/blog/why-real-equipment-changes-the-lesson.mdx';
import ControlWorkflow, { frontmatter as controlWorkflowFrontmatter } from '@/content/blog/a-control-workflow-for-shared-labs.mdx';
import PrismaFormatExample, { frontmatter as prismaFormatExampleFrontmatter } from '@/content/blog/prisma-orm-manifesto-format-example.mdx';

const articleContent = {
  'why-real-equipment-changes-the-lesson': WhyRealEquipment,
  'a-control-workflow-for-shared-labs': ControlWorkflow,
  'prisma-orm-manifesto-format-example': PrismaFormatExample,
} as const;

const articleFrontmatter = {
  'why-real-equipment-changes-the-lesson': whyRealEquipmentFrontmatter,
  'a-control-workflow-for-shared-labs': controlWorkflowFrontmatter,
  'prisma-orm-manifesto-format-example': prismaFormatExampleFrontmatter,
} as const;

function formatDate(value: string) {
  return new Date(`${value}T00:00:00Z`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

function getResolvedPost(slug: string) {
  const post = getPost(slug);
  const data = articleFrontmatter[slug as keyof typeof articleFrontmatter];
  if (!post || !data) return post;
  return { ...post, title: data.title, excerpt: data.description, date: formatDate(data.date), author: data.author, category: data.category, readTime: data.readTime };
}

function headingId(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
}

export function generateStaticParams() { return blogPosts.map(({ slug }) => ({ slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const post = getResolvedPost((await params).slug);
  return post ? { title: `${post.title} | M2PLink Blog`, description: post.excerpt } : { title: 'Story | M2PLink Blog' };
}

export default async function BlogArticle({ params }: { params: Promise<{ slug: string }> }) {
  const post = getResolvedPost((await params).slug);
  if (!post) return <main className="blog-not-found"><h1>Story not found</h1><Link href="/blog">Back to blog</Link></main>;
  const Content = articleContent[post.slug as keyof typeof articleContent];
  return <>
    <header className="blog-header article-header"><Link className="blog-wordmark" href="/">M2P<span>Link</span><MoveUpRight size={17} /></Link><nav aria-label="Blog navigation"><Link href="/docs">Docs</Link><Link href="/blog">Blog</Link></nav><Link className="blog-header-cta" href="/blog"><ArrowLeft size={14} /> Back to blog</Link></header>
    <main className="article-main">
      <Link className="article-back" href="/blog"><ArrowLeft size={15} /> Back to blog</Link>
      <header className="article-hero"><p className="blog-meta">{post.category} <span>·</span> {post.date}</p><h1>{post.title}</h1><p className="article-dek">{post.excerpt}</p><div className="article-author"><span className={`author-mark ${post.accent}`}>{post.author.charAt(0).toUpperCase()}</span><span>{post.author}<small>{post.readTime}</small></span></div></header>
      <div className="article-layout"><article className="article-content">{Content ? <Content /> : post.sections.map((section) => <section id={headingId(section.heading)} key={section.heading}><h2>{section.heading}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section>)}<div className="article-end"><p>Keep exploring the lab.</p><Link href="/docs">Read the documentation <ArrowRight size={15} /></Link></div></article><BlogToc sections={post.sections.map(({ heading }) => heading)} /></div>
    </main>
    <footer className="blog-footer article-footer"><Link className="blog-wordmark" href="/">M2P<span>Link</span><MoveUpRight size={17} /></Link><span>Link for M2PLab.</span><Link href="/docs">Documentation <ArrowUpRight size={14} /></Link></footer>
  </>;
}
