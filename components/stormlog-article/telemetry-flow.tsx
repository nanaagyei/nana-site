import type { ReactNode } from "react";
import { ArticleDiagram } from "@/components/article/article-diagram";
import { InViewBox } from "@/components/article/in-view-box";

function Flow({ label, step = 0 }: { label: string; step?: number }) {
  return (
    <div className="flow-line relative mx-auto my-2 h-8 w-px bg-paper-edge" role="presentation">
      <span className="flow-dot absolute -left-[3px] top-0 h-[7px] w-[7px] rounded-full bg-terracotta" style={{ "--step": step } as React.CSSProperties} />
      <span className="sr-only">{label}</span>
    </div>
  );
}

function Node({
  title,
  detail,
  tone = "default",
}: {
  title: string;
  detail?: ReactNode;
  tone?: "default" | "accent";
}) {
  return (
    <div
      className={
        tone === "accent"
          ? "rounded-[3px] border border-terracotta/50 bg-terracotta/5 px-3 py-2.5"
          : "rounded-[3px] border border-paper-edge bg-paper px-3 py-2.5"
      }
    >
      <p className="text-sm text-ink">{title}</p>
      {detail ? <p className="mt-0.5 font-mono text-xs leading-relaxed text-ink-faded">{detail}</p> : null}
    </div>
  );
}

function Chip({ children }: { children: ReactNode }) {
  return (
    <li className="rounded-[3px] border border-paper-edge bg-paper px-2.5 py-1 font-mono text-xs text-ink-soft">
      {children}
    </li>
  );
}

function Lane({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="mb-2 font-mono text-xs uppercase tracking-wide text-ink-faded">{title}</p>
      {children}
    </div>
  );
}

export function TelemetryFlow() {
  return (
    <ArticleDiagram
      label="Figure 3"
      title="How a measurement becomes evidence"
      description="Workloads in PyTorch, TensorFlow, JAX, or behind an OpenAI-compatible endpoint are observed by profilers, trackers, and collectors. Memory and runtime measurements become canonical telemetry events with a session identity. Inference measurements become inference JSONL records with their own run identity. Both are written as local artifacts and read by the command line, the terminal interface, reports, visualizations, CI, and later investigation. The terminal interface reads the memory telemetry lane."
      caption="Two lanes share the same ideas (local files, session identity, later analysis) but not the same record format. The terminal interface reads the memory lane."
    >
      <InViewBox className="flow-motion">
        <p className="mb-2 font-mono text-xs uppercase tracking-wide text-ink-faded">Your workload</p>
        <ul className="flex flex-wrap gap-2" aria-label="Supported workloads">
          <Chip>PyTorch</Chip>
          <Chip>TensorFlow</Chip>
          <Chip>JAX</Chip>
          <Chip>Inference endpoint</Chip>
        </ul>
        <Flow label="is observed by" step={0} />

        <div className="grid gap-6 md:grid-cols-2">
          <Lane title="Memory and runtime">
            <Node title="Profilers, trackers, collectors" detail="GPUMemoryProfiler · MemoryTracker · stormlog.tensorflow · stormlog.jax" />
            <Flow label="emits" step={1} />
            <Node tone="accent" title="Canonical telemetry and session identity" detail="TelemetryEventV4 · session_id · lifecycle state" />
            <Flow label="is kept as" step={2} />
            <Node title="Local artifacts" detail="track exports · sink segments · diagnose bundles · OOM bundles" />
          </Lane>
          <Lane title="Inference">
            <Node title="Workload generator and host collector" detail="stormlog infer profile · stormlog infer collect-server" />
            <Flow label="emits" step={1} />
            <Node tone="accent" title="Inference records and run identity" detail="infer.* JSONL records · run ID · workload digest" />
            <Flow label="is kept as" step={2} />
            <Node title="Local artifacts" detail="inference JSONL · optional server telemetry JSONL" />
          </Lane>
        </div>

        <Flow label="is read by" step={3} />
        <p className="mb-2 font-mono text-xs uppercase tracking-wide text-ink-faded">Where you look at it</p>
        <ul className="flex flex-wrap gap-2" aria-label="Surfaces that read artifacts">
          <Chip>CLI analyze</Chip>
          <Chip>TUI</Chip>
          <Chip>stormlog query</Chip>
          <Chip>reports</Chip>
          <Chip>PNG / HTML plots</Chip>
          <Chip>CI exit codes</Chip>
          <Chip>a teammate, later</Chip>
        </ul>
      </InViewBox>
    </ArticleDiagram>
  );
}
