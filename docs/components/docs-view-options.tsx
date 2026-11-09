"use client";

import { useMemo } from "react";
import { pageActionIcons } from "./page-action-icons";
import { TextIcon } from "lucide-react";
import { usePathname } from "fumadocs-core/framework";
import { useTranslations } from "@fuma-translate/react";
import {
  ViewOptionsPopover,
  type ViewOptionsPopoverProps,
} from "./view-options-popover";

type DocsViewOptionsProps = Omit<ViewOptionsPopoverProps, "items"> & {
  markdownUrl?: string;
  githubUrl?: string;
  pageUrl?: string;
};

// The menu entries and brand SVGs are copied from Fumadocs UI's page-actions.
// Edit the items array below to add, remove, or reorder options.
export function DocsViewOptions({
  markdownUrl,
  githubUrl,
  pageUrl: pageUrlProp,
  ...props
}: DocsViewOptionsProps) {
  const pathname = usePathname();
  const t = useTranslations({ note: "page actions" });
  const items = useMemo(() => {
    const pageUrl =
      pageUrlProp ??
      (typeof window === "undefined" ? pathname : window.location.href);
    const q = t("Read {url}, I want to ask questions about it.", {
      variables: { url: pageUrl },
    });
    return [
      markdownUrl && {
        title: t("View as Markdown"),
        href: markdownUrl,
        icon: <TextIcon />,
      },
      // githubUrl && {
      //   title: t("Open in GitHub"),
      //   href: githubUrl,
      //   icon: pageActionIcons.github,
      // },
      // {
      //   title: t("Open in Scira AI"),
      //   href: `https://scira.ai/?${new URLSearchParams({ q })}`,
      //   icon: pageActionIcons.scira,
      // },
      {
        title: t("Open in ChatGPT"),
        href: `https://chatgpt.com/?${new URLSearchParams({
          prompt: q,
          hints: "search",
        })}`,
        icon: pageActionIcons.chatgpt,
      },
      {
        title: t("Open in Claude"),
        href: `https://claude.ai/new?${new URLSearchParams({ q })}`,
        icon: pageActionIcons.claude,
      },
      {
        title: t("Open in Cursor"),
        icon: pageActionIcons.cursor,
        href: `https://cursor.com/link/prompt?${new URLSearchParams({ text: q })}`,
      },
    ].filter((v): v is Exclude<typeof v, "" | undefined> => !!v);
  }, [githubUrl, markdownUrl, pathname, t, pageUrlProp]);
  return <ViewOptionsPopover {...props} items={items} />;
}
