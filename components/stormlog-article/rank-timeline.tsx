"use client";

import { useState } from "react";
import { ArticleDiagram } from "@/components/article/article-diagram";
import { InViewBox } from "@/components/article/in-view-box";
import { at } from "@/lib/at";
import { cn } from "@/lib/utils";

const SAMPLES = Array.from({ length: 41 }, (_, i) => i);
const CAPACITY_GB = 12;
const DIVERGE_AT = 22;

// Illustrative series. Ranks 0, 1 and 3 hover near the same value. Rank 2 starts to drift at sample 22.
function series(rank: number) {
  return SAMPLES.map((s) => {
    const base = 5.2 + rank * 0.28 + 0.5 * (1 - Math.exp(-s / 4)) + 0.05 * Math.sin(s * (1.3 + rank * 0.4) + rank);
    const drift = rank === 2 && s > DIVERGE_AT ? (s - DIVERGE_AT) * 0.3 : 0;
    return Number((base + drift).toFixed(2));
  });
}

const RANKS = [0, 1, 2, 3].map((rank) => ({ rank, values: series(rank) }));
const MEAN = SAMPLES.map((s) =>
  Number((RANKS.reduce((sum, r) => sum + at(r.values, s), 0) / RANKS.length).toFixed(2)),
);

const W = 200;
const H = 110;

