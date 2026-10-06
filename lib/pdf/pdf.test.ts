import { describe, expect, it } from "vitest";
import { getPosts } from "@/lib/writing";
import { htmlToMdast } from "./from-html";
import { renderStormlogPdf } from "./stormlog";
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

describe("component-authored articles", () => {
  it("turns interactive figures, code and callouts into printable nodes", () => {
    const tree = htmlToMdast(
      `<h2>Title<a aria-label="Link to this section: x" href="#x">#</a></h2>
       <figure><figcaption><span>Figure 1</span><span>Five states</span></figcaption><p class="sr-only">A bar split in five.</p><div><button>step</button></div><div>Illustrative.</div></figure>
       <figure class="code-block" data-lang="python"><div><span class="truncate">a.py</span><button>copy</button></div><div><pre><code><span class="line">x = 1</span>\n<span class="line">y = 2</span></code></pre></div></figure>
       <aside><p>Note</p><div><p>Careful.</p></div></aside>`,
    );
    const types = tree.children.map((n) => n.type);
    expect(types).toEqual(["heading", "diagramFigure", "code", "blockquote"]);
    const [h, fig, code] = tree.children as never[];
    expect(JSON.stringify(h)).not.toContain('"#"');
    expect(fig).toMatchObject({ label: "Figure 1", title: "Five states", description: "A bar split in five.", caption: "Illustrative." });
    expect(code).toMatchObject({ lang: "python", meta: "a.py", value: "x = 1\ny = 2" });
  });

  it("typesets the Stormlog explainer", async () => {
    const { getPostBySlug } = await import("@/lib/writing");
    const pdf = await renderStormlogPdf(getPostBySlug("what-is-stormlog")!);
    expect(pdf.subarray(0, 5).toString("latin1")).toBe("%PDF-");
    expect(pdf.length).toBeGreaterThan(50_000);
  }, 120_000);
});
