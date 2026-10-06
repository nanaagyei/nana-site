import { SiteLink as Link } from "@/components/article/site-link";
import { ArticleCallout } from "@/components/article/callout";
import { ArticleDiagram } from "@/components/article/article-diagram";
import { CodeBlock } from "@/components/article/code-block";
import { ExtLink } from "@/components/article/ext-link";
import { Prose, Section } from "@/components/article/section";
import { StackTable } from "@/components/article/stack-table";
import { MemoryStack } from "@/components/stormlog-article/memory-stack";
import { ProfilerTracker } from "@/components/stormlog-article/profiler-tracker";
import { LINKS } from "@/components/stormlog-article/links";
import { sectionMeta } from "@/components/stormlog-article/sections";

const TERMS: { term: string; body: string }[] = [
  {
    term: "Device memory",
    body: "The GPU’s own memory. Weights, activations, gradients, optimizer state, and everything else your job puts on the card live here. It’s finite. When a request can’t be satisfied, you get an out-of-memory error (OOM).",
  },
  {
    term: "Allocated and reserved",
    body: "Frameworks like PyTorch don’t ask the driver for memory every time a tensor is created. Their allocator grabs larger blocks and hands out pieces. Allocated is what live tensors use right now. Reserved is what the allocator is holding, including pieces nobody is using at the moment. Reserved is always at least as large as allocated.",
  },
  {
    term: "Whole-device usage",
    body: "What the driver reports as used. It includes the allocator’s reserve, the runtime’s own overhead, and other processes sharing the GPU. This is the number nvidia-smi shows, and it isn’t the same as allocated.",
  },
  {
    term: "Peak",
    body: "The highest value in a window. An average can look calm while the peak is what runs you out of memory.",
  },
  {
    term: "Growth and retention",
    body: "Memory that rises step after step and doesn’t come back. Usually something still holds a reference to tensors you’re done with. That’s retention.",
  },
  {
    term: "Fragmentation",
    body: "Reserved memory that exists but is split into pieces too small or too scattered for the next large request. You can hit an OOM with idle memory sitting in the cache.",
  },
];

interface Persona {
  who: string;
  body: string;
  fragment: string;
}

const PERSONAS: Persona[] = [
  {
    who: "ML engineer",
    body: "Your training or evaluation job uses more memory than you expected, and you want to know where it goes.",
    fragment: "profiler.profile_function(train_step)",
  },
  {
    who: "Researcher",
    body: "You’re comparing experiments, and you need enough evidence kept to reproduce a failure later.",
    fragment: "stormlog query sessions ./artifacts --table",
  },
  {
    who: "ML systems and infrastructure engineer",
    body: "Long-running jobs, multi-GPU behavior, regressions after an upgrade.",
    fragment: "gpumemprof track --job-id train-42 --rank 1 --world-size 8",
  },
  {
    who: "Inference engineer",
    body: "Latency, throughput, failures, token counts, workload shape, and memory under controlled load.",
    fragment: "stormlog infer profile --arrival poisson --rate 4,8 ...",
  },
  {
    who: "CI and release engineer",
    body: "Deterministic diagnostics and machine-readable reports you can archive with a build.",
    fragment: "gpumemprof diagnose --duration 0 --output ./diag  # exit 3 on risk",
  },
  {
    who: "Open-source contributor",
    body: "Collectors, telemetry schemas, analyzers, visualization, runtime support, inference observability.",
    fragment: "stormlog/device_collectors.py  # DeviceMemoryCollector",
  },
];

