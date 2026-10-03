import { ArticleCallout } from "@/components/article/callout";
import { CodeBlock } from "@/components/article/code-block";
import { ExpandableTechnicalDetail } from "@/components/article/expandable-detail";
import { ExtLink } from "@/components/article/ext-link";
import { Prose, Section, SubHeading } from "@/components/article/section";
import { StackTable } from "@/components/article/stack-table";
import { ArchitectureDiagram } from "@/components/stormlog-article/architecture-diagram";
import { ArtifactLifecycle } from "@/components/stormlog-article/artifact-lifecycle";
import { LINKS, ISSUE } from "@/components/stormlog-article/links";
import { sectionMeta } from "@/components/stormlog-article/sections";
import { SignalLayers } from "@/components/stormlog-article/signal-layers";
import { TelemetryFlow } from "@/components/stormlog-article/telemetry-flow";

const STAGES: { name: string; body: React.ReactNode }[] = [
  {
    name: "Instrument",
    body: (
      <>
        Start a tracker in your script, or capture with <code>gpumemprof track</code>. Mark phases if you want spikes attributed to them.
      </>
    ),
  },
  {
    name: "Observe",
    body: (
      <>
        Alerts fire when a warning or critical threshold is crossed (<code>--warning-threshold</code>, <code>--critical-threshold</code>). The TUI’s Monitoring tab shows the same tracker data live.
      </>
    ),
  },
  {
    name: "Diagnose",
    body: (
      <>
        <code>gpumemprof analyze</code> reads the saved telemetry. <code>gpumemprof diagnose</code> writes a bundle with a verdict and exits 3 when it raises a risk finding.
      </>
    ),
  },
  {
    name: "Preserve",
    body: (
      <>
        Everything above already wrote files. For crashes, <code>--oom-flight-recorder</code> keeps a rolling buffer and dumps it when an OOM is recognized.
      </>
    ),
  },
  {
    name: "Compare or fix",
    body: (
      <>
        Query sessions side by side with <code>stormlog query</code>, or change the code and capture again. The first capture is still there to compare against.
      </>
    ),
  },
];

const CONCEPTS: { term: string; body: string }[] = [
  { term: "session_id", body: "A unique ID for one capture. Every event, diagnose bundle, and OOM bundle from that capture carries or references it." },
  { term: "Lifecycle state", body: "running, completed, interrupted, or incomplete. A clean stop marks a session completed. A process that died while running is recovered as interrupted on the next start." },
  { term: "Backend identity", body: "Which collector produced the event and which runtime it came from, such as cuda, rocm, or mps." },
  { term: "Distributed identity", body: "job_id, rank, local_rank, and world_size, inferred from common launcher environment variables or set explicitly." },
  { term: "Normalized counters", body: "Allocator and device memory in bytes, with null where a backend can’t provide a counter." },
  { term: "Capability metadata", body: "A typed object saying which counters and analyses this backend supports. It travels with the data." },
];

const EVENT_EXAMPLE = `{
  "schema_version": 4,
  "session_id": "2b30f4a4-7d2d-48f7-a9f6-7d40c14eb95e",
  "timestamp_ns": 1800000000000000000,
  "event_type": "sample",
  "collector": "stormlog.cuda_tracker",
  "sampling_interval_ms": 500,
  "pid": 41873,
  "host": "gpu-node-03",
  "job_id": "train-42",
  "rank": 2,
  "local_rank": 2,
  "world_size": 4,
  "device_id": 2,
  "allocator_allocated_bytes": 6442450944,
  "allocator_reserved_bytes": 8589934592,
  "device_used_bytes": 10737418240,
  "device_free_bytes": 14495514624,
  "device_total_bytes": 25769803776,
  "context": null,
  "metadata": {
    "memory_capabilities": {
      "backend": "cuda",
      "supports_allocator_reserved": true,
      "supports_device_used": true,
      "supports_native_allocator_history": true
    }
  }
}`;

