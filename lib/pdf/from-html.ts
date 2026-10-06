import type { Element, ElementContent, Root as HastRoot } from "hast";
import { toMdast } from "hast-util-to-mdast";
import { toString } from "hast-util-to-string";
import type { Root as MdastRoot, RootContent } from "mdast";
import rehypeParse from "rehype-parse";
import { unified } from "unified";
import { visit } from "unist-util-visit";

/** A diagram the page draws interactively. On paper it becomes its title, description and caption. */
export interface DiagramFigure {
  type: "diagramFigure";
  label: string;
  title: string;
  description: string;
  caption: string;
}

declare module "mdast" {
  interface RootContentMap {
    diagramFigure: DiagramFigure;
  }
}

const parser = unified().use(rehypeParse, { fragment: true });

const classes = (el: Element): string[] => {
  const c = el.properties?.className;
  return Array.isArray(c) ? c.map(String) : [];
};
const hasClass = (el: Element, name: string) => classes(el).includes(name);
const isEl = (n: unknown, tag?: string): n is Element =>
  !!n && (n as Element).type === "element" && (!tag || (n as Element).tagName === tag);

const el = (tagName: string, children: ElementContent[], properties: Element["properties"] = {}): Element => ({
  type: "element",
  tagName,
  properties,
  children,
});
const text = (value: string): ElementContent => ({ type: "text", value });

/** Text with block boundaries kept as spaces, for one-line captions and descriptions. */
const flat = (n: Element) => toString(n).replace(/\s+/g, " ").trim();

function findAll(root: Element | HastRoot, test: (e: Element) => boolean): Element[] {
  const found: Element[] = [];
  visit(root, "element", (e: Element) => {
    if (test(e)) found.push(e);
  });
  return found;
}

/**
 * Rewrites the article's custom markup into plain HTML that maps cleanly onto markdown:
 * interactive diagrams become figures, code blocks lose their chrome, callouts become quotes.
 */
function simplify(tree: HastRoot) {
  // Diagrams first: they contain buttons and svg that the removal pass below would otherwise mangle.
  visit(tree, "element", (node: Element, index, parent) => {
    if (!parent || index === undefined) return;

    if (node.tagName === "figure" && hasClass(node, "code-block")) {
      const lines = findAll(node, (e) => e.tagName === "span" && hasClass(e, "line")).map((l) => toString(l));
      const cap = node.children.find((c): c is Element => isEl(c, "figcaption"));
      const label = node.children
        .filter((c): c is Element => isEl(c, "div"))
        .flatMap((d) => d.children.filter((c): c is Element => isEl(c, "span") && hasClass(c, "truncate")))[0];
      const code = el("code", [text(lines.join("\n"))], {
        className: [`language-${String(node.properties?.dataLang ?? "text")}`],
      });
      const out: ElementContent[] = [el("pre", [code], { dataLabel: label ? flat(label) : "" })];
      if (cap) out.push(el("p", [el("em", [text(flat(cap))])]));
      parent.children.splice(index, 1, ...out);
      return index + out.length;
    }

    if (node.tagName === "figure") {
      const desc = node.children.find((c): c is Element => isEl(c, "p") && hasClass(c, "sr-only"));
      const head = node.children.find((c): c is Element => isEl(c, "figcaption"));
      if (desc && head) {
        const spans = head.children.filter((c): c is Element => isEl(c, "span")).map(flat);
        const last = node.children[node.children.length - 1];
        const caption = isEl(last, "div") && last !== desc && !hasClass(last, "p-4") ? flat(last) : "";
        parent.children.splice(
          index,
          1,
          el("diagram-figure", [], {
            dataLabel: spans[0] ?? "Figure",
            dataTitle: spans[1] ?? "",
            // The page pairs some figures with a data table that the PDF leaves out.
            dataDescription: flat(desc).replace(/\s*(?:A|The) table (?:below|follows)[^.]*\./gi, ""),
            dataCaption: caption,
          }),
        );
        return index + 1;
      }
    }
  });

  // Callouts become block quotes whose first line is the label.
  visit(tree, "element", (node: Element) => {
    if (node.tagName !== "aside") return;
    node.tagName = "blockquote";
    const first = node.children.find((c): c is Element => isEl(c, "p"));
    if (first) first.children = [el("strong", first.children)];
  });

  // Definition lists become bullet lists with the term in bold.
  visit(tree, "element", (node: Element) => {
    if (node.tagName !== "dl") return;
    const items: ElementContent[] = [];
    for (const group of findAll(node, (e) => e.tagName === "div" && e.children.some((c) => isEl(c, "dt")))) {
      const dt = group.children.find((c): c is Element => isEl(c, "dt"));
      const dd = group.children.find((c): c is Element => isEl(c, "dd"));
      if (!dt || !dd) continue;
      items.push(el("li", [el("p", [el("strong", [text(flat(dt))]), text(". "), ...dd.children])]));
    }
    node.tagName = "ul";
    node.children = items;
  });

  // <details> opens fully on paper; its summary becomes a small heading.
  visit(tree, "element", (node: Element) => {
    if (node.tagName !== "details") return;
    node.tagName = "div";
    const summary = node.children.find((c): c is Element => isEl(c, "summary"));
    if (summary) {
      const title = findAll(summary, (e) => e.tagName === "span" && !hasClass(e, "font-mono")).map(flat)[0] ?? flat(summary);
      node.children = [el("h4", [text(title)]), ...node.children.filter((c) => c !== summary)];
    }
  });

  // Chrome that means nothing on paper.
  visit(tree, "element", (node: Element, index, parent) => {
    if (!parent || index === undefined) return;
    const drop =
      ["svg", "button", "nav", "script", "style", "summary", "caption"].includes(node.tagName) ||
      String(node.properties?.ariaHidden) === "true" ||
      (node.tagName === "a" && String(node.properties?.ariaLabel ?? "").startsWith("Link to this section")) ||
      hasClass(node, "sr-only");
    if (drop) {
      parent.children.splice(index, 1);
      return index;
    }
  });
}

/** Converts server-rendered article HTML into markdown nodes the PDF renderer already understands. */
export function htmlToMdast(html: string): MdastRoot {
  const tree = parser.parse(html) as HastRoot;
  simplify(tree);

  const mdast = toMdast(tree, {
    handlers: {
      "diagram-figure": (_state, node) => {
        const p = node.properties as Record<string, string>;
        return {
          type: "diagramFigure",
          label: p.dataLabel ?? "",
          title: p.dataTitle ?? "",
          description: p.dataDescription ?? "",
          caption: p.dataCaption ?? "",
        } as unknown as RootContent;
      },
      pre: (_state, node) => {
        const code = node.children.find((c): c is Element => isEl(c, "code"));
        const lang = classes(code ?? node).find((c) => c.startsWith("language-"))?.slice(9);
        const label = String(node.properties?.dataLabel ?? "") || null;
        return {
          type: "code",
          lang: lang && lang !== "text" ? lang : null,
          meta: label,
          value: toString(node).replace(/\n$/, ""),
        };
      },
    },
  });

  return mdast as MdastRoot;
}
