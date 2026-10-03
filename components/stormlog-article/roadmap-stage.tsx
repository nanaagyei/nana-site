import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const REPO = "https://github.com/Silas-Asamoah/stormlog";

export interface RoadmapItem {
  title: string;
  note?: ReactNode;
  /** GitHub issue numbers in Silas-Asamoah/stormlog. */
  issues?: number[];
}

interface RoadmapStageProps {
  stage: "shipped" | "building" | "researching";
  title: string;
  lead: string;
  items: RoadmapItem[];
}

const STAGE_STYLE = {
  shipped: { rule: "border-moss", marker: "●", text: "text-moss", border: "border-solid" },
  building: { rule: "border-ochre", marker: "◐", text: "text-ochre", border: "border-solid" },
  researching: { rule: "border-ink-faded", marker: "○", text: "text-ink-faded", border: "border-dashed" },
} as const;

export function RoadmapStage({ stage, title, lead, items }: RoadmapStageProps) {
  const s = STAGE_STYLE[stage];
  return (
    <section
      aria-labelledby={`roadmap-${stage}`}
      className={cn("border-t-2 pt-3", s.rule, s.border)}
    >
      <h3 id={`roadmap-${stage}`} className="flex items-baseline gap-2 font-display text-lg tracking-tight text-ink">
        <span aria-hidden="true" className={cn("font-mono text-sm", s.text)}>{s.marker}</span>
        {title}
      </h3>
      <p className="mt-1 mb-4 text-sm leading-relaxed text-ink-faded">{lead}</p>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.title} className="text-sm leading-relaxed">
            <span className="text-ink">{item.title}</span>
            {item.issues?.length ? (
              <span className="ml-1.5 font-mono text-xs">
                {item.issues.map((n, i) => (
                  <span key={n}>
                    {i > 0 ? ", " : null}
                    <a
                      href={`${REPO}/issues/${n}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-terracotta underline underline-offset-2 hover:text-ink"
                      aria-label={`Stormlog issue ${n} on GitHub`}
                    >
                      #{n}
                    </a>
                  </span>
                ))}
              </span>
            ) : null}
            {item.note ? <span className="mt-0.5 block text-ink-faded">{item.note}</span> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
