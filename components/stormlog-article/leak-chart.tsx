import { at } from "@/lib/at";
import { ArticleDiagram } from "@/components/article/article-diagram";
import { InViewBox } from "@/components/article/in-view-box";

const STEPS = Array.from({ length: 41 }, (_, i) => i);
const CAPACITY_GB = 10;

// Illustrative series. Generated from formulas so the shape is reproducible, not measured.
const healthy = STEPS.map((s) =>
  Number((1.2 + 1.8 * (1 - Math.exp(-s / 3)) + 0.04 * Math.sin(s * 1.7)).toFixed(2)),
);
const retention = STEPS.map((s) =>
  Number((1.2 + 0.22 * s + 0.03 * Math.sin(s * 1.3)).toFixed(2)),
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

const TABLE_STEPS = [0, 5, 10, 15, 20, 25, 30, 35, 40];

export function LeakChart() {
  return (
    <ArticleDiagram
      label="Figure 7"
      title="Allocated memory per training step, healthy run versus retention run"
      description="Illustrative data. The healthy run climbs for the first few steps and then stays flat near 3 gigabytes. The retention run climbs steadily every step and reaches the 10 gigabyte device capacity at step 40, where an out-of-memory error would occur. The table below the chart lists the values."
      caption={
        <>
          <strong className="font-medium text-ink">Illustrative, not measured.</strong>{" "}
          The curves are generated from formulas to show the shapes. A measured comparison, with the hardware and numbers, is in the leak walkthrough linked at the end.
        </>
      }
    >
      <InViewBox className="chart-motion">
        <div className="flex gap-3">
          <div className="flex w-12 shrink-0 flex-col justify-between pb-6 text-right font-mono text-xs text-ink-faded" aria-hidden="true">
            <span>10 GB</span>
            <span>5</span>
            <span>0</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="relative">
              <svg viewBox={`0 0 ${W} ${H}`} className="chart-svg block w-full overflow-visible" role="img" aria-label="Line chart. Healthy run flattens. Retention run climbs to capacity at step 40.">
                {[0, 0.5, 1].map((f) => (
                  <line key={f} x1="0" x2={W} y1={H * f} y2={H * f} stroke="var(--paper-edge)" strokeWidth="0.6" strokeDasharray={f === 0 ? "3 2" : undefined} />
                ))}
                <path className="chart-line" d={path(healthy)} fill="none" stroke="var(--moss)" strokeWidth="1.4" strokeLinejoin="round" strokeDasharray="4 2.5" />
                <path className="chart-line chart-line--lead" d={path(retention)} fill="none" stroke="var(--terracotta)" strokeWidth="2.2" strokeLinejoin="round" />
              </svg>
              <span className="absolute top-0 right-0 -translate-y-full pb-1 font-mono text-xs text-ink-faded">device capacity</span>
              <span className="absolute right-0 -translate-y-full pb-1 font-mono text-xs text-moss" style={{ top: "70%" }}>healthy run</span>
              <span className="absolute top-[14%] right-[26%] font-mono text-xs text-terracotta">retention run</span>
            </div>
            <div className="mt-1 flex justify-between font-mono text-xs text-ink-faded" aria-hidden="true">
              <span>step 0</span>
              <span>20</span>
              <span>step 40</span>
            </div>
          </div>
        </div>

        <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink-faded" aria-label="Legend">
          <li className="flex items-center gap-2">
            <svg width="26" height="6" aria-hidden="true"><line x1="0" y1="3" x2="26" y2="3" stroke="var(--moss)" strokeWidth="1.6" strokeDasharray="4 2.5" /></svg>
            healthy run (dashed)
          </li>
          <li className="flex items-center gap-2">
            <svg width="26" height="6" aria-hidden="true"><line x1="0" y1="3" x2="26" y2="3" stroke="var(--terracotta)" strokeWidth="2.6" /></svg>
            retention run (solid, heavier)
          </li>
        </ul>

        <details className="mt-4 text-sm">
          <summary className="cursor-pointer text-ink-faded hover:text-ink">Show the chart values as a table</summary>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full min-w-[26rem] border-collapse text-left text-xs">
              <caption className="sr-only">Illustrative allocated memory in gigabytes at selected steps</caption>
              <thead>
                <tr className="border-b border-paper-edge text-ink-faded">
                  <th scope="col" className="py-1.5 pr-3 font-normal">Step</th>
                  <th scope="col" className="py-1.5 pr-3 font-normal">Healthy run (GB)</th>
                  <th scope="col" className="py-1.5 pr-3 font-normal">Retention run (GB)</th>
                </tr>
              </thead>
              <tbody>
                {TABLE_STEPS.map((s) => (
                  <tr key={s} className="border-b border-paper-edge/60">
                    <th scope="row" className="py-1.5 pr-3 font-normal text-ink">{s}</th>
                    <td className="py-1.5 pr-3 font-mono text-ink-soft">{at(healthy, s).toFixed(2)}</td>
                    <td className="py-1.5 pr-3 font-mono text-ink-soft">{at(retention, s).toFixed(2)}</td>
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
