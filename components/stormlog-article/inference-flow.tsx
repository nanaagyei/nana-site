import { ArticleDiagram } from "@/components/article/article-diagram";
import { cn } from "@/lib/utils";

type Status = "released" | "optional" | "dev" | "planned";

const STATUS_LABEL: Record<Status, string> = {
  released: "In v0.4.0",
  optional: "In v0.4.0, optional",
  dev: "Development branch, unreleased",
  planned: "Planned",
};

interface Hop {
  node: string;
  sees: string;
  items: { status: Status; text: string }[];
}

const HOPS: Hop[] = [
  {
    node: "Stormlog client",
    sees: "A controlled workload",
    items: [
      { status: "released", text: "Concurrency, input and output lengths, arrival schedule (closed, fixed-rate, Poisson, burst, replay), prompt sharing, warmup. Recorded with a workload digest." },
    ],
  },
  {
    node: "OpenAI-compatible endpoint",
    sees: "What a client can observe",
    items: [
      { status: "released", text: "End-to-end latency, time to first streamed content (streaming only), token counts with their source, request outcome (ok, timeout, rejected, error, dropped, cancelled)." },
    ],
  },
  {
    node: "Serving engine",
    sees: "Queues, scheduler, cache",
    items: [
      { status: "dev", text: "vLLM Prometheus metrics and request spans, scraped during a run. Merged for the next release, vLLM only." },
      { status: "planned", text: "SGLang, TensorRT-LLM, and TensorRT, each with its own capability matrix." },
    ],
  },
  {
    node: "Server process",
    sees: "Host-side memory and identity",
    items: [
      { status: "optional", text: "A collector on the serving host records process memory. The analyzer joins it to the client's case windows only when identity and clocks line up." },
    ],
  },
  {
    node: "GPU and runtime",
    sees: "Device memory, later GPU activity",
    items: [
      { status: "optional", text: "Whole-device or MIG memory through NVML, with the same join rules. Whole-device numbers aren't a per-request cost." },
      { status: "dev", text: "Request to scheduler-iteration to GPU-activity records, imported from a vLLM hook log. Exact attribution only where verified." },
    ],
  },
];

export function InferenceFlow() {
  return (
    <ArticleDiagram
      label="Figure 9"
      title="The request path, and what Stormlog sees at each hop"
      description="A request travels from the Stormlog client through an OpenAI-compatible endpoint to a serving engine, a server process, and finally the GPU and runtime. Stormlog v0.4.0 observes the client-visible hops and, optionally, host-side process and device memory. Serving-engine scheduler and cache signals exist for vLLM on the development branch and are not released. Other engines are planned."
      caption="Each badge is a text label for the state of that signal, so status never depends on color."
    >
      <ol className="space-y-0">
        {HOPS.map((hop, i) => (
          <li key={hop.node}>
            <div className="grid gap-x-6 gap-y-2 border border-paper-edge bg-paper px-4 py-3 first:rounded-t-[4px] last:rounded-b-[4px] md:grid-cols-[11rem_1fr] [&+&]:-mt-px">
              <div>
                <p className="text-sm text-ink">{hop.node}</p>
                <p className="font-mono text-xs text-ink-faded">{hop.sees}</p>
              </div>
              <ul className="space-y-2">
                {hop.items.map((item) => (
                  <li key={item.text} className="text-sm leading-relaxed text-ink-faded">
                    <span
                      className={cn(
                        "mr-2 inline-block rounded-[3px] border px-1.5 py-px font-mono text-[0.6875rem] align-[1px]",
                        item.status === "released" && "border-moss/60 text-moss",
                        item.status === "optional" && "border-moss/60 border-dashed text-moss",
                        item.status === "dev" && "border-ochre/70 text-ochre",
                        item.status === "planned" && "border-ink-faded/60 border-dotted text-ink-faded",
                      )}
                    >
                      {STATUS_LABEL[item.status]}
                    </span>
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>
            {i < HOPS.length - 1 ? (
              <div className="flex justify-center py-0.5 text-ink-faded" aria-hidden="true">↓</div>
            ) : null}
          </li>
        ))}
      </ol>
    </ArticleDiagram>
  );
}
