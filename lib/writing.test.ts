import { describe, expect, it } from "vitest";
import { renderMarkdown } from "./markdown";
import { getPostBySlug, getPostNav, getPosts } from "./writing";

describe("writing posts", () => {
  it("publishes the noetherkin essay and its two-part architecture companion", () => {
    const slugs = getPosts().map((post) => post.slug);
    expect(slugs).toContain("noetherkin-architecture-notes");
    expect(slugs).toContain("noetherkin-architecture-notes-part-2");
    expect(slugs).toContain("what-if-learning-felt-like-joining-a-team");
  });

  it("surfaces the companion first in suggested reading", () => {
    const notes = getPostNav("noetherkin-architecture-notes");
    expect(notes.companion?.slug).toBe(
      "what-if-learning-felt-like-joining-a-team",
    );
    expect(notes.suggested[0]?.slug).toBe(
      "what-if-learning-felt-like-joining-a-team",
    );

    const essay = getPostNav("what-if-learning-felt-like-joining-a-team");
    expect(essay.companion?.slug).toBe("noetherkin-architecture-notes");
    expect(essay.suggested[0]?.slug).toBe("noetherkin-architecture-notes");

    const part2 = getPostNav("noetherkin-architecture-notes-part-2");
    expect(part2.companion?.slug).toBe("noetherkin-architecture-notes");
    expect(part2.suggested[0]?.slug).toBe("noetherkin-architecture-notes");
  });

  it("returns empty navigation for an unknown slug", () => {
    expect(getPostNav("does-not-exist")).toEqual({
      suggested: [],
      previous: null,
      next: null,
      companion: null,
    });
  });

  it("renders mermaid figures across the two-part architecture notes", async () => {
    const part1 = getPostBySlug("noetherkin-architecture-notes");
    const part2 = getPostBySlug("noetherkin-architecture-notes-part-2");
    expect(part1).toBeDefined();
    expect(part2).toBeDefined();
    if (!part1 || !part2) return;

    expect(part1.content).toMatch(/```mermaid/);
    expect(part2.content).toMatch(/```mermaid/);

    const [html1, html2] = await Promise.all([
      renderMarkdown(part1.content),
      renderMarkdown(part2.content),
    ]);
    const figures = [
      ...(html1.match(/class="mermaid-figure"/g) ?? []),
      ...(html2.match(/class="mermaid-figure"/g) ?? []),
    ];
    expect(figures.length).toBeGreaterThan(5);
  });
});

describe("standalone posts", () => {
  it("keeps standalone posts out of the dynamic route's static params", () => {
    const standalone = getPosts().filter((p) => p.standalone);
    expect(standalone.map((p) => p.slug)).toContain("what-is-stormlog");
  });
});
