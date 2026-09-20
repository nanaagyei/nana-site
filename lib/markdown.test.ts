import { describe, expect, it } from "vitest";
import { renderMarkdown } from "./markdown";

describe("renderMarkdown", () => {
  it("turns mermaid fences into hydratable figures", async () => {
    const html = await renderMarkdown(`\`\`\`mermaid
%% Learner and codebase
flowchart TB
  a[Learner] --> b[Codebase]
\`\`\`
`);

    expect(html).toContain('class="mermaid-figure"');
    expect(html).toContain('role="img"');
    expect(html).toContain('aria-label="Learner and codebase"');
    expect(html).not.toContain("data-rehype-pretty-code-figure");

    const encoded = html.match(/data-mermaid="([^"]+)"/)?.[1];
    expect(encoded).toBeDefined();
    expect(decodeURIComponent(encoded ?? "")).toContain("flowchart TB");
  });

  it("keeps ordinary code fences as highlighted code", async () => {
    const html = await renderMarkdown(`\`\`\`yaml
id: EVID-0042
\`\`\`
`);

    expect(html).toContain("EVID-0042");
    expect(html).toContain("data-rehype-pretty-code-figure");
    expect(html).not.toContain("data-mermaid");
  });

  it("escapes special characters in diagram labels", async () => {
    const html = await renderMarkdown(`\`\`\`mermaid
%% "Team" & state
flowchart LR
  a --> b
\`\`\`
`);

    expect(html).toContain('aria-label="&quot;Team&quot; &amp; state"');
  });

  it("falls back to a generic label when mermaid has no title comment", async () => {
    const html = await renderMarkdown(`\`\`\`mermaid
flowchart LR
  a --> b
\`\`\`
`);

    expect(html).toContain('aria-label="Diagram"');
  });
});
