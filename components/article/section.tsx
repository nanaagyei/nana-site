import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const DISPLAY_AXES = { fontVariationSettings: "'opsz' 72, 'SOFT' 60, 'WONK' 1" };

interface SectionProps {
  id: string;
  /** Section number shown in the margin label, e.g. "03". */
  number: string;
  title: string;
  children: ReactNode;
}

export function Section({ id, number, title, children }: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="scroll-mt-32 border-t border-paper-edge pt-12 [&+&]:mt-16"
    >
      <p className="mb-3 font-mono text-xs tracking-wide text-ink-faded" aria-hidden="true">
        {number}
      </p>
      <h2
        id={`${id}-title`}
        className="group mb-6 font-display text-2xl font-normal tracking-tight sm:text-3xl"
        style={DISPLAY_AXES}
      >
        {title}
        <a
          href={`#${id}`}
          className="ml-2 font-mono text-base text-ink-faded opacity-0 transition-opacity duration-150 group-hover:opacity-100 focus-visible:opacity-100"
          aria-label={`Link to this section: ${title}`}
        >
          #
        </a>
      </h2>
      <div className="space-y-6">{children}</div>
    </section>
  );
}

export function SubHeading({
  id,
  children,
  className,
}: {
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <h3
      id={id}
      className={cn(
        "mt-10 mb-3 scroll-mt-32 font-display text-xl font-normal tracking-tight text-ink",
        className,
      )}
    >
      {children}
    </h3>
  );
}

/** Wraps running text so it picks up the site's existing prose styles. */
export function Prose({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("prose-custom", className)}>{children}</div>;
}
