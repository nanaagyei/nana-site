import { describe, expect, it } from "vitest";
import { renderMarkdown } from "./markdown";
import { getPostBySlug, getPostNav, getPosts } from "./writing";

describe("writing posts", () => {
  it("publishes the noetherkin companion pair", () => {
    const slugs = getPosts().map((post) => post.slug);
    expect(slugs).toContain("noetherkin-architecture-notes");
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
  });

  it("returns empty navigation for an unknown slug", () => {
    expect(getPostNav("does-not-exist")).toEqual({
      suggested: [],
      previous: null,
      next: null,
      companion: null,
    });
  });

  it("renders mermaid figures from the architecture notes", async () => {
    const post = getPostBySlug("noetherkin-architecture-notes");
    expect(post).toBeDefined();
    if (!post) return;

    expect(post.content).toMatch(/```mermaid/);
    const html = await renderMarkdown(post.content);
    const figures = html.match(/class="mermaid-figure"/g) ?? [];
    expect(figures.length).toBeGreaterThan(5);
  });
});
