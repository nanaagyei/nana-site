import type { Root } from "mdast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

function escapeAttribute(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function diagramLabel(source: string): string {
  const titleLine = source.split("\n").find((line) => line.startsWith("%%"));
  if (!titleLine) return "Diagram";
  return (
    titleLine.replace(/^%%\{.*\}%%/, "").replace(/^%%\s*/, "").trim() ||
    "Diagram"
  );
}

export const remarkMermaid: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, "code", (node, index, parent) => {
      if (node.lang !== "mermaid" || parent == null || typeof index !== "number") {
        return;
      }

      parent.children[index] = {
        type: "html",
        value: `<figure class="mermaid-figure"><div class="mermaid-diagram" data-mermaid="${encodeURIComponent(node.value)}" role="img" aria-label="${escapeAttribute(diagramLabel(node.value))}"></div></figure>`,
      };
    });
  };
};
