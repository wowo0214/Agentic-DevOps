'use client';

import { Sidebar, type SidebarProps } from 'fumadocs-ui/layouts/docs/slots/sidebar';
import { useRef } from 'react';

export function DocsSidebar(props: SidebarProps) {
  const hoveredItem = useRef<Element | null>(null);

  function highlight(sidebar: HTMLElement, target: EventTarget | null) {
    const item = target instanceof Element
      ? target.closest('.overscroll-contain a[href], .overscroll-contain button')
      : null;
    if (item === hoveredItem.current) return;
    sidebar.style.setProperty('--docs-hover-transition', hoveredItem.current ? 'translate, width, height, opacity' : 'opacity');
    hoveredItem.current = item;
    sidebar.style.setProperty('--docs-hover-opacity', item && !item.matches('[data-active="true"]') ? '1' : '0');
    if (!item) return;

    const rect = item.getBoundingClientRect();
    const origin = sidebar.getBoundingClientRect();
    sidebar.style.setProperty('--docs-hover-x', `${rect.left - origin.left}px`);
    sidebar.style.setProperty('--docs-hover-y', `${rect.top - origin.top}px`);
    sidebar.style.setProperty('--docs-hover-width', `${rect.width}px`);
    sidebar.style.setProperty('--docs-hover-height', `${rect.height}px`);
  }

  return (
    <Sidebar
      {...props}
      className={`docs-sidebar-hover ${props.className ?? ''}`}
      onPointerOver={(event) => {
        if (event.pointerType !== 'mouse' || !(event.target instanceof Element)) return;
        if (!event.target.closest('.overscroll-contain')) {
          highlight(event.currentTarget, null);
        } else if (event.target.closest('a[href], button')) {
          highlight(event.currentTarget, event.target);
        }
      }}
      onPointerLeave={(event) => highlight(event.currentTarget, null)}
      onFocusCapture={(event) => {
        if (event.target.matches(':focus-visible')) highlight(event.currentTarget, event.target);
      }}
      onBlurCapture={(event) => {
        if (!event.currentTarget.matches(':hover')) highlight(event.currentTarget, null);
      }}
      onScrollCapture={(event) => highlight(event.currentTarget, null)}
      onClickCapture={(event) => highlight(event.currentTarget, null)}
    />
  );
}
