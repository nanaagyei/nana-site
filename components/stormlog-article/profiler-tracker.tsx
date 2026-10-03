import { ArticleDiagram } from "@/components/article/article-diagram";
import { InViewBox } from "@/components/article/in-view-box";

const TICKS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

function Lane({
  kicker,
  question,
  subject,
  tool,
  output,
  children,
}: {
  kicker: string;
  question: string;
  subject: string;
  tool: string;
  output: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col rounded-[4px] border border-paper-edge bg-paper p-4">
      <p className="font-mono text-xs uppercase tracking-wide text-ink-faded">{kicker}</p>
      <p className="mt-1 font-display text-lg leading-snug text-ink">{question}</p>
      <p className="mt-3 text-sm text-ink-faded">{subject}</p>
      <div className="my-3 flex justify-center text-ink-faded" aria-hidden="true">↓</div>
      <p className="rounded-[3px] bg-paper-deep px-3 py-2 text-center font-mono text-sm text-ink">{tool}</p>
      <div className="my-4">{children}</div>
      <p className="mt-auto text-center text-sm text-ink-faded">{output}</p>
    </div>
  );
}

export function ProfilerTracker() {
  return (
    <ArticleDiagram
      label="Figure 2"
      title="Two instruments for two questions"
      description="A profiler wraps one bounded operation, such as a function or a context block, and returns snapshots and a summary. A tracker samples a whole process on a timer and produces a stream of telemetry events, with alerts when thresholds are crossed."
      caption="The profiler's bracket has a start and an end. The tracker's ticks keep going until you stop it."
    >
      <InViewBox className="pt-motion grid gap-4 md:grid-cols-2">
        <Lane
          kicker="bounded question"
          question="What happened inside this operation?"
          subject="A function, a training step, a context block"
          tool="Profiler"
          output="Snapshots and a summary"
        >
          <div className="relative h-16" role="img" aria-label="A timeline with one bracketed span. Memory is captured at its start and at its end.">
            <div className="absolute inset-x-0 top-8 h-px bg-paper-edge" />
            <div className="absolute top-3 right-[18%] left-[18%] h-10 rounded-[3px] border border-terracotta/70 bg-terracotta/5" />
            <span className="pt-snap absolute top-6 left-[18%] h-4 w-4 -translate-x-1/2 rounded-full border-2 border-terracotta bg-paper" />
            <span className="pt-snap absolute top-6 left-[82%] h-4 w-4 -translate-x-1/2 rounded-full border-2 border-terracotta bg-paper" style={{ "--i": 3 } as React.CSSProperties} />
            <span className="absolute top-0 left-1/2 -translate-x-1/2 font-mono text-[0.6875rem] text-ink-faded">train_step()</span>
            <span className="absolute bottom-0 left-[18%] -translate-x-1/2 font-mono text-[0.6875rem] text-ink-faded">before</span>
            <span className="absolute bottom-0 left-[82%] -translate-x-1/2 font-mono text-[0.6875rem] text-ink-faded">after</span>
          </div>
        </Lane>

        <Lane
          kicker="time-based question"
          question="What happened over time?"
          subject="A training run, an evaluation, a long-running process"
          tool="Tracker"
          output="Periodic telemetry events"
        >
          <div className="relative h-16" role="img" aria-label="A long timeline with evenly spaced samples. One sample near the end crosses a threshold and raises an alert.">
            <div className="absolute inset-x-0 top-8 h-px bg-paper-edge" />
            {TICKS.map((i) => (
              <span
                key={i}
                className="pt-tick absolute top-6 h-4 w-px -translate-x-1/2 bg-ink-soft"
                style={{ left: `${4 + i * 9.2}%`, "--i": i } as React.CSSProperties}
              />
            ))}
            <span
              className="pt-tick absolute top-5 h-6 w-[3px] -translate-x-1/2 bg-terracotta"
              style={{ left: `${4 + 9 * 9.2}%`, "--i": 9 } as React.CSSProperties}
            />
            <span className="absolute top-0 left-[86.8%] -translate-x-1/2 font-mono text-[0.6875rem] text-terracotta">alert</span>
            <span className="absolute bottom-0 left-[4%] font-mono text-[0.6875rem] text-ink-faded">start</span>
            <span className="absolute right-[4%] bottom-0 font-mono text-[0.6875rem] text-ink-faded">time →</span>
          </div>
        </Lane>
      </InViewBox>
    </ArticleDiagram>
  );
}
