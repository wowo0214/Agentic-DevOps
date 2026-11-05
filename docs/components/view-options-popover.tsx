"use client";

import type { ComponentProps, ReactNode } from "react";
import { ChevronDown, ExternalLinkIcon } from "lucide-react";
import { buttonVariants } from "fumadocs-ui/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "fumadocs-ui/components/ui/popover";
import { cn } from "cn";

export interface ViewOptionsItem {
  title: string;
  href: string;
  icon?: ReactNode;
}

export type ViewOptionsPopoverProps = ComponentProps<typeof PopoverTrigger> & {
  items: readonly ViewOptionsItem[];
};

// Adapted from Fumadocs UI's layouts/shared/page-actions.
export function ViewOptionsPopover({
  items,
  ...props
}: ViewOptionsPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger
        {...props}
        className={(state) =>
          cn(
            buttonVariants({ variant: "secondary", size: "sm" }),
            "gap-2 data-[popup-open]:bg-fd-accent data-[popup-open]:text-fd-accent-foreground",
            typeof props.className === "function"
              ? props.className(state)
              : props.className,
          )
        }
      >
        {props.children ?? "Open"}
        <ChevronDown className="size-3.5 text-fd-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent className="flex flex-col">
        {items.map((item) => (
          <a
            key={item.href}
            href={item.href}
            rel="noreferrer noopener"
            target="_blank"
            className="text-sm p-2 rounded-lg inline-flex items-center gap-2 hover:text-fd-accent-foreground hover:bg-fd-accent [&_svg]:size-4"
          >
            {item.icon}
            {item.title}
            <ExternalLinkIcon className="text-fd-muted-foreground size-3.5 ms-auto" />
          </a>
        ))}
      </PopoverContent>
    </Popover>
  );
}
