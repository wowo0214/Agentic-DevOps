'use client';
import { DocsLayout as Layout, type DocsLayoutProps } from 'fumadocs-ui/layouts/docs';
import { DocsSocialFooter } from '../docs-social-footer';
import { DocsSidebar } from '../docs-sidebar';
import { SidebarProvider, SidebarTrigger, useSidebar } from 'fumadocs-ui/layouts/docs/slots/sidebar';
import { AIChat, AIChatPanel, AIChatTrigger, useAIChat } from './search';

export function DocsLayout(props: DocsLayoutProps) {
  return (
    <AIChat>
      <ChatLayout {...props} />
      <AIChatTrigger className="docs-ai-trigger" />
    </AIChat>
  );
}

function ChatLayout(props: DocsLayoutProps) {
  const { open } = useAIChat();

  return (
    <>
      <Layout
        {...props}
        slots={{ ...props.slots, sidebar: { provider: SidebarProvider, root: DocsSidebar, trigger: SidebarTrigger, useSidebar } }}
        tabs={{
          transform: (option) => ({
            ...option,
            icon: <span className="docs-app-icon">{option.icon}</span>,
          }),
        }}
        containerProps={{
          ...props.containerProps,
          style: {
            ...props.containerProps?.style,
            gridTemplate: `"sidebar sidebar gutter-left header toc gutter-right outside-right"
"sidebar sidebar gutter-left toc-popover toc gutter-right outside-right"
"sidebar sidebar gutter-left main toc gutter-right outside-right" 1fr /
var(--docs-layout-offset) var(--fd-sidebar-col) minmax(0, 1fr)
minmax(0, calc(var(--docs-page-width) - var(--fd-toc-width)))
var(--fd-toc-width) minmax(0, 1fr) var(--docs-layout-offset)`,
          },
        }}
        githubUrl={undefined}
        themeSwitch={{ enabled: false }}
        sidebar={{ ...props.sidebar, footer: <DocsSocialFooter /> }}
      />
      {open && (
        <section className="docs-ai-panel" role="dialog" aria-label="Ask AI">
          <AIChatPanel />
        </section>
      )}
    </>
  );
}
