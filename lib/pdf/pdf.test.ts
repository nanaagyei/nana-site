import { describe, expect, it } from "vitest";
import { getPosts } from "@/lib/writing";
import { breakUrl } from "./article-document";
import { renderArticlePdf } from "./index";
import { createContext, plainText, resolveHref } from "./render";
import { pdfText } from "./theme";

describe("pdfText", () => {
  it("keeps ordinary prose and typographic punctuation", () => {
    expect(pdfText("It’s “fine” — really…")).toBe("It’s “fine” — really...");
  });

  it("maps glyphs the text faces lack to plain equivalents", () => {
    expect(pdfText("a → b")).toBe("a -> b");
    expect(pdfText("├── src")).toBe("|-- src");
  });

  it("lets the code face keep arrows and box lines", () => {
    expect(pdfText("├── src → out", true)).toBe("├── src → out");
  });

  it("drops characters no embedded font can draw", () => {
    expect(pdfText("ok 🚀 done")).toBe("ok  done");
  });
});

describe("links on paper", () => {
  it("makes site-relative links absolute and leaves in-page anchors alone", () => {
    expect(resolveHref("/writing/x")).toMatch(/^https:\/\/.+\/writing\/x$/);
    expect(resolveHref("https://example.com/a")).toBe("https://example.com/a");
    expect(resolveHref("#section")).toBeNull();
  });

  it("folds long URLs so none overflows a line", () => {
    const url = `https://example.com/${"a-very-long-path-segment/".repeat(8)}end`;
    for (const line of breakUrl(url).split("\n")) expect(line.length).toBeLessThanOrEqual(92);
    expect(breakUrl(url).replaceAll("\n", "")).toBe(url);
  });

  it("reads plain text out of nested nodes", () => {
    expect(
      plainText({ children: [{ value: "a " }, { children: [{ value: "b" }] }] } as never),
    ).toBe("a b");
    expect(createContext("s", "t").links).toEqual([]);
  });
});

describe("article PDFs", () => {
  const posts = getPosts().filter((p) => !p.standalone);

  it("has articles to typeset", () => {
    expect(posts.length).toBeGreaterThan(0);
  });

  it.each(posts.map((p) => [p.slug, p] as const))(
    "typesets %s into a real, multi-object PDF",
    async (_slug, post) => {
      const pdf = await renderArticlePdf(post);
      const head = pdf.subarray(0, 5).toString("latin1");
      const tail = pdf.subarray(-16).toString("latin1");
      expect(head).toBe("%PDF-");
      expect(tail).toContain("%%EOF");
      expect(pdf.length).toBeGreaterThan(10_000);
    },
    120_000,
  );
});
