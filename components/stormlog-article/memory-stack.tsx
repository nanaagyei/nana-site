"use client";

import { at } from "@/lib/at";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/components/article/use-in-view";

type SegmentKey = "tensors" | "reserve" | "other" | "free";

interface Segment {
  key: SegmentKey;
  name: string;
  short: string;
  meaning: string;
}

const SEGMENTS: Segment[] = [
  {
    key: "tensors",
    name: "Tensors in use",
    short: "allocated",
    meaning:
      "Memory held by live tensors right now. Frameworks call this allocated memory. It is the number that grows when something keeps a reference alive.",
  },
  {
    key: "reserve",
    name: "Allocator reserve",
    short: "reserved, idle",
    meaning:
      "Memory the framework's allocator is holding for reuse. Tensors aren't using it, but the driver has handed it over, so other processes can't have it either.",
  },
  {
    key: "other",
    name: "Other device usage",
    short: "outside the allocator",
    meaning:
      "Runtime context, other processes, and anything else on the device that isn't this allocator's. Whole-device tools such as nvidia-smi include it.",
  },
  {
    key: "free",
    name: "Free",
    short: "unclaimed",
    meaning:
      "Not claimed by anyone. This is what the driver can still hand out to a new request.",
  },
];

interface State {
  id: string;
  title: string;
  /** Percent of device memory per segment, in SEGMENTS order. Sums to 100. */
  values: [number, number, number, number];
  changed: string;
}

const STATES: State[] = [
  {
    id: "healthy",
    title: "Healthy and stable",
    values: [34, 14, 8, 44],
    changed:
      "Allocated memory moves with each step and comes back down. Reserved memory sits a little above it. There is plenty of free space.",
  },
  {
    id: "growing",
    title: "Growing workload",
    values: [48, 16, 8, 28],
    changed:
      "A larger batch or longer sequences raise allocated memory, and the allocator reserves more to match. This is normal if it levels off.",
  },
  {
    id: "retention",
    title: "Suspicious retention",
    values: [60, 14, 8, 18],
    changed:
      "Allocated memory keeps climbing across steps and doesn't return to its earlier floor. Something is still holding references to tensors.",
  },
  {
    id: "near-oom",
    title: "Near out-of-memory",
    values: [70, 18, 9, 3],
    changed:
      "Free space is almost gone. The cache holds idle pieces, but the allocator may not be able to combine them into the block the next step needs.",
  },
  {
    id: "oom",
    title: "Out of memory",
    values: [70, 20, 9, 1],
    changed:
      "A request for one large block fails even though the cache holds idle memory. The error reports where things ended up, not how they got there.",
  },
];

const STEP_MS = 2600;

