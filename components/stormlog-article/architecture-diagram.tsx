import { ArticleDiagram } from "@/components/article/article-diagram";

interface Layer {
  title: string;
  summary: string;
  modules: string[];
  detail: string;
}

const LAYERS: Layer[] = [
  {
    title: "User surfaces",
    summary: "Where you or a script asks a question.",
    modules: ["Python APIs", "gpumemprof", "tfmemprof", "jaxmemprof", "stormlog (TUI)", "stormlog query", "stormlog infer"],
    detail:
      "Four console scripts: gpumemprof, tfmemprof, jaxmemprof, and stormlog. The stormlog script opens the TUI by default and dispatches query and infer without importing Textual.",
  },
  {
    title: "Profiling, tracking, workload generation",
    summary: "What actually measures something.",
    modules: ["GPUMemoryProfiler", "MemoryTracker", "CPUMemoryProfiler", "TFMemoryProfiler", "JAXMemoryProfiler", "stormlog.infer"],
    detail:
      "Bounded profilers expose profile_function and profile_context. Trackers sample in the background and emit events. stormlog.infer builds a workload matrix and sends controlled traffic to an endpoint.",
  },
  {
    title: "Analysis, sessions, correlation",
    summary: "What turns samples into findings.",
    modules: ["MemoryAnalyzer", "gap_analysis", "distributed_analysis", "session", "query", "correlation", "issues"],
    detail:
      "Leak and growth heuristics, hidden-memory gap analysis, cross-rank first-cause suspects, session lifecycle, and local query over artifact directories. Shared metric formulas live in derived_fields.",
  },
  {
    title: "Canonical telemetry and artifacts",
    summary: "The shared shape on disk.",
    modules: ["TelemetryEventV4", "telemetry_sink", "rollups.json", "diagnose bundle", "OOM bundle", "inference JSONL", "report.json"],
    detail:
      "stormlog.telemetry normalizes v2, v3 and recognized legacy records into TelemetryEventV4. Sinks write append-only JSONL segments with a manifest. Inference artifacts use their own infer.* records.",
  },
  {
    title: "Backend collectors and framework runtimes",
    summary: "Where the numbers come from.",
    modules: ["CUDA", "ROCm", "MPS", "CPU fallback", "TensorFlow runtime", "JAX memory_stats()", "NVML", "psutil"],
    detail:
      "PyTorch-side device collectors implement one contract: sample(), capabilities(), name(). TensorFlow and JAX read their own runtimes. The inference host collector reads process memory with psutil and device memory with NVML.",
  },
];

export function ArchitectureDiagram() {
  return (
    <ArticleDiagram
      label="Figure 4"
      title="Stormlog in five layers"
      description="From top to bottom: user surfaces, profiling and tracking, analysis and sessions, canonical telemetry and artifacts, and backend collectors. Each layer reads from the one below it. Open a layer for more detail."
      caption="A layer talks to the one below it. The TUI sits in the top layer and reads the same telemetry and artifacts as the CLI."
    >
      <ol className="space-y-0">
        {LAYERS.map((layer, i) => (
          <li key={layer.title} className="relative border border-paper-edge bg-paper first:rounded-t-[4px] last:rounded-b-[4px] [&+&]:-mt-px">
            <details className="group">
              <summary className="flex cursor-pointer list-none flex-col gap-2 px-4 py-3 marker:hidden [&::-webkit-details-marker]:hidden">
                <span className="flex items-baseline gap-3">
                  <span className="font-mono text-xs text-ink-faded" aria-hidden="true">{i + 1}</span>
                  <span className="text-sm text-ink">{layer.title}</span>
                  <span className="ml-auto font-mono text-xs text-terracotta transition-transform duration-150 group-open:rotate-90" aria-hidden="true">▸</span>
                </span>
                <span className="text-sm text-ink-faded">{layer.summary}</span>
                <span className="flex flex-wrap gap-1.5" aria-label="Modules in this layer">
                  {layer.modules.map((m) => (
                    <span key={m} className="rounded-[3px] bg-paper-deep px-2 py-0.5 font-mono text-xs text-ink-soft">
                      {m}
                    </span>
                  ))}
                </span>
              </summary>
              <p className="border-t border-paper-edge px-4 py-3 text-sm leading-relaxed text-ink-faded">
                {layer.detail}
              </p>
            </details>
          </li>
        ))}
      </ol>
    </ArticleDiagram>
  );
}
