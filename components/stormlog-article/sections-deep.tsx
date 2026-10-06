import { SiteLink as Link } from "@/components/article/site-link";
import { ArticleCallout } from "@/components/article/callout";
import { CodeBlock } from "@/components/article/code-block";
import { ExpandableTechnicalDetail } from "@/components/article/expandable-detail";
import { ExtLink } from "@/components/article/ext-link";
import { Prose, Section, SubHeading } from "@/components/article/section";
import { StackTable } from "@/components/article/stack-table";
import { InferenceFlow } from "@/components/stormlog-article/inference-flow";
import { LeakChart } from "@/components/stormlog-article/leak-chart";
import { ISSUE, LINKS } from "@/components/stormlog-article/links";
import { RankTimeline } from "@/components/stormlog-article/rank-timeline";
import { RoadmapStage } from "@/components/stormlog-article/roadmap-stage";
import { sectionMeta } from "@/components/stormlog-article/sections";

const INFERENCE_QUESTIONS = [
  "Time to first token (TTFT) and end-to-end latency",
  "Throughput, and how it changes with concurrency",
  "Token counts, and whether they came from the server or an estimate",
  "Failures, timeouts, and rejected requests",
  "Workload shape: arrival pattern, prompt lengths, shared prefixes",
  "Cache state, and whether the cache was cold",
  "Device memory while all of that happens",
  "What the serving engine itself was doing",
];