function path(values: number[]) {
  return values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * W;
      const y = H - (Math.min(v, CAPACITY_GB) / CAPACITY_GB) * H;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

const TABLE_SAMPLES = [0, 10, 20, 25, 30, 35, 40];

export function RankTimeline() {
  const [showMean, setShowMean] = useState(false);
  const last = SAMPLES.length - 1;
  const rank2End = at(at(RANKS, 2).values, last);
  const meanEnd = at(MEAN, last);
  const flatEnd = at(at(RANKS, 0).values, last);

  return (
    <ArticleDiagram
      label="Figure 8"
      title="Allocated memory on four ranks of one job"
      description={`Illustrative data. Ranks 0, 1 and 3 stay near ${flatEnd.toFixed(1)} gigabytes. Rank 2 begins to climb around sample ${DIVERGE_AT} and ends near ${rank2End.toFixed(1)} gigabytes. The average across all four ranks ends near ${meanEnd.toFixed(1)} gigabytes, so the average shows a much smaller rise than rank 2 does. A table below lists the values.`}
      caption={
        <>
          <strong className="font-medium text-ink">Illustrative, not measured.</strong>{" "}
          With four ranks, one drifting rank moves the average by a quarter of its own change.
        </>
      }
    >
      <InViewBox className="chart-motion">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p className="font-mono text-xs text-ink-faded">rank 0 · rank 1 · rank 2 · rank 3</p>
          <button
            type="button"
            aria-pressed={showMean}
            onClick={() => setShowMean((v) => !v)}
            className={cn(
              "rounded-[3px] border px-2.5 py-1 text-xs transition-colors duration-150",
              showMean
                ? "border-ink bg-ink text-paper"
                : "border-paper-edge text-ink-soft hover:border-ink-faded hover:text-ink",
            )}
          >
            {showMean ? "Hide" : "Show"} average across ranks
          </button>
        </div>

        <div className="flex gap-3">
          <div className="flex w-12 shrink-0 flex-col justify-between pb-6 text-right font-mono text-xs text-ink-faded" aria-hidden="true">
            <span>12 GB</span>
            <span>6</span>
            <span>0</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="relative">
              <svg viewBox={`0 0 ${W} ${H}`} className="chart-svg block w-full overflow-visible" role="img" aria-label="Line chart of four ranks. Rank 2 climbs away from the other three after sample 22.">
                {[0, 0.5, 1].map((f) => (
                  <line key={f} x1="0" x2={W} y1={H * f} y2={H * f} stroke="var(--paper-edge)" strokeWidth="0.6" />
                ))}
                <line
                  x1={(DIVERGE_AT / last) * W}
                  x2={(DIVERGE_AT / last) * W}
                  y1="0"
                  y2={H}
                  stroke="var(--ink-faded)"
                  strokeWidth="0.6"
                  strokeDasharray="1.5 2"
                />
                {RANKS.filter((r) => r.rank !== 2).map((r) => (
                  <path key={r.rank} className="chart-line" d={path(r.values)} fill="none" stroke="var(--ink-faded)" strokeWidth="1.1" strokeLinejoin="round" />
                ))}
                {showMean ? (
                  <path d={path(MEAN)} fill="none" stroke="var(--ochre)" strokeWidth="1.6" strokeDasharray="4 2.5" strokeLinejoin="round" />
                ) : null}
                <path className="chart-line chart-line--lead" d={path(at(RANKS, 2).values)} fill="none" stroke="var(--terracotta)" strokeWidth="2.2" strokeLinejoin="round" />
              </svg>
              <span
                className="absolute top-[2%] font-mono text-xs text-ink-faded"
                style={{ left: `${(DIVERGE_AT / last) * 100}%`, transform: "translateX(-105%)" }}
              >
                rank 2 diverges
              </span>
              <span className="absolute top-[3%] right-[26%] font-mono text-xs text-terracotta">rank 2</span>
              {showMean ? (
                <span className="absolute right-0 pl-1 font-mono text-xs text-ink-soft" style={{ top: `${100 - (meanEnd / CAPACITY_GB) * 100 - 9}%` }}>
                  average
                </span>
              ) : null}
            </div>
            <div className="mt-1 flex justify-between font-mono text-xs text-ink-faded" aria-hidden="true">
              <span>sample 0</span>
              <span>20</span>
              <span>sample 40</span>
            </div>
          </div>
        </div>

        <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink-faded" aria-label="Legend">
          <li className="flex items-center gap-2">
            <svg width="26" height="6" aria-hidden="true"><line x1="0" y1="3" x2="26" y2="3" stroke="var(--ink-faded)" strokeWidth="1.2" /></svg>
            ranks 0, 1, 3
          </li>
          <li className="flex items-center gap-2">
            <svg width="26" height="6" aria-hidden="true"><line x1="0" y1="3" x2="26" y2="3" stroke="var(--terracotta)" strokeWidth="2.6" /></svg>
            rank 2 (heavier)
          </li>
          {showMean ? (
            <li className="flex items-center gap-2">
              <svg width="26" height="6" aria-hidden="true"><line x1="0" y1="3" x2="26" y2="3" stroke="var(--ochre)" strokeWidth="1.6" strokeDasharray="4 2.5" /></svg>
              average of four (dashed)
            </li>
          ) : null}
        </ul>

        <details className="mt-4 text-sm">
          <summary className="cursor-pointer text-ink-faded hover:text-ink">Show the chart values as a table</summary>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full min-w-[30rem] border-collapse text-left text-xs">
              <caption className="sr-only">Illustrative allocated memory in gigabytes per rank at selected samples</caption>
              <thead>
                <tr className="border-b border-paper-edge text-ink-faded">
                  <th scope="col" className="py-1.5 pr-3 font-normal">Sample</th>
                  {RANKS.map((r) => (
                    <th key={r.rank} scope="col" className="py-1.5 pr-3 font-normal">Rank {r.rank}</th>
                  ))}
                  <th scope="col" className="py-1.5 pr-3 font-normal">Average</th>
                </tr>
              </thead>
              <tbody>
                {TABLE_SAMPLES.map((s) => (
                  <tr key={s} className="border-b border-paper-edge/60">
                    <th scope="row" className="py-1.5 pr-3 font-normal text-ink">{s}</th>
                    {RANKS.map((r) => (
                      <td key={r.rank} className="py-1.5 pr-3 font-mono text-ink-soft">{at(r.values, s).toFixed(2)}</td>
                    ))}
                    <td className="py-1.5 pr-3 font-mono text-ink-soft">{at(MEAN, s).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </InViewBox>
    </ArticleDiagram>
  );
}
