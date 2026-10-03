import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ArticleDiagramProps {
  /** Short visible title, e.g. "Figure 3". */
  label: string;
  title: string;
  /** Plain-language description. Diagrams are never the only carrier of information. */
  description: string;
  caption?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function ArticleDiagram({
  label,
  title,
  description,
  caption,
  children,
  className,
}: ArticleDiagramProps) {
  return (
    <figure
      className={cn(
        "my-8 rounded-[4px] border border-paper-edge bg-paper-deep/50",
        className,
      )}
    >
      <figcaption className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-paper-edge px-4 py-3">
        <span className="font-mono text-xs text-ink-faded">{label}</span>
        <span className="text-sm text-ink">{title}</span>
      </figcaption>
      <p className="sr-only">{description}</p>
      <div className="p-4 sm:p-6">{children}</div>
      {caption ? (
        <div className="border-t border-paper-edge px-4 py-3 text-sm leading-relaxed text-ink-faded">
          {caption}
        </div>
      ) : null}
    </figure>
  );
}
