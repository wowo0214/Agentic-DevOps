"use client";

import { ScrollArea } from "@base-ui/react/scroll-area";
import type { ReactNode } from "react";

// Overlay scrollbars match Inkeep without taking space away from the code.
export function DocsCodeScroll({ children }: { children: ReactNode }) {
  return (
    <ScrollArea.Root className="group/code-scroll relative overflow-hidden">
      <ScrollArea.Viewport className="max-h-[600px] outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-fd-ring">
        <ScrollArea.Content style={{ minWidth: "100%", display: "table" }}>
          {children}
        </ScrollArea.Content>
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar
        orientation="horizontal"
        className="absolute inset-x-0 bottom-0 flex h-[5px] opacity-0 transition-opacity group-hover/code-scroll:opacity-100 group-focus-within/code-scroll:opacity-100 data-[scrolling]:opacity-100"
      >
        <ScrollArea.Thumb className="rounded-full bg-fd-border" />
      </ScrollArea.Scrollbar>
      <ScrollArea.Scrollbar
        orientation="vertical"
        className="absolute inset-y-0 right-0 flex w-[5px] opacity-0 transition-opacity group-hover/code-scroll:opacity-100 group-focus-within/code-scroll:opacity-100 data-[scrolling]:opacity-100"
      >
        <ScrollArea.Thumb className="rounded-full bg-fd-border" />
      </ScrollArea.Scrollbar>
      <ScrollArea.Corner />
    </ScrollArea.Root>
  );
}
