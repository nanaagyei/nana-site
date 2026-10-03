import type { NavSection } from "@/components/article/article-nav";
import { at } from "@/lib/at";

/** Single source of truth for the table of contents and section numbering. */
export const SECTIONS = [
  { id: "the-symptom", title: "A job that was fine until it wasn’t" },
  { id: "gpu-memory", title: "The memory numbers that matter" },
  { id: "what-is-stormlog", title: "What Stormlog is" },
  { id: "who-its-for", title: "Who this is for" },
  { id: "profiler-vs-tracker", title: "Profiler or tracker" },
  { id: "mental-model", title: "The Stormlog mental model" },
  { id: "architecture", title: "Architecture" },
  { id: "signals", title: "What Stormlog can see" },
  { id: "debugging-session", title: "From a running job to evidence" },
  { id: "sessions-telemetry", title: "Sessions and canonical telemetry" },
  { id: "artifacts", title: "Artifacts that outlive the process" },
  { id: "leak-example", title: "A leak that looks harmless" },
  { id: "distributed", title: "The rank an average hides" },
  { id: "inference", title: "Inference: from endpoint numbers to engine evidence" },
  { id: "native-tools", title: "Native tools, and where Stormlog stops" },
  { id: "roadmap", title: "Shipped, building, researching" },
  { id: "try-it", title: "Try it" },
  { id: "related", title: "Keep reading" },
] as const satisfies readonly NavSection[];

export type SectionId = (typeof SECTIONS)[number]["id"];

export function sectionMeta(id: SectionId) {
  const index = SECTIONS.findIndex((s) => s.id === id);
  return {
    id,
    title: at(SECTIONS, index).title,
    number: String(index + 1).padStart(2, "0"),
  };
}