export async function SectionsIntro() {
  return (
    <>
      <Section {...sectionMeta("the-symptom")}>
        <Prose>
          <p>
            A training job can look healthy for twenty minutes. Loss goes down, throughput holds, the GPU shows as busy. Meanwhile the memory footprint is quietly changing. Maybe a list somewhere keeps a reference to every step’s output. Maybe one rank in an eight-GPU job starts drifting while the other seven stay flat. Then the job dies with an out-of-memory error, and the only evidence you have is the stack trace from the moment of death.
          </p>
          <p>
            Inference has its own version of this. An endpoint can hit its latency target with one request in flight and behave very differently with thirty-two. The quick test you ran before deploying doesn’t tell you where the curve bends, or why.
          </p>
          <p>
            In both cases you’re debugging from a symptom. The cause happened earlier, in a place nobody was recording. Stormlog is our attempt to make that earlier behavior inspectable and reproducible: measure it while it happens, keep the evidence after the process exits, and make it possible to look at the same evidence twice.
          </p>
          <p>
            I work on Stormlog with Silas Asamoah and Derrick Dwamena. It’s open source (MIT), written in Python, and it covers PyTorch, TensorFlow, JAX, and OpenAI-compatible inference endpoints. This page is the explanation I wanted to be able to link to: what it is, how the pieces fit, and where its edges are.
          </p>
          <p>
            The page is long, and it’s built so you can stop early. The first sections explain the problem and the mental model with very little code. The middle covers how Stormlog is put together. The end has runnable examples, an honest list of what Stormlog isn’t, and the roadmap. If you’d rather start with commands, go to <a href="#try-it">Try it</a>.
          </p>
        </Prose>
        <ArticleCallout tone="status" title="Written against v0.4.0">
          <p>
            Stormlog <ExtLink href={LINKS.release}>v0.4.0</ExtLink> was released on 2 October 2026. When this page says something is shipped, it’s in that release. Work that exists only on the development branch, or only as a GitHub issue, is labeled that way.
          </p>
        </ArticleCallout>
      </Section>

      <Section {...sectionMeta("gpu-memory")}>
        <Prose>
          <p>
            You don’t need to know CUDA to follow the rest of this page. A handful of ideas cover most of it.
          </p>
        </Prose>
        <dl className="divide-y divide-paper-edge border-y border-paper-edge">
          {TERMS.map((t) => (
            <div key={t.term} className="grid gap-1 py-4 sm:grid-cols-[11rem_1fr] sm:gap-6">
              <dt className="font-display text-base text-ink">{t.term}</dt>
              <dd className="text-[0.9375rem] leading-relaxed text-ink-soft">{t.body}</dd>
            </div>
          ))}
        </dl>
        <Prose>
          <p>
            None of these has to look wrong until the last step. Reserved memory is allowed to stay high. Allocated memory can creep for hours. A job fails when one request for one block can’t be satisfied, and that depends on the peak and on how the free space is arranged, not on how the run looked a minute earlier.
          </p>
          <p>
            Step through five situations below. The percentages are illustrative. They’re there to show the idea, not to describe a particular GPU.
          </p>
        </Prose>
        <ArticleDiagram
          label="Figure 1"
          title="One GPU, five situations"
          description="A horizontal bar represents all device memory, split into tensors in use, idle allocator reserve, other device usage, and free space. Five states show the free space shrinking as tensor memory grows through healthy, growing, retention, near out-of-memory, and out-of-memory. A table below lists the percentages for each state."
          caption="Illustrative percentages. Select a segment to read what it means."
        >
          <MemoryStack />
        </ArticleDiagram>
        <Prose>
          <p>
            What Stormlog records here, for the runtimes that expose it, is the shape of the climb instead of only the final error. What each backend exposes differs, and the section on <a href="#signals">what Stormlog can see</a> gets specific.
          </p>
        </Prose>
      </Section>

      <Section {...sectionMeta("what-is-stormlog")}>
        <Prose>
          <p>
            Stormlog is an open-source toolkit for profiling GPU memory and inference behavior. It measures a workload, writes what it saw to local files, and gives you several ways to read those files again: Python APIs, command-line tools, and a terminal interface.
          </p>
          <p>
            That sentence covers a lot of surface, so here is what the v0.4.0 release contains, with the caveat that matters for each part.
          </p>
        </Prose>
        <StackTable
          caption="Stormlog v0.4.0 capabilities and their caveats"
          columns={["Area", "What’s there", "Caveat"]}
          rows={[
            [
              "PyTorch",
              <>
                <code>GPUMemoryProfiler</code> for bounded profiling, <code>MemoryTracker</code> for tracking over time.
              </>,
              "Bounded profiling targets torch.cuda runtimes (CUDA and ROCm). MPS and CPU use the tracker or the CPU classes.",
            ],
            [
              "TensorFlow",
              <>
                <code>stormlog.tensorflow</code>: <code>TFMemoryProfiler</code>, <code>TensorFlowMemoryTracker</code>, analyzer, visualizer.
              </>,
              "Counters can depend on the runtime, especially on Metal.",
            ],
            [
              "JAX",
              <>
                <code>stormlog.jax</code>: <code>JAXMemoryProfiler</code>, tracker, analyzer, pprof-based graph view.
              </>,
              "Device memory appears only when the runtime exposes it. Otherwise it’s marked unavailable and process memory is reported separately.",
            ],
            [
              "CPU",
              <>
                <code>CPUMemoryProfiler</code>, <code>CPUMemoryTracker</code>, and a CPU fallback in the CLI.
              </>,
              "Useful for checking a workflow without a GPU. It isn’t a substitute for device counters.",
            ],
            [
              "Command line",
              <>
                <code>gpumemprof</code>, <code>tfmemprof</code>, <code>jaxmemprof</code> (each with info, monitor, track, analyze, diagnose), plus <code>stormlog query</code> and <code>stormlog infer</code>.
              </>,
              "Same command names across frameworks, but the options differ.",
            ],
            [
              "Terminal UI",
              "A Textual app with Overview, PyTorch, TensorFlow, Monitoring, Visualizations, Diagnostics, and CLI & Actions tabs.",
              <>
                Startup currently imports PyTorch, so install <code>stormlog[tui,torch]</code>.
              </>,
            ],
            [
              "Telemetry and artifacts",
              "Session-aware events, append-only sinks, diagnose bundles, OOM bundles, rollups.",
              "Inference runs use their own record format.",
            ],
            [
              "Analysis",
              "Growth and leak heuristics, hidden-memory gap analysis, cross-rank first-cause suspects.",
              "Heuristics. They point somewhere. They don’t prove a cause.",
            ],
            [
              "Visual exports",
              "PNG and HTML timelines, heatmaps, dashboards.",
              <>
                Needs the <code>viz</code> extra.
              </>,
            ],
            [
              "Inference",
              <>
                <code>stormlog infer profile</code>, <code>analyze</code>, and <code>collect-server</code> for OpenAI-compatible Chat Completions endpoints.
              </>,
              "Client-observed metrics. Server memory only with the optional host collector.",
            ],
          ]}
        />
        <ArticleCallout tone="caution" title="Backends aren’t identical">
          <p>
            CUDA, ROCm, MPS, TensorFlow, JAX, and CPU expose different counters. Stormlog records what each runtime exposes and marks the rest unavailable instead of filling it in. The <a href="#signals">table in the signals section</a> shows who exposes what.
          </p>
        </ArticleCallout>
      </Section>

      <Section {...sectionMeta("who-its-for")}>
        <Prose>
          <p>
            People open Stormlog for different reasons. These are the ones we design for. Each card ends with a fragment of the workflow that person would run.
          </p>
        </Prose>
        <ul className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
          {PERSONAS.map((p) => (
            <li key={p.who} className="border-t border-paper-edge pt-3">
              <p className="font-display text-base text-ink">{p.who}</p>
              <p className="mt-1 text-[0.9375rem] leading-relaxed text-ink-soft">{p.body}</p>
              <p className="mt-3 overflow-x-auto rounded-[3px] bg-paper-deep px-3 py-2 font-mono text-xs whitespace-nowrap text-ink-soft" tabIndex={0}>
                {p.fragment}
              </p>
            </li>
          ))}
        </ul>
      </Section>

      <Section {...sectionMeta("profiler-vs-tracker")}>
        <Prose>
          <p>
            Stormlog gives you two kinds of instrument, and choosing between them is mostly a matter of which question you’re asking. A profiler answers a bounded question: what happened inside this operation? A tracker answers a time-based one: what happened over time?
          </p>
        </Prose>
        <ProfilerTracker />
        <Prose>
          <p>
            In practice you often start with a tracker, because you don’t yet know where to look. Once the timeline shows when something changes, a profiler around the suspect step tells you more about that step. The two are different code paths in the package, not one tool with two modes.
          </p>
        </Prose>
        <CodeBlock
          lang="python"
          label="profile_one_step.py"
          code={`import torch
from stormlog import GPUMemoryProfiler

profiler = GPUMemoryProfiler()
device = profiler.device
model = torch.nn.Linear(1024, 128).to(device)

def train_step() -> torch.Tensor:
    x = torch.randn(64, 1024, device=device)
    return model(x).sum()

profile = profiler.profile_function(train_step)
summary = profiler.get_summary()

print(profile.function_name)
print(f"Peak memory: {summary['peak_memory_usage'] / (1024**3):.2f} GB")`}
          caption="A bounded question. profile_function runs the function once and keeps before and after snapshots. get_summary() aggregates what the profiler has seen."
        />
        <CodeBlock
          lang="python"
          label="track_a_run.py"
          code={`from stormlog import MemoryTracker

tracker = MemoryTracker(sampling_interval=0.5, enable_alerts=True)

tracker.start_tracking()
with tracker.phase("train"):
    run_training()  # your workload
tracker.stop_tracking()

stats = tracker.get_statistics()
peak = stats.get("peak_memory")  # None where the backend has no allocator counters
print("Peak allocated:", "unavailable" if peak is None else f"{peak / 1024**3:.2f} GB")
print(f"Events: {stats.get('total_events', 0)}")`}
          caption="A time-based question. sampling_interval is in seconds. phase() writes enter and exit events, so later analysis can say which phase a spike belongs to. peak_memory comes from allocator counters, so it is None on a backend without them, and the check keeps the example honest. A clean stop_tracking() marks the session completed."
        />
        <Prose>
          <p>
            On a machine without a supported GPU, <code>GPUMemoryProfiler</code> and <code>MemoryTracker</code> raise a <code>RuntimeError</code>. Swap in <code>CPUMemoryProfiler</code> or <code>CPUMemoryTracker</code> to check your instrumentation on a laptop. They offer the same methods (<code>profile_function</code>, <code>get_summary</code>, <code>phase</code>), but the CPU profile result names the function <code>name</code> rather than <code>function_name</code>.
          </p>
        </Prose>
        <p className="text-sm text-ink-faded">
          Both examples follow the usage guide in the{" "}
          <ExtLink href={LINKS.docs}>Stormlog documentation</ExtLink>. See also the{" "}
          <Link href="/projects/stormlog" className="text-terracotta underline underline-offset-2 hover:text-ink">
            Stormlog project page
          </Link>
          .
        </p>
      </Section>
    </>
  );
}
