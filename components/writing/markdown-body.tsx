"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";

const MermaidHydrator = dynamic(
  () => import("./mermaid-hydrator").then((mod) => mod.MermaidHydrator),
  { ssr: false },
);

export function MarkdownBody({ html }: { html: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hasMermaid = html.includes("data-mermaid");

  return (
    <>
      <div
        ref={containerRef}
        className="prose-custom"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {hasMermaid ? <MermaidHydrator containerRef={containerRef} /> : null}
    </>
  );
}
