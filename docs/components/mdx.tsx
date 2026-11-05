import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { DocsCard } from './docs-card';
import { CodeBlock, Pre } from 'fumadocs-ui/components/codeblock';
import { DocsCodeScroll } from './docs-code-scroll';

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    Card: DocsCard,
    pre: (props) => (
      <CodeBlock {...props} viewportProps={{ className: 'docs-code-viewport' }}>
        <DocsCodeScroll>
          <Pre>{props.children}</Pre>
        </DocsCodeScroll>
      </CodeBlock>
    ),
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
