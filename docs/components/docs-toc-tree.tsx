"use client";

import {
  useEffect,
  useEffectEvent,
  useImperativeHandle,
  useRef,
  useState,
  type ComponentProps,
} from "react";
import { cn } from "cn";
import * as Primitive from "fumadocs-core/toc";
import { useTOCItems } from "fumadocs-ui/components/toc";
export { TOCEmpty } from "fumadocs-ui/components/toc/clerk";

// Geometry from fumadocs-ui 16.1.0's Clerk TOC, as used by Inkeep.
function getItemOffset(depth: number) {
  if (depth <= 2) return 14;
  if (depth === 3) return 26;
  return 36;
}

function getLineOffset(depth: number) {
  return depth >= 3 ? 10 : 0;
}

type Track = { path: string; width: number; height: number };

export function TOCItems({
  ref,
  className,
  children,
  ...props
}: ComponentProps<"div">) {
  const containerRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const items = useTOCItems();
  const active = Primitive.useActiveAnchors();
  const [track, setTrack] = useState<Track>();
  useImperativeHandle(ref, () => containerRef.current!, []);

  const updateThumb = useEffectEvent(() => {
    const container = containerRef.current;
    const thumb = thumbRef.current;
    if (!container || !thumb) return;
    const activeItems = new Set(active.map((id) => `#${id}`));
    const links = Array.from(
      container.querySelectorAll<HTMLAnchorElement>("a[href]"),
    );
    let upper = Number.MAX_VALUE;
    let lower = 0;
    for (const link of links) {
      if (!activeItems.has(link.getAttribute("href")!)) continue;
      const styles = getComputedStyle(link);
      upper = Math.min(upper, link.offsetTop + parseFloat(styles.paddingTop));
      lower = Math.max(
        lower,
        link.offsetTop + link.clientHeight - parseFloat(styles.paddingBottom),
      );
    }
    const hasActive = upper !== Number.MAX_VALUE;
    thumb.style.setProperty("--fd-top", `${hasActive ? upper : 0}px`);
    thumb.style.setProperty(
      "--fd-height",
      `${hasActive ? lower - upper : 0}px`,
    );
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    function measure() {
      if (!container || container.clientHeight === 0) return;
      const links = Array.from(
        container.querySelectorAll<HTMLAnchorElement>("a[href]"),
      );
      let width = 0;
      let height = 0;
      const segments: string[] = [];
      for (const item of items) {
        const link = links.find(
          (element) => element.getAttribute("href") === item.url,
        );
        if (!link) continue;
        const styles = getComputedStyle(link);
        const offset = getLineOffset(item.depth) + 1;
        const top = link.offsetTop + parseFloat(styles.paddingTop);
        const bottom =
          link.offsetTop + link.clientHeight - parseFloat(styles.paddingBottom);
        width = Math.max(width, offset);
        height = Math.max(height, bottom);
        segments.push(
          `${segments.length === 0 ? "M" : "L"}${offset} ${top}`,
          `L${offset} ${bottom}`,
        );
      }
      setTrack({ path: segments.join(" "), width: width + 1, height });
      updateThumb();
    }
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    measure();
    return () => observer.disconnect();
  }, [items]);

  useEffect(() => updateThumb(), [active, track]);

  return (
    <>
      {track && (
        <div
          aria-hidden="true"
          className="absolute start-0 top-0 rtl:-scale-x-100"
          style={{
            width: track.width,
            height: track.height,
            maskImage: `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${track.width} ${track.height}"><path d="${track.path}" stroke="black" stroke-width="1" fill="none" /></svg>`)}")`,
          }}
        >
          <div
            ref={thumbRef}
            className="mt-(--fd-top) h-(--fd-height) bg-fd-primary transition-all"
          />
        </div>
      )}
      <div
        {...props}
        ref={containerRef}
        className={cn("flex flex-col", className)}
      >
        {children}
      </div>
    </>
  );
}

export function TOCItem({ item }: { item: Primitive.TOCItemType }) {
  const items = useTOCItems();
  const index = items.indexOf(item);
  const offset = getLineOffset(item.depth);
  const upperOffset = getLineOffset(items[index - 1]?.depth ?? item.depth);
  const lowerOffset = getLineOffset(items[index + 1]?.depth ?? item.depth);
  return (
    <Primitive.TOCItem
      href={item.url}
      style={{ paddingInlineStart: getItemOffset(item.depth) }}
      className="prose relative py-1.5 text-sm text-fd-muted-foreground hover:text-fd-accent-foreground transition-colors wrap-anywhere first:pt-0 last:pb-0 data-[active=true]:text-fd-primary"
    >
      {offset !== upperOffset && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          className="absolute -top-1.5 start-0 size-4 rtl:-scale-x-100"
          aria-hidden="true"
        >
          <line
            x1={upperOffset}
            y1="0"
            x2={offset}
            y2="12"
            className="stroke-fd-foreground/10"
            strokeWidth="1"
          />
        </svg>
      )}
      <div
        aria-hidden="true"
        className={cn(
          "absolute inset-y-0 w-px bg-fd-foreground/10",
          offset !== upperOffset && "top-1.5",
          offset !== lowerOffset && "bottom-1.5",
        )}
        style={{ insetInlineStart: offset }}
      />
      {item.title}
    </Primitive.TOCItem>
  );
}
