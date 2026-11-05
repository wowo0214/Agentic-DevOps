"use client";

import { cn } from "cn";
import { useTranslations } from "@fuma-translate/react";
import { TOCScrollArea, useTOCItems } from "fumadocs-ui/components/toc";
import * as normal from "fumadocs-ui/components/toc/default";
import * as clerk from "./docs-toc-tree";
import * as block from "fumadocs-ui/components/toc/block";
import type { TOCProps } from "fumadocs-ui/layouts/docs/page/slots/toc";

// Exact SVG supplied for the Inkeep TOC title.
function InkeepText() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide size-4"
      aria-hidden="true"
    >
      <path d="M15 18H3" />
      <path d="M17 6H3" />
      <path d="M21 12H3" />
    </svg>
  );
}

const variants = { normal, clerk, block };

// Keep Fumadocs' TOC primitives with Inkeep's title and tree geometry.
export function DocsTOC({
  container,
  header,
  footer,
  style = "normal",
  list,
}: TOCProps) {
  const t = useTranslations({ note: "table of contents" });
  const items = useTOCItems();
  const { TOCItems, TOCEmpty, TOCItem } = variants[style];

  if (items.length === 0 && !header && !footer) {
    return (
      <div
        id="nd-toc-placeholder"
        className="hidden xl:layout:[--fd-toc-width:268px]"
      />
    );
  }

  return (
    <div
      {...container}
      id="nd-toc"
      className={cn(
        "sticky top-(--fd-docs-row-1) h-[calc(var(--fd-docs-height)-var(--fd-docs-row-1))] flex flex-col [grid-area:toc] w-(--fd-toc-width) pt-12 pe-4 pb-2 xl:layout:[--fd-toc-width:268px] max-xl:hidden transition-[opacity,visibility] duration-300",
        container?.className,
      )}
    >
      {header}
      <h3
        id="toc-title"
        className="inline-flex items-center gap-1.5 text-sm text-fd-muted-foreground"
      >
        <InkeepText />
        {t("On this page")}
      </h3>
      <TOCScrollArea className="ms-px">
        <TOCItems {...list}>
          {items.length === 0 && <TOCEmpty />}
          {items.map((item) => (
            <TOCItem key={item.url} item={item} />
          ))}
        </TOCItems>
      </TOCScrollArea>
      {footer}
    </div>
  );
}