export function MemoryStack() {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [focusKey, setFocusKey] = useState<SegmentKey>("tensors");

  // Walk through the states once, when the figure first scrolls into view. Never with reduced motion.
  useEffect(() => {
    const node = ref.current;
    if (reduced || !node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setPlaying(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [reduced]);

  const atEnd = index === STATES.length - 1;
  const running = playing && !atEnd;

  useEffect(() => {
    if (!running) return;
    const id = setTimeout(() => setIndex((i) => i + 1), STEP_MS);
    return () => clearTimeout(id);
  }, [running, index]);

  const state = at(STATES, index);
  const focused = SEGMENTS.find((s) => s.key === focusKey) ?? at(SEGMENTS, 0);

  function choose(i: number) {
    setPlaying(false);
    setIndex(i);
  }

  function togglePlay() {
    if (running) {
      setPlaying(false);
      return;
    }
    if (atEnd) setIndex(0);
    setPlaying(true);
  }

  return (
    <div ref={ref}>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div role="group" aria-label="Memory scenario" className="flex flex-wrap gap-1.5">
          {STATES.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => choose(i)}
              aria-pressed={i === index}
              className={cn(
                "rounded-[3px] border px-2.5 py-1 text-left text-xs transition-colors duration-150",
                i === index
                  ? "border-terracotta bg-terracotta/10 text-ink"
                  : "border-paper-edge text-ink-faded hover:border-ink-faded hover:text-ink",
              )}
            >
              <span className="mr-1.5 font-mono">{i + 1}</span>
              {s.title}
            </button>
          ))}
        </div>
        {!reduced ? (
          <button
            type="button"
            onClick={togglePlay}
            className="ml-auto rounded-[3px] px-2 py-1 font-mono text-xs text-terracotta hover:bg-paper-edge/60"
          >
            {running ? "pause" : atEnd ? "replay" : "play"}
          </button>
        ) : null}
      </div>

      {/* The device, drawn as one bar. Segment widths are percentages of total device memory. */}
      <div
        role="group"
        aria-label={`Device memory in state ${index + 1}: ${state.title}`}
        className="flex h-14 w-full overflow-hidden rounded-[3px] border border-paper-edge bg-paper"
      >
        {SEGMENTS.map((seg, i) => (
          <button
            key={seg.key}
            type="button"
            onMouseEnter={() => setFocusKey(seg.key)}
            onFocus={() => setFocusKey(seg.key)}
            onClick={() => setFocusKey(seg.key)}
            aria-label={`${seg.name}: ${at(state.values, i)} percent of device memory`}
            aria-describedby="memory-segment-meaning"
            className={cn(
              "mem-seg relative h-full min-w-0 border-r border-paper last:border-r-0 focus-visible:z-10",
              `mem-seg--${seg.key}`,
              focusKey === seg.key && "ring-2 ring-inset ring-ink/50",
            )}
            style={{ width: `${at(state.values, i)}%` }}
          />
        ))}
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-4">
        {SEGMENTS.map((seg, i) => (
          <div key={seg.key} className="flex items-start gap-2">
            <span
              aria-hidden="true"
              className={cn("mt-1 inline-block h-3 w-3 shrink-0 rounded-[2px] border border-paper-edge", `mem-seg--${seg.key}`)}
            />
            <div>
              <dt className="text-ink">{seg.name}</dt>
              <dd className="font-mono text-xs text-ink-faded">
                {at(state.values, i)}% · {seg.short}
              </dd>
            </div>
          </div>
        ))}
      </dl>

      <div className="mt-5 border-t border-paper-edge pt-4" aria-live="polite">
        <p className="text-sm text-ink">
          <span className="mr-2 font-mono text-xs text-terracotta">
            {index + 1}/{STATES.length}
          </span>
          {state.title}
        </p>
        <p className="mt-1 text-sm leading-relaxed text-ink-faded">{state.changed}</p>
      </div>

      <p
        id="memory-segment-meaning"
        className="mt-3 rounded-[3px] bg-paper px-3 py-2 text-sm leading-relaxed text-ink-faded"
      >
        <span className="text-ink">{focused.name}.</span> {focused.meaning}
      </p>

      <details className="mt-4 text-sm">
        <summary className="cursor-pointer text-ink-faded hover:text-ink">
          Show all five states as a table
        </summary>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full min-w-[30rem] border-collapse text-left text-xs">
            <caption className="sr-only">
              Illustrative share of device memory in each scenario
            </caption>
            <thead>
              <tr className="border-b border-paper-edge text-ink-faded">
                <th scope="col" className="py-1.5 pr-3 font-normal">State</th>
                {SEGMENTS.map((s) => (
                  <th key={s.key} scope="col" className="py-1.5 pr-3 font-normal">
                    {s.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {STATES.map((s, i) => (
                <tr key={s.id} className="border-b border-paper-edge/60">
                  <th scope="row" className="py-1.5 pr-3 font-normal text-ink">
                    {i + 1}. {s.title}
                  </th>
                  {s.values.map((v, j) => (
                    <td key={at(SEGMENTS, j).key} className="py-1.5 pr-3 font-mono text-ink-soft">
                      {v}%
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
