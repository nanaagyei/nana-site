import type { ReactNode } from "react";

interface ExpandableTechnicalDetailProps {
  summary: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

/** Native <details>: keyboard and screen-reader friendly with no client JavaScript. */
export function ExpandableTechnicalDetail({
  summary,
  children,
  defaultOpen,
}: ExpandableTechnicalDetailProps) {
  return (
    <details
      open={defaultOpen}
      className="group rounded-[4px] border border-paper-edge bg-paper-deep/40 open:bg-paper-deep/60"
    >
      <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm text-ink marker:hidden [&::-webkit-details-marker]:hidden">
        <span
          aria-hidden="true"
          className="font-mono text-xs text-terracotta transition-transform duration-150 group-open:rotate-90"
        >
          ▸
        </span>
        <span>{summary}</span>
        <span className="ml-auto font-mono text-xs text-ink-faded">technical detail</span>
      </summary>
      <div className="border-t border-paper-edge px-4 py-4">{children}</div>
    </details>
  );
}
