import { blogPosts } from './blog';
import * as equipment from '@/content/blog/why-real-equipment-changes-the-lesson.mdx';
import * as workflow from '@/content/blog/a-control-workflow-for-shared-labs.mdx';
import * as prisma from '@/content/blog/prisma-orm-manifesto-format-example.mdx';

export const blogContent = {
  'why-real-equipment-changes-the-lesson': equipment,
  'a-control-workflow-for-shared-labs': workflow,
  'prisma-orm-manifesto-format-example': prisma,
};

export const posts = blogPosts.map((post) => {
  const data = blogContent[post.slug as keyof typeof blogContent]?.frontmatter;
  return {
    ...post,
    ...(data && {
      title: data.title, excerpt: data.description, date: data.date,
      author: data.author, category: data.category, readTime: data.readTime,
    }),
  };
}).sort((a, b) => Date.parse(b.date) - Date.parse(a.date));

export function formatBlogDate(date: string) {
  const utcDate = /^\d{4}-\d{2}-\d{2}$/.test(date) ? `${date}T00:00:00Z` : `${date} UTC`;
  return new Date(utcDate).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
  });
}
