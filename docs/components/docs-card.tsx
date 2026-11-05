import { Fragment, type CSSProperties } from "react";
import Link from "fumadocs-core/link";
import type { CardProps } from "fumadocs-ui/components/card";
import { ChevronRight } from "lucide-react";
import { cn } from "cn";

// Adapted from Inkeep's docs Card, preserving the Fumadocs MDX props.
export function DocsCard({
  icon,
  title,
  description,
  children,
  href,
  external,
  className,
  color,
  style,
  ...props
}: CardProps & { color?: string }) {
  const Component = href ? Link : "div";
  const words = typeof title === "string" ? title.split(" ") : undefined;
  const arrow = href && (
    <ChevronRight className="docs-card-arrow" aria-hidden="true" />
  );

  return (
    <Component
      {...props}
      href={href}
      {...(external && href
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
      data-card="true"
      className={cn("docs-card block border @max-lg:col-span-full", className)}
      style={{ "--card-color": color, ...style } as CSSProperties}
    >
      {href && <div className="docs-card-hover" aria-hidden="true" />}
      <div className="docs-card-content">
        {icon && <div className="docs-card-icon">{icon}</div>}
        <h3 className="docs-card-title not-prose">
          {words ? (
            words.map((word, index) =>
              index === words.length - 1 ? (
                <span key={index} className="whitespace-nowrap">
                  {word}
                  {arrow}
                </span>
              ) : (
                <Fragment key={index}>{word} </Fragment>
              ),
            )
          ) : (
            <>
              {title}
              {arrow}
            </>
          )}
        </h3>
        {description && <p className="docs-card-description">{description}</p>}
        {children && (
          <div className="docs-card-body prose-no-margin">{children}</div>
        )}
      </div>
    </Component>
  );
}
