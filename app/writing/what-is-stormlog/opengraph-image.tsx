import { ImageResponse } from "next/og";

export const alt =
  "What Stormlog Is, How It Works, and Why We’re Building It: a visual guide to GPU memory profiling";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Static hex approximations of the site's paper and ink tokens.
const PAPER = "#f1e9dc";
const INK = "#2a211c";
const FADED = "#7a6c60";
const TERRACOTTA = "#a04a33";
const OCHRE = "#c79a3e";
const EDGE = "#dbcdb8";

// The same four segments as the memory figure in the article: tensors, reserve, other, free.
const SEGMENTS = [
  { w: 60, fill: TERRACOTTA },
  { w: 14, fill: OCHRE },
  { w: 8, fill: FADED },
  { w: 18, fill: "transparent" },
];

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: PAPER,
          color: INK,
          padding: "72px 80px",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 26, color: FADED, letterSpacing: 1 }}>
          nana · writing
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 68, lineHeight: 1.08, letterSpacing: -1.5, display: "flex" }}>
            What Stormlog Is, How It Works, and Why We’re Building It
          </div>
          <div style={{ marginTop: 28, fontSize: 28, lineHeight: 1.3, color: FADED, display: "flex" }}>
            GPU memory, telemetry, artifacts, and inference profiling
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              height: 44,
              width: "100%",
              border: `2px solid ${EDGE}`,
              borderRadius: 4,
              overflow: "hidden",
            }}
          >
            {SEGMENTS.map((s, i) => (
              <div
                key={i}
                style={{
                  width: `${s.w}%`,
                  height: "100%",
                  background: s.fill,
                  borderRight: i < SEGMENTS.length - 1 ? `2px solid ${PAPER}` : "none",
                }}
              />
            ))}
          </div>
          <div style={{ marginTop: 14, display: "flex", fontSize: 22, color: FADED }}>
            illustrative: tensors in use · allocator reserve · other · free
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
