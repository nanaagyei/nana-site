import { ArticleDiagram } from "@/components/article/article-diagram";

const BEFORE = [
  { name: "training.py", note: "Your workload, unchanged except for one tracker." },
  { name: "MemoryTracker", note: "Samples on a timer in a background thread." },
  { name: "TelemetryEventV4", note: "Each sample is normalized into one canonical event." },
  { name: "session_id", note: "Every event carries the identity of this capture." },
];

const AFTER = [
  { name: "track.json · sink segments · diagnose bundle", note: "Files in a directory you chose. They survive the process." },
  { name: "Analyzer", note: "Reloads the files and looks for growth, gaps, and rank drift." },
  { name: "TUI · report · CI · a teammate", note: "Anyone with the files can ask the same question again." },
];

function Step({ name, note, last }: { name: string; note: string; last?: boolean }) {
  return (
    <li className="relative pl-6">
      <span aria-hidden="true" className="absolute top-[0.55rem] left-0 h-2 w-2 rounded-full border border-ink-faded bg-paper" />
      {!last ? <span aria-hidden="true" className="absolute top-[1.2rem] bottom-[-0.9rem] left-[3px] w-px bg-paper-edge" /> : null}
      <p className="font-mono text-sm text-ink">{name}</p>
      <p className="text-sm leading-relaxed text-ink-faded">{note}</p>
    </li>
  );
}

export function ArtifactLifecycle() {
  return (
    <ArticleDiagram
      label="Figure 6"
      title="Where the evidence lives before and after the process ends"
      description="A training script runs with a MemoryTracker. The tracker turns samples into canonical telemetry events that each carry a session identity. When the run ends, those events exist as files on disk: exports, sink segments, or a diagnose bundle. An analyzer can reload those files later, and the terminal interface, a report, a CI job, or a teammate can use them."
      caption="The dashed rule is the point of the whole design. Before it, evidence exists only while the process runs. After it, the evidence is a file."
    >
      <div className="grid gap-0 md:grid-cols-[1fr_auto_1fr] md:gap-6">
        <div>
          <p className="mb-3 font-mono text-xs uppercase tracking-wide text-ink-faded">In the process</p>
          <ol className="space-y-4">
            {BEFORE.map((s, i) => (
              <Step key={s.name} {...s} last={i === BEFORE.length - 1} />
            ))}
          </ol>
        </div>
        <div className="my-5 flex items-center gap-3 md:my-0 md:flex-col" role="presentation">
          <div className="h-px flex-1 border-t border-dashed border-terracotta md:h-auto md:w-px md:flex-1 md:border-t-0 md:border-l" />
          <span className="font-mono text-xs text-terracotta md:[writing-mode:vertical-rl]">process ends · evidence stays</span>
          <div className="h-px flex-1 border-t border-dashed border-terracotta md:h-auto md:w-px md:flex-1 md:border-t-0 md:border-l" />
        </div>
        <div>
          <p className="mb-3 font-mono text-xs uppercase tracking-wide text-ink-faded">On disk</p>
          <ol className="space-y-4">
            {AFTER.map((s, i) => (
              <Step key={s.name} {...s} last={i === AFTER.length - 1} />
            ))}
          </ol>
        </div>
      </div>
    </ArticleDiagram>
  );
}
