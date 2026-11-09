'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { buttonVariants } from 'fumadocs-ui/components/ui/button';
import { cn } from 'cn';

const markdownCache = new Map<string, string>();

// Adapted from Fumadocs UI's layouts/shared/page-actions.
export function MarkdownCopyButton({
  markdownUrl,
  className,
}: {
  markdownUrl: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (resetTimer.current !== null) clearTimeout(resetTimer.current);
    };
  }, []);

  async function copyMarkdown() {
    setLoading(true);
    try {
      const cached = markdownCache.get(markdownUrl);
      if (cached !== undefined) {
        await navigator.clipboard.writeText(cached);
      } else {
        // Pass the fetch promise directly to preserve clipboard user activation.
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/plain': fetch(markdownUrl).then(async (response) => {
              if (!response.ok) {
                throw new Error(`Failed to fetch ${markdownUrl}: ${response.status}`);
              }
              const content = await response.text();
              if (process.env.NODE_ENV === 'production') {
                markdownCache.set(markdownUrl, content);
              }
              return content;
            }),
          }),
        ]);
      }

      if (!mounted.current) return;
      if (resetTimer.current !== null) clearTimeout(resetTimer.current);
      setCopied(true);
      resetTimer.current = setTimeout(() => {
        setCopied(false);
        resetTimer.current = null;
      }, 2000);
    } catch (error) {
      console.error('Failed to copy page Markdown:', error);
    } finally {
      if (mounted.current) setLoading(false);
    }
  }

  return (
    <button
      type="button"
      disabled={loading}
      aria-live="polite"
      onClick={copyMarkdown}
      className={cn(
        buttonVariants({ variant: 'secondary', size: 'sm' }),
        'gap-2 [&_svg]:size-3.5 [&_svg]:text-fd-muted-foreground',
        className,
      )}
    >
      {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
      {copied ? 'Copied' : 'Copy page'}
    </button>
  );
}