export async function SectionsCore() {
  return (
    <>
      <Section {...sectionMeta("mental-model")}>
        <Prose>
          <p>
            Every Stormlog workflow follows one path. A workload produces measurements. A profiler, tracker, or collector reads them. They’re normalized into events that carry an identity. Those events are written as artifacts. Analysis, plots, and the terminal interface read the artifacts.
          </p>
        </Prose>
        <TelemetryFlow />
        <Prose>
          <p>
            There are two lanes because inference measures different things. A training job reports memory counters from inside the process. An inference run mostly observes a server from the outside, as a client, and records requests. The lanes share the ideas that matter (local files, identity, analysis later) but not the record format. We keep that distinction visible on purpose: inference artifacts are <code>infer.*</code> JSONL records, not <code>TelemetryEventV4</code>.
          </p>
          <p>
            Two things the diagram can’t show. The TUI isn’t a separate analysis engine: it reuses tracker sessions for live data and the same event model for artifacts. And nothing in the path needs a hosted service.
          </p>
        </Prose>
      </Section>

      <Section {...sectionMeta("architecture")}>
        <Prose>
          <p>
            The code is organized as four packages, and the boundaries follow what you’d guess from the names.
          </p>
          <ul>
            <li>
              <code>stormlog</code> holds the PyTorch profiler and tracker, the CPU fallbacks, telemetry normalization and the session contract, the analyzers, the visualizer, the device collectors, local query, the TUI, and inference.
            </li>
            <li>
              <code>stormlog.tensorflow</code> holds the TensorFlow profiler, tracker, analyzer, visualizer, and runtime diagnostics. It has no TUI of its own.
            </li>
            <li>
              <code>stormlog.jax</code> holds the JAX profiler, tracker, diagnostics, analyzer, visualizer, and runtime helpers.
            </li>
            <li>
              <code>stormlog.infer</code> profiles OpenAI-compatible endpoints. It’s separate from the framework tools because the endpoint might be backed by PyTorch, vLLM, SGLang, TensorRT-LLM, MLX-LM, or a hosted gateway.
            </li>
          </ul>
        </Prose>
        <ArchitectureDiagram />

        <SubHeading>The TUI reads the same model</SubHeading>
        <Prose>
          <p>
            The <code>stormlog</code> command opens a Textual app. It adapts live tracker data through a tracker session and loads saved artifacts as <code>TelemetryEventV4</code> records, the same records the CLI reads. Plot export reuses the visualizer. That’s why a diagnose bundle written by a CI job can be opened in the TUI Diagnostics tab by someone else later, and why a bug fix in an analyzer shows up in both places.
          </p>
        </Prose>

        <SubHeading>Collectors declare what they can measure</SubHeading>
        <Prose>
          <p>
            On the PyTorch side, device memory comes from a collector, and every collector answers three questions: what is the current sample, what can you measure, and what are you called. CUDA, ROCm, and MPS each have one. The tracker checks every sample against the collector’s declaration. A populated field the collector said it can’t provide counts as a collector failure.
          </p>
          <p>
            Declaring capabilities lets Stormlog leave a gap as a gap. The easy move for a profiler is to fill missing counters with zeros so charts keep drawing, but a zero is a claim: it says the allocator holds nothing. Stormlog has moved away from that more than once. Always-on tracking exports health events instead of synthetic zero samples (0.3.0). JAX statistics the runtime can’t provide are marked unavailable instead of reported as zero (0.3.8). Device-only tracking never fabricates allocator, fragmentation, history, or attribution findings (0.3.10).
          </p>
        </Prose>
        <ExpandableTechnicalDetail summary="See the collector contract">
          <Prose>
            <ul>
              <li>
                <code>sample()</code> returns a normalized <code>DeviceMemorySample</code>. Allocator and device counters may be <code>None</code>.
              </li>
              <li>
                <code>capabilities()</code> returns a frozen <code>DeviceMemoryCapabilities</code> describing each supported counter and allocator-native feature.
              </li>
              <li>
                <code>name()</code> identifies the backend: <code>cuda</code>, <code>rocm</code>, or <code>mps</code>.
              </li>
              <li>
                A supported field may be missing from a sample only when collector diagnostics name it as partial.
              </li>
              <li>
                Third-party runtimes can pass a collector to <code>MemoryTracker(collector=...)</code> without a torch device. No global registry is involved. Device-only collectors keep sessions, distributed identity, sinks, query, and TUI behavior. Allocator events, fragmentation, attribution, native history, and bounded profiling stay unavailable.
              </li>
            </ul>
          </Prose>
        </ExpandableTechnicalDetail>
        <p className="text-sm text-ink-faded">
          Source of truth: the <ExtLink href={LINKS.docsArchitecture}>architecture guide</ExtLink>, which describes the code as it is, not a roadmap.
        </p>
      </Section>

      <Section {...sectionMeta("signals")}>
        <Prose>
          <p>
            “Memory” is several measurements at different layers, and a backend may expose some of them and not others. It helps to keep the layers apart.
          </p>
        </Prose>
        <SignalLayers />
        <Prose>
          <p>
            That table is why “supports CUDA, ROCm, MPS, TensorFlow, and JAX” is an incomplete sentence. Support means different things on each. TensorFlow and JAX sit outside the PyTorch collector contract and read their own runtimes:
          </p>
          <ul>
            <li>
              TensorFlow runtimes can be CUDA, ROCm, Metal, or CPU. Counters can depend on the runtime on Metal. <code>tfmemprof info</code> prints build and runtime diagnostics.
            </li>
            <li>
              JAX device memory is read through <code>jax.Device.memory_stats()</code> after an XLA sync. It appears only when the runtime reports <code>bytes_in_use</code>. Process memory is reported separately.
            </li>
          </ul>
          <p>
            The point of the layering isn’t to apologize for gaps. It’s that an investigation can use the layers that exist. A device-only runtime still gives you a device-used timeline, sessions, and query. It just can’t give you fragmentation, and it says so.
          </p>
        </Prose>
      </Section>

      <Section {...sectionMeta("debugging-session")}>
        <Prose>
          <p>
            A Stormlog investigation tends to have five stages. They aren’t rigid, and you’ll often loop between the middle ones.
          </p>
        </Prose>
        <ol className="space-y-0 border-y border-paper-edge">
          {STAGES.map((s, i) => (
            <li key={s.name} className="grid gap-1 border-b border-paper-edge/70 py-3 last:border-b-0 sm:grid-cols-[8.5rem_1fr] sm:gap-6">
              <p className="font-display text-base text-ink">
                <span className="mr-2 font-mono text-xs text-ink-faded">{i + 1}</span>
                {s.name}
              </p>
              <p className="prose-custom text-[0.9375rem] leading-relaxed">{s.body}</p>
            </li>
          ))}
        </ol>
        <Prose>
          <p>
            The thing to notice is the line between stages two and three. Until the process exits, the evidence is a set of numbers in memory. After, it’s files.
          </p>
        </Prose>
        <ArtifactLifecycle />
        <CodeBlock
          lang="bash"
          label="terminal"
          code={`gpumemprof track --duration 30 --interval 0.5 --output track.json --format json
gpumemprof analyze track.json --format txt --output analysis.txt
gpumemprof diagnose --duration 5 --interval 0.5 --output ./diag_bundle
echo $?`}
          caption="Capture, analyze, then write a portable bundle. The last line prints diagnose’s exit code: 0 when no risk finding was raised, 3 when one was. diag_bundle/report.json carries the same verdict with its findings."
        />
        <Prose>
          <p>
            Those commands run on a CPU-only host too, using the CPU fallback, which makes them a reasonable first check of your setup before you point them at a GPU.
          </p>
        </Prose>
      </Section>

      <Section {...sectionMeta("sessions-telemetry")}>
        <Prose>
          <p>
            Telemetry is only useful across tools if they agree on what an event is. Stormlog has one canonical event and one session contract, and the tracker, the CLI, diagnose bundles, OOM bundles, and the TUI all use them.
          </p>
        </Prose>
        <dl className="divide-y divide-paper-edge border-y border-paper-edge">
          {CONCEPTS.map((c) => (
            <div key={c.term} className="grid gap-1 py-3 sm:grid-cols-[10rem_1fr] sm:gap-6">
              <dt className="font-mono text-sm text-ink">{c.term}</dt>
              <dd className="text-[0.9375rem] leading-relaxed text-ink-soft">{c.body}</dd>
            </div>
          ))}
        </dl>
        <Prose>
          <p>
            The current event is <code>TelemetryEventV4</code>. Version 2, version 3, and recognized legacy records are upgraded to it on load, so older artifacts still open.
          </p>
          <p>
            If you reuse one sink directory across runs, captures stay separate by <code>session_id</code>. Analysis defaults to the newest completed session, then the newest interrupted one, then the newest incomplete one, and you can pick another with <code>--session-id</code>.
          </p>
        </Prose>
        <ExpandableTechnicalDetail summary="See the event model">
          <CodeBlock
            lang="json"
            label="one TelemetryEventV4 record (trimmed, illustrative values)"
            code={EVENT_EXAMPLE}
            caption="Trimmed for reading. The published schema also requires allocator_active_bytes, allocator_inactive_bytes, allocator_change_bytes, and the full set of supports_* booleans. The values here are made up."
          />
          <Prose>
            <p>
              On a device-only runtime the allocator fields are <code>null</code> and the capability object says why. The published JSON Schema rejects a counter that’s declared unsupported but filled in. The loader also checks what a schema can’t say, such as <code>rank</code> being below <code>world_size</code> and used plus free not exceeding total.
            </p>
          </Prose>
        </ExpandableTechnicalDetail>
      </Section>

      <Section {...sectionMeta("artifacts")}>
        <Prose>
          <p>
            Artifacts are what make the rest of this useful after the job is gone. In plain terms, an artifact is a file or directory holding what Stormlog saw, in a form something else can read.
          </p>
        </Prose>
        <StackTable
          caption="Stormlog artifact types"
          columns={["Artifact", "What it holds", "Produced by"]}
          rows={[
            [
              "Telemetry exports and sink segments",
              "Canonical events as JSON or CSV, or append-only JSONL segments with a manifest, rollover, and retention limits.",
              <>
                <code>track</code>, trackers, TUI exports
              </>,
            ],
            [
              "Diagnose bundle",
              <>
                <code>environment.json</code>, <code>telemetry_timeline.json</code>, <code>diagnostic_summary.json</code>, <code>manifest.json</code>, and <code>report.json</code>.
              </>,
              <code key="d">diagnose</code>,
            ],
            [
              "OOM flight-recorder bundle",
              "Recent events from before an out-of-memory error, with a manifest, metadata, and environment. On CUDA, optional native allocator snapshots.",
              <>
                <code>--oom-flight-recorder</code>, <code>capture_oom()</code>
              </>,
            ],
            [
              "Visual exports",
              "PNG and HTML timelines, heatmaps, and dashboards.",
              "The visualizer, the TUI, analyze with --visualization",
            ],
            [
              "Inference JSONL",
              "A session record, the workload record, request traces, phase windows, cache-state records, optional system samples.",
              <code key="i">stormlog infer profile</code>,
            ],
            [
              "Reports",
              "Text or JSON analysis, and a versioned report envelope with a verdict and findings.",
              <>
                <code>analyze</code>, <code>diagnose</code>
              </>,
            ],
            [
              "Session metadata",
              "A session ledger in sink manifests. Bundles record the session that owns them.",
              "Trackers and diagnose",
            ],
          ]}
        />
        <Prose>
          <p>
            That gives a failure five properties it usually lacks:
          </p>
          <ul>
            <li>
              <strong>Reloadable.</strong> <code>gpumemprof analyze ./live_sink</code> reads a whole directory, not just the last run.
            </li>
            <li>
              <strong>Shareable.</strong> Send the directory. The other person sees the same events.
            </li>
            <li>
              <strong>Comparable.</strong> <code>stormlog query summary</code> groups the same metric by session or by rank.
            </li>
            <li>
              <strong>Suitable for CI.</strong> A fixed exit-code table and a <code>report.json</code> verdict, so a job can branch without parsing text. See the <ExtLink href={LINKS.docsReport}>report contract</ExtLink>.
            </li>
            <li>
              <strong>Reviewable after the process exits.</strong> An OOM bundle holds the events that led to the failure, not only the failure.
            </li>
          </ul>
          <p>
            Session identity is what holds this together. Without it, a directory with five runs in it is one pile of events. With it, a diagnose bundle’s manifest names its session, an OOM bundle points back at the run that produced it, and the TUI can switch between captures instead of merging them. The <ExtLink href={LINKS.blogArtifacts}>artifacts article</ExtLink> goes through the file layouts in detail, so I won’t repeat them here.
          </p>
        </Prose>

        <SubHeading>Local-first</SubHeading>
        <Prose>
          <p>
            Everything in the core workflow works on files you choose, in directories you choose. <code>stormlog query</code> reads them with no database. The CLI and the TUI run locally. Nothing in the path above sends profiling data to a hosted service.
          </p>
          <p>
            Some things do leave the machine, and they’re opt-in. Weights &amp; Biases and MLflow exports exist as optional extras. Inference profiling sends requests to the endpoint you point it at, which is the point of it. Stormlog doesn’t record the API key for an inference run, and it stores a cache-reset URL without credentials or query string.
          </p>
        </Prose>
        <ArticleCallout tone="caution" title="Look before you share">
          <p>
            Local files aren’t scrubbed files. A policy for scrubbing and suppressing fields in shareable artifacts is still an open investigation (<ExtLink href={ISSUE(111)}>#111</ExtLink>), so open a bundle and read it before you send it to someone outside your team.
          </p>
        </ArticleCallout>
      </Section>
    </>
  );
}
