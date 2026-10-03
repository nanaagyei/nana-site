import { ArticleDiagram } from "@/components/article/article-diagram";
import { StackTable } from "@/components/article/stack-table";

const LAYERS = [
  {
    name: "Application",
    what: "model, phase, request",
    how: "Phases you mark with tracker.phase(); request records in inference runs. Stormlog doesn't guess these.",
  },
  {
    name: "Framework",
    what: "PyTorch, TensorFlow, JAX",
    how: "Snapshots around a function or context. Per-tensor tracking is opt-in (track_tensors=True on PyTorch).",
  },
  {
    name: "Allocator",
    what: "allocated, reserved, active, inactive",
    how: "Counters from the framework's allocator, where the backend exposes them. Allocator history is CUDA-only and opt-in.",
  },
  {
    name: "Device",
    what: "used, free, total",
    how: "Whole-device numbers from the backend collector. These include memory that isn't this process's.",
  },
  {
    name: "System",
    what: "host, process, runtime",
    how: "Process memory (psutil), host and PID identity, and on inference hosts an optional collector for server process and GPU memory.",
  },
];

const mark = (symbol: string, text: string) => (
  <span>
    <span aria-hidden="true" className="mr-1.5 font-mono text-ink-faded">{symbol}</span>
    {text}
  </span>
);

export function SignalLayers() {
  return (
    <>
      <ArticleDiagram
        label="Figure 5"
        title="Five layers of signal"
        description="From the application at the top to the system at the bottom: application, framework, allocator, device, and system. Each layer exposes different measurements, and not every backend exposes every layer."
        caption="Stormlog records the layers a backend exposes and labels the rest unavailable."
      >
        <ol className="space-y-0">
          {LAYERS.map((layer, i) => (
            <li key={layer.name}>
              <div className="grid gap-x-6 gap-y-1 border border-paper-edge bg-paper px-4 py-3 first:rounded-t-[4px] last:rounded-b-[4px] sm:grid-cols-[9rem_1fr] [&+&]:-mt-px">
                <div>
                  <p className="font-mono text-xs uppercase tracking-wide text-ink-faded">{layer.name}</p>
                  <p className="text-sm text-ink">{layer.what}</p>
                </div>
                <p className="text-sm leading-relaxed text-ink-faded">{layer.how}</p>
              </div>
              {i < LAYERS.length - 1 ? (
                <div className="flex justify-center py-0.5 text-ink-faded" aria-hidden="true">↓</div>
              ) : null}
            </li>
          ))}
        </ol>
      </ArticleDiagram>

      <StackTable
        caption="What each PyTorch-side runtime exposes to Stormlog"
        columns={["Runtime", "Allocator counters", "Whole-device used, free, total", "Native allocator history", "Bounded profiler"]}
        rows={[
          [
            "CUDA",
            mark("●", "Yes"),
            mark("●", "Yes"),
            mark("◐", "Yes, opt-in"),
            mark("●", "GPUMemoryProfiler"),
          ],
          [
            "ROCm",
            mark("●", "Yes"),
            mark("●", "Yes"),
            mark("○", "No, CUDA only today"),
            mark("●", "GPUMemoryProfiler"),
          ],
          [
            "Apple MPS",
            mark("◐", "Allocated and reserved"),
            mark("◐", "Used; free and total when the runtime reports a maximum"),
            mark("○", "No"),
            mark("○", "No, use MemoryTracker"),
          ],
          [
            "CPU only",
            mark("○", "Not applicable"),
            mark("◐", "Process and system memory"),
            mark("○", "No"),
            mark("◐", "CPUMemoryProfiler"),
          ],
          [
            "Injected device-only collector",
            mark("○", "Null, with a declared reason"),
            mark("◐", "As the collector declares"),
            mark("○", "No"),
            mark("○", "No"),
          ],
        ]}
      />
    </>
  );
}
