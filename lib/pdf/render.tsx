import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import { Fragment, type ReactNode } from "react";
import { Image, Link, Text, View } from "@react-pdf/renderer";
import type {
  Blockquote,
  Code,
  Heading,
  List,
  ListItem,
  Paragraph,
  PhrasingContent,
  RootContent,
  Table,
} from "mdast";
import { diagramLabel } from "@/lib/remark-mermaid";
import type { DiagramFigure } from "./from-html";
import { SITE } from "@/lib/site";
import { highlightForPrint, type CodeToken } from "./highlight";
import { COLOR, FONT, pdfText } from "./theme";

/** Mutable bookkeeping that the render pass fills in document order. */
export interface RenderContext {
  /** Slug of the article being rendered, for resolving relative links. */
  slug: string;
  links: string[];
  sections: { id: string; title: string; number: string }[];
  footnotes: string[];
  footnoteBodies: Map<string, RootContent[]>;
  highlighted: Map<Code, CodeToken[][]>;
  /** Figures resized and recompressed for print, keyed by the html node that references them. */
  images: Map<string, Buffer>;
  /** The article title, so a leading `# Title` in the body isn't printed twice. */
  title: string;
  seenFirstBlock: boolean;
  keyCounter: number;
}

export function createContext(slug: string, title: string): RenderContext {
  return {
    slug,
    title,
    links: [],
    sections: [],
    footnotes: [],
    footnoteBodies: new Map(),
    highlighted: new Map(),
    images: new Map(),
    seenFirstBlock: false,
    keyCounter: 0,
  };
}

const nextKey = (ctx: RenderContext) => `n${ctx.keyCounter++}`;

