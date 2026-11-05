import { source } from '@/lib/source';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from 'fumadocs-ui/layouts/docs/page';
import { notFound } from 'next/navigation';
import { getMDXComponents } from '@/components/mdx';
import type { Metadata } from 'next';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import { getPageImageUrl, getPageMarkdownUrl, gitConfig } from '@/lib/shared';
import { ChevronsUpDown } from 'lucide-react';
import { DocsViewOptions } from '@/components/docs-view-options';
import { MarkdownCopyButton } from '@/components/markdown-copy-button';
import { DocsTOC } from '@/components/docs-toc';
import { TOCProvider, TOCPopover } from 'fumadocs-ui/layouts/docs/page/slots/toc';

export default async function Page(props: PageProps<'/docs/[[...slug]]'>) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;
  const markdownUrl = getPageMarkdownUrl(page).url;

  return (
    <DocsPage
      slots={{ toc: { provider: TOCProvider, main: DocsTOC, popover: TOCPopover } }}
      toc={page.data.toc}
      full={page.data.full}
      tableOfContent={{ style: 'clerk', enabled: page.data.toc.length > 0 && !page.data.full }}
    >
      <header>
        <div className="docs-page-heading">
          <DocsTitle>{page.data.title}</DocsTitle>
          <div
            className="docs-page-actions inline-flex shrink-0 items-center divide-x divide-fd-border overflow-hidden rounded-lg border border-fd-border"
            role="group"
            aria-label="Page actions"
          >
            <MarkdownCopyButton
              markdownUrl={markdownUrl}
              className="docs-page-copy rounded-none border-0 bg-transparent hover:bg-fd-accent/50"
            />
            <DocsViewOptions
              markdownUrl={markdownUrl}
              githubUrl={`https://github.com/${gitConfig.user}/${gitConfig.repo}/blob/${gitConfig.branch}/${gitConfig.docsPath}/${page.path}`}
              className="docs-page-open rounded-none border-0 bg-transparent hover:bg-fd-accent/50"
              aria-label="Open page options"
            >
              <ChevronsUpDown aria-hidden="true" />
            </DocsViewOptions>
          </div>
        </div>
        <DocsDescription className="mb-2 mt-4">{page.data.description}</DocsDescription>
      </header>
      <DocsBody className="mt-4">
        <MDX
          components={getMDXComponents({
            // this allows you to link to other pages with relative file paths
            a: createRelativeLink(source, page),
          })}
        />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: PageProps<'/docs/[[...slug]]'>): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
    openGraph: {
      images: getPageImageUrl(page).url,
    },
  };
}