export async function SectionsDeep() {
  return (
    <>
      <Section {...sectionMeta("leak-example")}>
        <Prose>
          <p>
            Here’s a loop where the bug is one line that looks like bookkeeping.
          </p>
        </Prose>
        <CodeBlock
          lang="python"
          label="train.py"
          code={`saved_outputs = []

for step, (x, y) in enumerate(loader):
    output = model(x)
    loss = criterion(output, y)
    loss.backward()
    optimizer.step()
    optimizer.zero_grad()
    saved_outputs.append(output)  # looks harmless`}
          caption="Nothing errors and the loss goes down. The appended output is still attached to its autograd graph, so every step’s activations stay alive."
        />
        <Prose>
          <p>
            The fix is usually small, such as appending <code>output.detach().cpu()</code>, or not keeping the output at all. The hard part is noticing. A tracker running next to this loop records allocated memory on every interval, and the timeline shows the difference between the two runs immediately.
          </p>
        </Prose>
        <LeakChart />
        <Prose>
          <p>
            <code>gpumemprof analyze</code> looks at that timeline for growth. Its leak heuristic reports only consistently positive growth, which is why a healthy run that climbs and then levels off isn’t flagged.
          </p>
          <p>
            Stormlog can tell you that memory is climbing and when it started. It can’t tell you which line holds the reference. For allocator-level evidence on CUDA there’s an opt-in native history mode that records allocator history and attaches best-effort pointer-to-tensor attribution to a diagnose or OOM bundle. The <ExtLink href={LINKS.blogLeak}>leak walkthrough</ExtLink> runs a measured investigation end to end, with the hardware and numbers.
          </p>
        </Prose>
      </Section>

      <Section {...sectionMeta("distributed")}>
        <Prose>
          <p>
            One GPU number for a whole job is a sum or an average, and both can hide the interesting rank. If one of four ranks drifts, the average moves by a quarter of what that rank did. The chart below makes the point visible: toggle the average and compare it with rank 2.
          </p>
        </Prose>
        <RankTimeline />
        <Prose>
          <p>Four pieces make this investigation possible.</p>
          <ul>
            <li>
              <strong>Rank identity.</strong> Telemetry carries <code>job_id</code>, <code>rank</code>, <code>local_rank</code>, and <code>world_size</code>. They’re inferred from common launcher environment variables, or set with options such as <code>--job-id</code> and <code>--rank</code> on <code>gpumemprof track</code>.
            </li>
            <li>
              <strong>Aligned telemetry.</strong> <code>gpumemprof analyze</code> merges per-rank timelines. With <code>--visualization</code> it writes a cross-rank timeline plot.
            </li>
            <li>
              <strong>Loading all ranks at once.</strong> The TUI Diagnostics tab loads rank artifacts, keeps ranks separate, and renders per-rank timelines and a rank table.
            </li>
            <li>
              <strong>First-cause suspects.</strong> The analyzer ranks which rank and phase spiked first. These are ranked heuristics. When phases overlap across threads, Stormlog marks the attribution ambiguous instead of guessing.
            </li>
          </ul>
          <p>
            The <ExtLink href={LINKS.blogDistributed}>distributed diagnostics article</ExtLink> walks through the rank-aware workflow in detail.
          </p>
        </Prose>
      </Section>

      <Section {...sectionMeta("inference")}>
        <Prose>
          <p>
            Stormlog started with training memory, and it isn’t only that anymore. Inference raises a different class of questions, and most of them are about behavior under load rather than a single peak.
          </p>
          <ul>
            {INFERENCE_QUESTIONS.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ul>
          <p>
            The tool for it is <code>stormlog infer</code>. It sends controlled traffic to any endpoint that accepts an OpenAI-style Chat Completions request, which covers PyTorch servers, vLLM, SGLang, TensorRT-LLM, MLX-LM, and hosted gateways, and it records what a client can observe.
          </p>
        </Prose>
        <InferenceFlow />

        <SubHeading>Available today</SubHeading>
        <Prose>
          <p>These are in v0.4.0 and documented in the <ExtLink href={LINKS.docsInference}>inference guide</ExtLink>:</p>
          <ul>
            <li>
              A workload matrix over concurrency, input length, and output length, streaming or not, with warmup requests recorded but excluded from analysis.
            </li>
            <li>
              Controlled arrivals: closed loop, fixed rate, seeded Poisson, bursts, and replay of a recorded trace. Open-loop runs also report latency from each request’s intended arrival, so time spent waiting for a slot stays visible.
            </li>
            <li>
              Prompt control: repeat, unique, or shared-prefix prompts, and a way to ask for a cold prefix cache by calling a reset URL before each case.
            </li>
            <li>
              A workload record with a seed and a digest, so the same workload sent to two engine configurations can be recognized as the same.
            </li>
            <li>
              Client-observed latency percentiles, TTFT for streaming responses, throughput, failure rate, and token counts with their source recorded on every request.
            </li>
            <li>
              An optional collector, <code>stormlog infer collect-server</code>, that runs on the serving host and records server process memory and whole-device or MIG memory. The analyzer joins it to a case only when server identity and clocks line up, and it never sums values from different collectors.
            </li>
            <li>
              A fixed exit-code table, so a CI job can tell “no request succeeded” apart from a usage error.
            </li>
          </ul>
        </Prose>
        <ArticleCallout tone="caution" title="Where the limits are">
          <p>
            TTFT is measured on the client from request start to the first non-empty streamed content, and non-streaming runs have none. Chunk timing is chunk-level, not token-level. A requested cold cache is recorded as <code>unverified</code>, because no engine adapter can read the cache yet. Whole-device memory isn’t a per-request cost.
          </p>
        </ArticleCallout>
        <CodeBlock
          lang="bash"
          label="terminal"
          code={`stormlog infer profile \\
  --base-url http://localhost:8000/v1 \\
  --model Qwen/Qwen2.5-7B-Instruct \\
  --arrival poisson --rate 2,4,8 --duration 60 \\
  --prompt-mode unique --seed 7 \\
  --input-tokens 512 --output-tokens 128 \\
  --output artifacts/infer_poisson.jsonl

stormlog infer analyze artifacts/infer_poisson.jsonl`}
          caption="Three arrival rates, each sent for 60 seconds on a schedule fixed before the run starts. unique prompts avoid accidental prefix-cache hits, and the seed makes the run repeatable."
        />

        <SubHeading>From endpoint measurements to serving-engine evidence</SubHeading>
        <Prose>
          <p>
            A client can see that latency rose. It can’t see why. The active roadmap (<ExtLink href={ISSUE(210)}>#210</ExtLink>) is about closing that gap by joining five kinds of evidence:
          </p>
        </Prose>
        <ol className="space-y-0 border-y border-paper-edge text-[0.9375rem]">
          {[
            ["a request", "what the client sent and saw", "released"],
            ["server, process, and GPU identity", "which machine and device the numbers belong to", "released, optional collector"],
            ["scheduler and cache behavior", "queueing, KV-cache pressure, prefix-cache hits", "vLLM on the development branch"],
            ["bounded GPU activity", "a trace window around the incident", "in development"],
            ["an evidence-backed explanation", "findings with their evidence and limits", "planned"],
          ].map(([what, detail, state], i) => (
            <li key={what} className="grid gap-x-6 gap-y-0.5 border-b border-paper-edge/70 py-3 last:border-b-0 sm:grid-cols-[14rem_1fr]">
              <p className="text-ink">
                <span className="mr-2 font-mono text-xs text-ink-faded">{i + 1}</span>
                {what}
              </p>
              <div>
                <p className="text-ink-faded">{detail}</p>
                <p className="mt-0.5 font-mono text-xs text-ink-faded">{state}</p>
              </div>
            </li>
          ))}
        </ol>
        <Prose>
          <p>
            Two caveats keep this honest. A batch is shared by many requests, so Stormlog’s correlation records represent shared execution through membership. They keep measured batch duration separate from any estimated per-request cost, and don’t assign a shared kernel to one request. And an aggregate metrics scrape stays aggregate evidence. Exact request-to-iteration attribution needs worker instrumentation, which is a separate piece of work.
          </p>
          <p>
            What exists beyond v0.4.0 is on the development branch and listed under “Unreleased” in the <ExtLink href={LINKS.changelog}>changelog</ExtLink>: scraping vLLM’s Prometheus metrics during a run, receiving vLLM request spans, and importing a vLLM execution hook’s log into request, iteration, and membership records. That’s vLLM only, and it isn’t in a release yet.
          </p>
        </Prose>
      </Section>

      <Section {...sectionMeta("native-tools")}>
        <Prose>
          <p>
            Native tools are good, and you should keep using them. Different tools answer different layers of the problem.
          </p>
        </Prose>
        <StackTable
          caption="Native tools compared with what Stormlog adds"
          columns={["Tool", "Strong at", "How Stormlog relates"]}
          rows={[
            [
              <code key="a">nvidia-smi</code>,
              "Whole-device memory and utilization, and which processes use the GPU, right now.",
              "Stormlog reads device counters through collectors too, but samples them over time next to allocator counters and attaches session identity.",
            ],
            [
              "PyTorch memory APIs and snapshots",
              "Exact allocator counters and, on CUDA, allocator history.",
              "Stormlog builds on those counters and adds sampling, alerts, artifacts, and analysis. Its native-history mode writes PyTorch’s allocator snapshots into a bundle.",
            ],
            [
              "TensorFlow and JAX profilers",
              "Deep framework-specific inspection: ops, compilation, device memory profiles.",
              "Stormlog gives one workflow and artifact shape across frameworks. On JAX, the OOM recorder attaches the runtime’s own device memory profile.",
            ],
            [
              "Nsight and ROCm tools",
              "Kernel timelines and GPU-level detail.",
              "A different layer. Stormlog doesn’t replace it. The inference roadmap looks at linking bounded traces to incidents.",
            ],
            [
              "System monitors and exporters",
              "Host and fleet-wide metrics.",
              <>
                Stormlog is per-workload evidence. Ingesting DCGM readings as optional server telemetry is an open issue (<ExtLink href={ISSUE(247)}>#247</ExtLink>).
              </>,
            ],
          ]}
        />
        <Prose>
          <p>
            What Stormlog adds is mostly about everything around the measurement: a common workflow across frameworks, normalized telemetry, artifacts that survive the process, session-aware investigation, Python, CLI, and TUI paths to the same data, automated diagnostics, repeatable runs, CI-friendly output, and inference workload profiling. That’s a different job from reading a kernel timeline.
          </p>
        </Prose>

        <SubHeading>What Stormlog is not</SubHeading>
        <Prose>
          <ul>
            <li>A replacement for every vendor GPU profiler.</li>
            <li>A hosted observability platform.</li>
            <li>A root-cause oracle. Its analyzers are heuristics that point at evidence, and findings carry confidence and limits.</li>
            <li>A guarantee that every backend exposes the same counters.</li>
            <li>A reason to skip the native tools for your framework or runtime.</li>
            <li>An LLM that guesses what went wrong. The measurements and labels don’t depend on a model.</li>
          </ul>
        </Prose>
      </Section>

      <Section {...sectionMeta("roadmap")}>
        <Prose>
          <p>
            It’s easy to blur “works today”, “being built”, and “we’d like to find out”. Here they’re kept apart. The three columns are the same split the project uses, and the inference roadmap itself says its milestones describe outcomes, not release versions or dates. I’m following that: nothing below has a ship date.
          </p>
        </Prose>
        <div className="grid gap-x-8 gap-y-10 lg:grid-cols-3">
          <RoadmapStage
            stage="shipped"
            title="Shipped"
            lead="In v0.4.0 or an earlier release."
            items={[
              { title: "PyTorch, TensorFlow, and JAX profilers and trackers", note: "JAX since 0.3.5." },
              { title: "Sessions, TelemetryEventV4, append-only sinks, rollups" },
              { title: "Diagnose bundles with report.json and a fixed exit-code table", note: "New in 0.4.0." },
              { title: "OOM flight recorder, and opt-in CUDA allocator history" },
              { title: "Rank-aware analysis and TUI Diagnostics" },
              { title: "Local query layer, including correlate and run catalogs" },
              { title: "Controlled arrivals, prompt modes, and cold-cache requests for inference", issues: [212], note: "New in 0.4.0." },
              { title: "Host server telemetry with clock alignment and tensor-parallel groups", issues: [214], note: "0.3.10." },
            ]}
          />
          <RoadmapStage
            stage="building"
            title="Building"
            lead="Concrete items on the inference roadmap (#210). Some are merged but unreleased."
            items={[
              { title: "vLLM metrics and request spans during a run", issues: [215], note: "On the development branch. Not in a release." },
              { title: "GPU execution capture, and linking requests to scheduler iterations and GPU activity", issues: [216, 217], note: "The vLLM importer is listed as Unreleased. Capture work is on feature branches." },
              { title: "SLO goodput and repeatable baseline comparisons", issues: [213] },
              { title: "Evidence-backed explanations of incidents", issues: [218] },
              { title: "Incident capture with bounded history", issues: [219, 220, 221] },
              { title: "SGLang, TensorRT-LLM, and TensorRT, each with its own capability matrix", issues: [222, 223, 224] },
              { title: "A local Web UI for inference profiling", issues: [227], note: "Design and a prototype with synthetic fixtures." },
            ]}
          />
          <RoadmapStage
            stage="researching"
            title="Researching"
            lead="Experiments. No implementation is promised, and “reject” is an acceptable result."
            items={[
              { title: "Optional native probes: CUPTI, USDT or eBPF, programmable GPU probes", issues: [118, 235] },
              { title: "Workload-aware incident detection against simpler baselines", issues: [225] },
              { title: "Per-request GPU cost estimates under shared batching", issues: [226] },
              { title: "A scrubbing policy for shareable artifacts", issues: [111] },
              { title: "Native allocator debugging on MPS and ROCm", issues: [97] },
              { title: "TorchTPU support, once its public runtime exists", issues: [125] },
            ]}
          />
        </div>

        <SubHeading>Execution correlation, without double counting</SubHeading>
        <Prose>
          <p>
            The contract for relating a request to shared server iterations and GPU activity shipped in 0.3.10 (<ExtLink href={ISSUE(211)}>#211</ExtLink>). It reports iteration elapsed time, summed activity duration, and merged GPU interval time as three different numbers. The rule behind it: shared execution isn’t falsely assigned to one request. Only the collector side is still being built, and the first target is vLLM.
          </p>
        </Prose>

        <SubHeading>A local Web UI</SubHeading>
        <Prose>
          <p>
            <ExtLink href={ISSUE(227)}>#227</ExtLink> describes a local UI for investigating a slow or failed inference run through its raw requests and metrics, with every displayed value traceable to a field or a calculation. It’s designed to sit on Stormlog’s existing artifacts and report contracts behind a small service boundary, not to reimplement analysis in the frontend. A prototype exists (<ExtLink href={`${LINKS.github}/pull/228`}>PR #228</ExtLink>) with explicitly synthetic fixtures. It’s a design and data-contract exercise, not something you can install.
          </p>
        </Prose>

        <SubHeading>Native probes are research</SubHeading>
        <Prose>
          <p>
            <ExtLink href={ISSUE(118)}>#118</ExtLink> asks whether an optional native collector can provide evidence, or lower collection cost, that the existing PyTorch and Nsight route can’t. Candidates include CUPTI activity collection, USDT or eBPF probes, and programmable GPU probes. None is a dependency of Stormlog, none is committed, and a negative result is a valid way for that issue to end.
          </p>
        </Prose>
      </Section>

      <Section {...sectionMeta("try-it")}>
        <Prose>
          <p>
            Install the package, then add extras for the runtime you use.
          </p>
        </Prose>
        <CodeBlock
          lang="bash"
          label="terminal"
          code={`pip install stormlog

# Pick the extras you need:
pip install "stormlog[torch]"            # PyTorch
pip install "stormlog[tf]"               # TensorFlow
pip install "stormlog[jax]"              # JAX
pip install "stormlog[viz]"              # PNG and HTML plots
pip install "stormlog[tui,torch]"        # terminal UI
pip install "stormlog[infer-tokenizers]" # better token counts for inference
pip install "stormlog[all]"              # everything`}
        />
        <Prose>
          <p>
            Then a ten-second capture, an analysis, a diagnose bundle, and a look at what was saved. This runs on a CPU-only laptop too.
          </p>
        </Prose>
        <CodeBlock
          lang="bash"
          label="terminal"
          code={`pip install "stormlog[torch]"

gpumemprof info

gpumemprof track \\
  --duration 10 \\
  --interval 0.5 \\
  --output run.json \\
  --format json

gpumemprof analyze run.json --format txt --output analysis.txt
gpumemprof diagnose --duration 0 --output ./diag
stormlog query sessions ./diag --table`}
          caption="info shows which backend Stormlog detected. diagnose --duration 0 writes a bundle without a new tracking window. query lists the session that bundle owns."
        />
        <Prose>
          <p>For inference, point the profiler at any OpenAI-compatible endpoint you’re allowed to send traffic to:</p>
        </Prose>
        <CodeBlock
          lang="bash"
          label="terminal"
          code={`stormlog infer profile \\
  --base-url http://localhost:8000/v1 \\
  --model Qwen/Qwen2.5-7B-Instruct \\
  --concurrency 1,4,8 \\
  --requests 20 \\
  --output infer.jsonl

stormlog infer analyze infer.jsonl`}
          caption="A closed-loop run at three concurrency levels, 20 measured requests per case."
        />
        <Prose>
          <p>
            To see everything in one place, <code>{'pip install "stormlog[tui,torch]"'}</code> and run <code>stormlog</code>. Docs, source, and the package page:
          </p>
          <ul>
            <li>
              <ExtLink href={LINKS.docs}>Documentation</ExtLink>, including the <ExtLink href={LINKS.docsCookbook}>production cookbook</ExtLink> and the <ExtLink href={LINKS.docsCpu}>CPU compatibility guide</ExtLink>
            </li>
            <li>
              <ExtLink href={LINKS.github}>GitHub</ExtLink>, where issues and the roadmap live
            </li>
            <li>
              <ExtLink href={LINKS.pypi}>stormlog on PyPI</ExtLink>
            </li>
            <li>
              <ExtLink href={LINKS.blogStart}>Getting started</ExtLink>, the step-by-step version of this section
            </li>
          </ul>
        </Prose>
        <ExpandableTechnicalDetail summary="How I checked these commands">
          <Prose>
            <p>
              I ran the CPU-only sequence above, and the <code>query</code> command, against a fresh install of stormlog 0.4.0 from PyPI on a machine without a GPU. The inference command ran against a local stub server, so I checked its options and artifact output, not its behavior against a deployed model. I ran the tracker example through <code>MemoryTracker</code> with an injected device-only collector, which is how I found that <code>peak_memory</code> is <code>None</code> when a backend has no allocator counters. <code>GPUMemoryProfiler</code> refuses to start without a supported accelerator, so I checked its calls against the 0.4.0 source instead of running it, and I haven’t run either class on a GPU.
            </p>
          </Prose>
        </ExpandableTechnicalDetail>
      </Section>

      <Section {...sectionMeta("related")}>
        <Prose>
          <p>
            This page is the map. These are the places it points to, and what each one teaches.
          </p>
        </Prose>
        <ul className="divide-y divide-paper-edge border-y border-paper-edge">
          {[
            [LINKS.blogIntro, "Introducing Stormlog", "The original case for keeping evidence after the first crash."],
            [LINKS.blogStart, "Getting started", "Install, instrument, and run a first profile with the CLI, the API, and the TUI."],
            [LINKS.blogLeak, "Memory leak walkthrough", "A leak investigation with measured numbers, hardware, and a fix."],
            [LINKS.blogArtifacts, "Artifacts explained", "What each exported file contains and why."],
            [LINKS.blogDistributed, "Distributed diagnostics", "Rank-aware analysis for multi-GPU runs."],
            [LINKS.blogJaxInfer, "JAX and inference profiling", "The release article for the JAX tracker and the inference endpoint profiler."],
            [LINKS.docs, "Documentation", "Architecture, API, CLI, TUI, inference, cookbook, and compatibility pages."],
            [LINKS.github, "GitHub", "Source, issues, the inference roadmap, and the changelog."],
          ].map(([href, title, body]) => (
            <li key={href}>
              <a href={href} target="_blank" rel="noopener noreferrer" className="group block py-3.5">
                <span className="text-ink transition-colors duration-150 group-hover:text-terracotta">{title}</span>
                <span className="mt-0.5 block text-sm leading-relaxed text-ink-faded">{body}</span>
              </a>
            </li>
          ))}
        </ul>
        <p className="text-sm text-ink-faded">
          More from me on Stormlog:{" "}
          <Link href="/writing/stormlog-tutorial-walkthrough" className="text-terracotta underline underline-offset-2 hover:text-ink">
            what I learned walking through the tutorial
          </Link>
          ,{" "}
          <Link href="/writing/oom-flight-recorder-deep-dive" className="text-terracotta underline underline-offset-2 hover:text-ink">
            the OOM flight recorder
          </Link>
          , and{" "}
          <Link href="/writing/mps-memory-leak" className="text-terracotta underline underline-offset-2 hover:text-ink">
            a leak that only showed on Apple MPS
          </Link>
          .
        </p>
      </Section>
    </>
  );
}
