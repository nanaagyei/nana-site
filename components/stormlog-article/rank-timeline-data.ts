import { at } from "@/lib/at";

export const SAMPLES = Array.from({ length: 41 }, (_, i) => i);
export const CAPACITY_GB = 12;
export const DIVERGE_AT = 22;

// Illustrative series. Ranks 0, 1 and 3 hover near the same value. Rank 2 starts to drift at sample 22.
function series(rank: number) {
  return SAMPLES.map((s) => {
    const base = 5.2 + rank * 0.28 + 0.5 * (1 - Math.exp(-s / 4)) + 0.05 * Math.sin(s * (1.3 + rank * 0.4) + rank);
    const drift = rank === 2 && s > DIVERGE_AT ? (s - DIVERGE_AT) * 0.3 : 0;
    return Number((base + drift).toFixed(2));
  });
}

export const RANKS = [0, 1, 2, 3].map((rank) => ({ rank, values: series(rank) }));
export const MEAN = SAMPLES.map((s) =>
  Number((RANKS.reduce((sum, r) => sum + at(r.values, s), 0) / RANKS.length).toFixed(2)),
);

/** Numbers the figure’s written description quotes, so the page and the PDF say the same thing. */
export function rankTimelineSummary() {
  const last = SAMPLES.length - 1;
  return {
    rank2End: at(at(RANKS, 2).values, last),
    meanEnd: at(MEAN, last),
    flatEnd: at(at(RANKS, 0).values, last),
  };
}
