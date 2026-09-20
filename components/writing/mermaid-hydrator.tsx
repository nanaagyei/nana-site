"use client";

import mermaid from "mermaid";
import { type RefObject, useEffect } from "react";

function cssVarToHex(variable: string): string {
  const probe = document.createElement("span");
  probe.style.color = `var(${variable})`;
  document.body.appendChild(probe);
  const value = getComputedStyle(probe).color;
  probe.remove();
  return colorToHex(value);
}

function colorToHex(color: string): string {
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return "#888888";

  ctx.clearRect(0, 0, 1, 1);
  try {
    ctx.fillStyle = color;
  } catch {
    return "#888888";
  }
  ctx.fillRect(0, 0, 1, 1);
  const pixel = ctx.getImageData(0, 0, 1, 1).data;
  const hex = [pixel[0] ?? 0, pixel[1] ?? 0, pixel[2] ?? 0]
    .map((channel) => channel.toString(16).padStart(2, "0"))
    .join("");
  return `#${hex}`;
}

function configureMermaid() {
  const isDark = document.documentElement.classList.contains("dark");
  const paper = cssVarToHex("--paper");
  const paperDeep = cssVarToHex("--paper-deep");
  const paperEdge = cssVarToHex("--paper-edge");
  const ink = cssVarToHex("--ink");
  const inkSoft = cssVarToHex("--ink-soft");
  const inkFaded = cssVarToHex("--ink-faded");
  const terracotta = cssVarToHex("--terracotta");
  const fontFamily = getComputedStyle(document.body).fontFamily;

  mermaid.initialize({
    startOnLoad: false,
    securityLevel: "strict",
    suppressErrorRendering: true,
    theme: "base",
    look: "neo",
    fontFamily,
    themeVariables: {
      darkMode: isDark,
      background: paperDeep,
      fontFamily,
      primaryColor: paper,
      primaryTextColor: ink,
      primaryBorderColor: terracotta,
      secondaryColor: paper,
      secondaryTextColor: inkSoft,
      secondaryBorderColor: paperEdge,
      tertiaryColor: paper,
      tertiaryTextColor: inkFaded,
      tertiaryBorderColor: paperEdge,
      lineColor: inkFaded,
      textColor: ink,
      mainBkg: paper,
      nodeBorder: terracotta,
      clusterBkg: paper,
      clusterBorder: paperEdge,
      titleColor: ink,
      edgeLabelBackground: paperDeep,
      clusterLabelColor: inkSoft,
    },
    flowchart: {
      htmlLabels: true,
      curve: "basis",
      padding: 12,
      nodeSpacing: 28,
      rankSpacing: 40,
    },
  });
}

let renderGeneration = 0;

async function draw(root: ParentNode) {
  const generation = ++renderGeneration;

  try {
    configureMermaid();
  } catch {
    return;
  }

  const nodes = [...root.querySelectorAll<HTMLElement>("[data-mermaid]")];
  await Promise.all(
    nodes.map(async (el, index) => {
      const encoded = el.dataset.mermaid;
      if (!encoded) return;

      const source = decodeURIComponent(encoded);
      const id = `nk-mermaid-${generation}-${index}`;

      try {
        const { svg } = await mermaid.render(id, source);
        if (generation !== renderGeneration) return;
        el.innerHTML = svg;
      } catch {
        if (generation !== renderGeneration) return;
        el.replaceChildren();
        const fallback = document.createElement("pre");
        fallback.className = "mermaid-error";
        fallback.textContent = source;
        el.append(fallback);
      }
    }),
  );
}

export function MermaidHydrator({
  containerRef,
}: {
  containerRef: RefObject<HTMLDivElement | null>;
}) {
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    void draw(root);

    let timer = 0;
    const observer = new MutationObserver(() => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        void draw(root);
      }, 80);
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
    };
  }, [containerRef]);

  return null;
}
