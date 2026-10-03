import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "note" | "caution" | "status";

const TONES: Record<Tone, { label: string; rule: string; text: string }> = {
  note: { label: "Note", rule: "border-moss", text: "text-moss" },
  caution: { label: "Limit", rule: "border-ochre", text: "text-ochre" },
  status: { label: "Status", rule: "border-terracotta", text: "text-terracotta" },
};

interface ArticleCalloutProps {
  tone?: Tone;
  title?: string;
  children: ReactNode;
}

/** A quiet margin-rule callout. The label is text, so tone never depends on color alone. */
export function ArticleCallout({ tone = "note", title, children }: ArticleCalloutProps) {
  const t = TONES[tone];
  return (
    <aside className={cn("border-l-2 bg-paper-deep/60 py-3 pr-4 pl-4", t.rule)}>
      <p className={cn("mb-1 font-mono text-xs uppercase tracking-wide", t.text)}>
        {title ?? t.label}
      </p>
      <div className="prose-custom text-[0.9375rem] leading-relaxed">{children}</div>
    </aside>
  );
}