/** The renderer supports PDF outline entries, but its published prop types lag behind. */
export function bookmark(title: string): Record<string, unknown> {
  return { bookmark: { title, fontSize: 12 } };
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Plain text of a node, for headings, bookmarks and captions. */
export function plainText(node: { children?: unknown[]; value?: string }): string {
  if (typeof node.value === "string") return node.value;
  return (node.children ?? [])
    .map((c) => plainText(c as { children?: unknown[]; value?: string }))
    .join("");
}

/** Resolves a markdown href into something that works on paper: absolute, or null for in-page anchors. */
export function resolveHref(href: string): string | null {
  if (!href || href.startsWith("#")) return null;
  if (/^(https?:|mailto:)/i.test(href)) return href;
  if (href.startsWith("/")) return `${SITE.url}${href}`;
  return null;
}

function linkNumber(ctx: RenderContext, url: string): number {
  const found = ctx.links.indexOf(url);
  if (found !== -1) return found + 1;
  ctx.links.push(url);
  return ctx.links.length;
}

function stripTags(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

/* ───────────────────────── inline ───────────────────────── */

function inline(nodes: PhrasingContent[], ctx: RenderContext): ReactNode[] {
  return nodes.flatMap((node): ReactNode[] => {
    switch (node.type) {
      case "text":
        return [pdfText(node.value.replace(/\s*\n\s*/g, " "))];
      case "emphasis":
        return [
          <Text key={nextKey(ctx)} style={{ fontStyle: "italic" }}>
            {inline(node.children, ctx)}
          </Text>,
        ];
      case "strong":
        return [
          <Text key={nextKey(ctx)} style={{ fontWeight: 600 }}>
            {inline(node.children, ctx)}
          </Text>,
        ];
      case "delete":
        return [
          <Text key={nextKey(ctx)} style={{ textDecoration: "line-through", color: COLOR.faded }}>
            {inline(node.children, ctx)}
          </Text>,
        ];
      case "inlineCode":
        return [
          <Text
            key={nextKey(ctx)}
            style={{
              fontFamily: FONT.mono,
              fontSize: 8.8,
              backgroundColor: COLOR.wash,
              color: COLOR.soft,
            }}
          >
            {pdfText(node.value, true)}
          </Text>,
        ];
      case "break":
        return ["\n"];
      case "link": {
        const url = resolveHref(node.url);
        if (!url) return inline(node.children, ctx);
        const n = linkNumber(ctx, url);
        return [
          <Link key={nextKey(ctx)} src={url} style={{ color: COLOR.accent, textDecoration: "underline" }}>
            {inline(node.children, ctx)}
          </Link>,
          <Text
            key={nextKey(ctx)}
            style={{ fontFamily: FONT.sans, fontSize: 6.5, color: COLOR.accent }}
          >
            {`[${n}]`}
          </Text>,
        ];
      }
      case "footnoteReference": {
        let idx = ctx.footnotes.indexOf(node.identifier);
        if (idx === -1) {
          ctx.footnotes.push(node.identifier);
          idx = ctx.footnotes.length - 1;
        }
        return [
          <Text key={nextKey(ctx)} style={{ fontFamily: FONT.sans, fontSize: 7, color: COLOR.ochre, fontWeight: 600 }}>
            {`(${idx + 1})`}
          </Text>,
        ];
      }
      case "html": {
        const text = stripTags(node.value);
        return text ? [pdfText(text)] : [];
      }
      case "image":
        return node.alt ? [pdfText(node.alt)] : [];
      default:
        return "children" in node ? inline(node.children as PhrasingContent[], ctx) : [];
    }
  });
}

/* ───────────────────────── blocks ───────────────────────── */

const block = {
  paragraph: { marginBottom: 9 },
  h2: {
    fontFamily: FONT.serif,
    fontSize: 17,
    fontWeight: 600,
    lineHeight: 1.25,
    color: COLOR.ink,
    marginTop: 22,
    marginBottom: 8,
  },
  h3: {
    fontFamily: FONT.serif,
    fontSize: 13,
    fontWeight: 600,
    lineHeight: 1.3,
    color: COLOR.ink,
    marginTop: 14,
    marginBottom: 5,
  },
  h4: {
    fontFamily: FONT.sans,
    fontSize: 8.5,
    fontWeight: 600,
    letterSpacing: 1,
    textTransform: "uppercase" as const,
    color: COLOR.accent,
    marginTop: 12,
    marginBottom: 4,
  },
};

function heading(node: Heading, ctx: RenderContext) {
  // Authors number their own headings ("1. Architecture"); sections are numbered here instead.
  const text = pdfText(plainText(node)).replace(/^\d+[.)]\s+/, "");

  // The body often opens with its own `# Title`; the title block already carries it.
  if (node.depth === 1 && !ctx.seenFirstBlock) return null;

  if (node.depth <= 2) {
    const n = String(ctx.sections.length + 1).padStart(2, "0");
    const id = `s-${ctx.sections.length + 1}`;
    ctx.sections.push({ id, title: text, number: n });
    return (
      <View id={id} style={{ marginTop: 22, marginBottom: 8 }}>
        <Text
          {...bookmark(`${n}  ${text}`)}
          style={{ fontFamily: FONT.mono, fontSize: 7.5, letterSpacing: 0.3, color: COLOR.accent, lineHeight: 1 }}
        >
          {n}
        </Text>
        <Text style={{ ...block.h2, marginTop: 4, marginBottom: 0 }}>{text}</Text>
        <View style={{ marginTop: 7, height: 0.6, backgroundColor: COLOR.rule }} />
      </View>
    );
  }
  return (
    <Text style={node.depth === 3 ? block.h3 : block.h4}>
      {node.depth === 3 ? text : text.toUpperCase()}
    </Text>
  );
}

function codeBlock(node: Code, ctx: RenderContext) {
  if (node.lang === "mermaid") {
    const label = diagramLabel(node.value);
    const url = `${SITE.url}/writing/${ctx.slug}`;
    const n = linkNumber(ctx, url);
    return (
      <View
        wrap={false}
        style={{
          marginTop: 4,
          marginBottom: 12,
          paddingVertical: 10,
          paddingHorizontal: 12,
          borderWidth: 0.7,
          borderColor: COLOR.rule,
          borderStyle: "dashed",
          backgroundColor: COLOR.wash,
        }}
      >
        <Text style={{ fontFamily: FONT.sans, fontSize: 7, letterSpacing: 1, color: COLOR.accent, fontWeight: 600 }}>
          DIAGRAM
        </Text>
        <Text style={{ fontFamily: FONT.serif, fontSize: 10.5, fontStyle: "italic", marginTop: 2 }}>
          {pdfText(label)}
        </Text>
        <Text style={{ fontFamily: FONT.sans, fontSize: 8, color: COLOR.faded, marginTop: 3, lineHeight: 1.4 }}>
          This one is interactive on the web and doesn’t survive the trip to paper. See it live at [{n}].
        </Text>
      </View>
    );
  }

  const lines: CodeToken[][] = ctx.highlighted.get(node) ?? node.value.split("\n").map((l) => [{ text: l }]);
  return (
    <View
      // Short snippets stay in one piece; long listings are allowed to flow across pages.
      wrap={lines.length > 22}
      style={{
        marginTop: 3,
        marginBottom: 12,
        paddingVertical: 8,
        paddingHorizontal: 11,
        backgroundColor: COLOR.wash,
        borderLeftWidth: 2,
        borderLeftColor: COLOR.accent,
      }}
    >
      {node.meta ? (
        <Text style={{ fontFamily: FONT.mono, fontSize: 7, color: COLOR.faded, marginBottom: 4 }}>{pdfText(node.meta, true)}</Text>
      ) : node.lang ? (
        <Text style={{ fontFamily: FONT.sans, fontSize: 6.5, letterSpacing: 1, color: COLOR.faded, marginBottom: 4 }}>
          {node.lang.toUpperCase()}
        </Text>
      ) : null}
      {lines.map((line, i) => (
        <Text key={i} style={{ fontFamily: FONT.mono, fontSize: 8, lineHeight: 1.5, color: COLOR.soft }}>
          {line.length === 0 || (line.length === 1 && line[0]?.text === "")
            ? " "
            : line.map((t, j) => (
                <Text
                  key={j}
                  style={{
                    color: t.color ?? COLOR.soft,
                    fontWeight: t.bold ? 600 : 400,
                    fontStyle: t.italic ? "italic" : "normal",
                  }}
                >
                  {pdfText(t.text, true)}
                </Text>
              ))}
        </Text>
      ))}
    </View>
  );
}

function listBlock(node: List, ctx: RenderContext, depth = 0): ReactNode {
  const start = node.start ?? 1;
  return (
    <View style={{ marginBottom: depth === 0 ? 9 : 2, marginTop: depth === 0 ? 0 : 2 }}>
      {node.children.map((item, i) => (
        <Fragment key={i}>{listEntry(item, node.ordered ? `${start + i}.` : depth === 0 ? "•" : "–", ctx, depth)}</Fragment>
      ))}
    </View>
  );
}

function listEntry(item: ListItem, marker: string, ctx: RenderContext, depth: number): ReactNode {
  const check = item.checked === true ? "[x] " : item.checked === false ? "[ ] " : "";
  return (
    <View wrap={false} style={{ flexDirection: "row", marginBottom: 3 }}>
      <Text
        style={{
          width: 18,
          color: COLOR.accent,
          fontFamily: marker.length > 1 && marker !== "–" ? FONT.mono : FONT.serif,
          fontSize: marker.length > 1 && marker !== "–" ? 8.5 : 10.5,
        }}
      >
        {marker}
      </Text>
      <View style={{ flex: 1 }}>
        {item.children.map((child, i) => {
          if (child.type === "paragraph") {
            return (
              <Text key={i} style={{ marginBottom: 2 }}>
                {i === 0 && check ? <Text style={{ fontFamily: FONT.mono, fontSize: 8.5 }}>{check}</Text> : null}
                {inline(child.children, ctx)}
              </Text>
            );
          }
          if (child.type === "list") return <Fragment key={i}>{listBlock(child, ctx, depth + 1)}</Fragment>;
          return <Fragment key={i}>{renderBlock(child, ctx)}</Fragment>;
        })}
      </View>
    </View>
  );
}

function quoteBlock(node: Blockquote, ctx: RenderContext) {
  return (
    <View
      style={{
        marginBottom: 11,
        paddingLeft: 12,
        paddingVertical: 2,
        borderLeftWidth: 2.2,
        borderLeftColor: COLOR.ochre,
      }}
    >
      {node.children.map((child, i) => (
        <View key={i} style={{ fontStyle: "italic", color: COLOR.soft }}>
          {renderBlock(child, ctx)}
        </View>
      ))}
    </View>
  );
}

function tableBlock(node: Table, ctx: RenderContext) {
  const rows = node.children;
  const cols = Math.max(...rows.map((r) => r.children.length), 1);
  // Weight columns by their longest cell so short labels don't hog space.
  const weights = Array.from({ length: cols }, (_, c) =>
    Math.min(
      Math.max(...rows.map((r) => plainText(r.children[c] ?? { value: "" }).length), 4),
      60,
    ),
  );
  const total = weights.reduce((a, b) => a + Math.sqrt(b), 0);

  return (
    <View style={{ marginTop: 3, marginBottom: 12, borderTopWidth: 1, borderTopColor: COLOR.ink, borderBottomWidth: 1, borderBottomColor: COLOR.ink }}>
      {rows.map((row, r) => (
        <View
          key={r}
          wrap={false}
          style={{
            flexDirection: "row",
            backgroundColor: r === 0 ? COLOR.wash : undefined,
            borderTopWidth: r === 0 ? 0 : 0.5,
            borderTopColor: COLOR.rule,
            ...(r === 0 ? { borderBottomWidth: 0.8, borderBottomColor: COLOR.ink } : {}),
          }}
        >
          {Array.from({ length: cols }, (_, c) => {
            const cell = row.children[c];
            return (
              <View key={c} style={{ width: `${((Math.sqrt(weights[c] ?? 4) / total) * 100).toFixed(2)}%`, paddingVertical: 5, paddingHorizontal: 6 }}>
                <Text
                  style={{
                    fontFamily: r === 0 ? FONT.sans : FONT.serif,
                    fontWeight: r === 0 ? 600 : 400,
                    fontSize: r === 0 ? 8 : 9,
                    lineHeight: 1.4,
                    textAlign: node.align?.[c] === "right" ? "right" : node.align?.[c] === "center" ? "center" : "left",
                  }}
                >
                  {cell ? inline(cell.children, ctx) : ""}
                </Text>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

/** An interactive diagram on the page; on paper, its description carries the information. */
function diagramFigure(node: DiagramFigure, ctx: RenderContext) {
  const url = `${SITE.url}/writing/${ctx.slug}`;
  const n = linkNumber(ctx, url);
  return (
    <View
      wrap={false}
      style={{
        marginTop: 4,
        marginBottom: 13,
        paddingVertical: 10,
        paddingHorizontal: 13,
        borderWidth: 0.7,
        borderColor: COLOR.rule,
        borderTopWidth: 2,
        borderTopColor: COLOR.accent,
        backgroundColor: COLOR.wash,
      }}
    >
      <Text style={{ fontFamily: FONT.sans, fontSize: 7, letterSpacing: 1.2, color: COLOR.accent, fontWeight: 600 }}>
        {pdfText(node.label.toUpperCase())}
      </Text>
      <Text style={{ fontFamily: FONT.serif, fontSize: 12, fontWeight: 600, lineHeight: 1.3, marginTop: 2 }}>
        {pdfText(node.title)}
      </Text>
      <Text style={{ fontSize: 9.5, lineHeight: 1.55, color: COLOR.soft, marginTop: 5 }}>{pdfText(node.description)}</Text>
      {node.caption ? (
        <Text style={{ fontFamily: FONT.sans, fontSize: 8, lineHeight: 1.45, fontStyle: "italic", color: COLOR.faded, marginTop: 5 }}>
          {pdfText(node.caption)}
        </Text>
      ) : null}
      <Text style={{ fontFamily: FONT.sans, fontSize: 7.5, color: COLOR.faded, marginTop: 6 }}>
        Drawn as an interactive diagram on the web: see it live at [{n}].
      </Text>
    </View>
  );
}

/** `<figure><img/><figcaption/></figure>` blocks authored as raw HTML in the MDX. */
function figureBlock(html: string, ctx: RenderContext) {
  const src = /<img[^>]*\ssrc="([^"]+)"/i.exec(html)?.[1];
  const alt = /<img[^>]*\salt="([^"]*)"/i.exec(html)?.[1];
  const caption = /<figcaption[^>]*>([\s\S]*?)<\/figcaption>/i.exec(html)?.[1];
  if (!src || !src.startsWith("/")) return null;

  const data = ctx.images.get(src);
  if (!data) return null;
  return (
    <View wrap={false} style={{ marginTop: 4, marginBottom: 13 }}>
      {/* react-pdf Image has no alt prop; the caption below carries the description. */}
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      <Image src={{ data, format: "jpg" }} style={{ width: "100%", borderWidth: 0.5, borderColor: COLOR.rule }} />
      {caption || alt ? (
        <Text style={{ fontFamily: FONT.sans, fontSize: 8, color: COLOR.faded, marginTop: 5, lineHeight: 1.4 }}>
          <Text style={{ fontWeight: 600, color: COLOR.accent }}>Figure. </Text>
          {pdfText(stripTags(caption ?? alt ?? ""))}
        </Text>
      ) : null}
    </View>
  );
}

/** Renders one block eagerly, so numbering of sections, links and notes follows document order. */
export function renderBlock(node: RootContent, ctx: RenderContext): ReactNode {
  const out = renderBlockInner(node, ctx);
  if (out !== null && node.type !== "definition" && node.type !== "footnoteDefinition") {
    ctx.seenFirstBlock = true;
  }
  return out;
}

function renderBlockInner(node: RootContent, ctx: RenderContext): ReactNode {
  switch (node.type) {
    case "heading":
      return heading(node, ctx);
    case "paragraph":
      return <Text widows={1} orphans={1} style={block.paragraph}>{inline((node as Paragraph).children, ctx)}</Text>;
    case "list":
      return listBlock(node, ctx);
    case "blockquote":
      return quoteBlock(node, ctx);
    case "code":
      return codeBlock(node, ctx);
    case "table":
      return tableBlock(node, ctx);
    case "thematicBreak":
      return (
        <Text style={{ textAlign: "center", color: COLOR.accent, letterSpacing: 6, marginVertical: 10, fontSize: 11 }}>
          • • •
        </Text>
      );
    case "html": {
      if (/<figure/i.test(node.value)) return figureBlock(node.value, ctx);
      const text = stripTags(node.value);
      return text ? <Text style={block.paragraph}>{pdfText(text)}</Text> : null;
    }
    case "diagramFigure":
      return diagramFigure(node, ctx);
    case "definition":
    case "footnoteDefinition":
    case "yaml":
      return null;
    default:
      return null;
  }
}

/** Print doesn't need screen-resolution PNGs; 1100px wide JPEG keeps a figure crisp at column width. */
async function loadFigure(src: string, ctx: RenderContext) {
  const file = path.join(process.cwd(), "public", src);
  try {
    const raw = await fs.readFile(file);
    const data = await sharp(raw)
      .resize({ width: 1100, withoutEnlargement: true })
      .flatten({ background: "#ffffff" })
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer();
    ctx.images.set(src, data);
  } catch {
    // A missing image shouldn't sink the whole document; the figure is simply omitted.
  }
}

/** Pre-computes syntax tokens, since shiki is async and the render pass isn't. */
export async function prepare(nodes: RootContent[], ctx: RenderContext): Promise<void> {
  const jobs: Promise<void>[] = [];
  const walk = (list: RootContent[]) => {
    for (const n of list) {
      if (n.type === "code" && n.lang !== "mermaid") {
        jobs.push(highlightForPrint(n.value, n.lang).then((t) => void ctx.highlighted.set(n, t)));
      } else if (n.type === "html" && /<figure/i.test(n.value)) {
        const src = /<img[^>]*\ssrc="([^"]+)"/i.exec(n.value)?.[1];
        if (src?.startsWith("/") && !ctx.images.has(src)) jobs.push(loadFigure(src, ctx));
      } else if (n.type === "footnoteDefinition") {
        ctx.footnoteBodies.set(n.identifier, n.children);
      }
      if ("children" in n && Array.isArray(n.children)) walk(n.children as RootContent[]);
    }
  };
  walk(nodes);
  await Promise.all(jobs);
}

export function FootnoteList({ ctx }: { ctx: RenderContext }) {
  if (ctx.footnotes.length === 0) return null;
  return (
    <View style={{ marginTop: 6 }}>
      <Text style={{ ...block.h4, marginTop: 14 }}>NOTES</Text>
      {ctx.footnotes.map((id, i) => {
        const body = ctx.footnoteBodies.get(id) ?? [];
        const text = body.map((b) => ("children" in b ? inline(b.children as PhrasingContent[], ctx) : [])).flat();
        return (
          <View key={id} style={{ flexDirection: "row", marginBottom: 3 }} wrap={false}>
            <Text style={{ width: 22, fontFamily: FONT.sans, fontSize: 7.5, color: COLOR.ochre, fontWeight: 600 }}>{`(${i + 1})`}</Text>
            <Text style={{ flex: 1, fontSize: 8.5, lineHeight: 1.45, color: COLOR.soft }}>{text}</Text>
          </View>
        );
      })}
    </View>
  );
}
