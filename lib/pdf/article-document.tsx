import { Document, Link, Page, Text, View } from "@react-pdf/renderer";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import type { Root } from "mdast";
import { SITE } from "@/lib/site";
import { formatDateFull } from "@/lib/utils";
import type { Post } from "@/lib/writing";
import { Fragment, type ReactNode } from "react";
import { bookmark, createContext, FootnoteList, plainText, prepare, renderBlock } from "./render";
import { COLOR, FONT, pdfText, registerPdfFonts, styles } from "./theme";

const parser = unified().use(remarkParse).use(remarkGfm);

/** Beyond this many sections a contents list earns its space. */
const TOC_THRESHOLD = 4;

/** US Letter in points. The footer is placed from the top because bottom-anchored fixed text breaks pagination in react-pdf. */
const PAGE_HEIGHT = 792;

export interface ArticleDocumentInput {
  post: Pick<Post, "slug" | "title" | "date" | "excerpt" | "readingTime" | "content">;
}

/**
 * Builds the typeset document: a research-note title block, numbered sections,
 * running header and footer, and every link gathered at the end so it survives printing.
 */
export async function buildArticleDocument({ post }: ArticleDocumentInput) {
  registerPdfFonts();

  const tree = parser.parse(post.content) as Root;
  const ctx = createContext(post.slug, post.title);
  await prepare(tree.children, ctx);

  const url = `${SITE.url}/writing/${post.slug}`;
  const shortUrl = url.replace(/^https?:\/\//, "");

  // Render the body first so section, footnote and link numbering is known for the front matter.
  const body: ReactNode[] = [];
  for (let i = 0; i < tree.children.length; i++) {
    const node = tree.children[i]!;
    const next = tree.children[i + 1];
    const rendered = renderBlock(node, ctx);
    // Keep a heading with the paragraph under it so one never dangles at the foot of a page.
    if (node.type === "heading" && next && next.type === "paragraph" && plainText(next).length < 900) {
      body.push(
        <View key={i} wrap={false}>
          {rendered}
          {renderBlock(next, ctx)}
        </View>,
      );
      i++;
    } else if (node.type === "heading") {
      body.push(<View key={i} wrap={false}>{rendered}</View>);
    } else {
      body.push(<Fragment key={i}>{rendered}</Fragment>);
    }
  }

  const footnotes = FootnoteList({ ctx });

  const showToc = ctx.sections.length >= TOC_THRESHOLD;

  return (
    <Document
      title={post.title}
      author={SITE.name}
      subject={post.excerpt}
      creator={SITE.url}
      producer="nana-site"
      language="en-US"
      keywords={`${SITE.name}, writing, ${post.slug}`}
    >
      <Page size="LETTER" style={styles.page} wrap>
        {/* Running header: quiet on the opening page, which carries its own masthead. */}
        <Text
          fixed
          style={{ ...styles.running, top: 34, left: 72, textAlign: "left", width: 330 }}
          render={({ pageNumber }) =>
            pageNumber === 1 ? " " : pdfText(post.title.length > 58 ? `${post.title.slice(0, 56)}...` : post.title)
          }
        />
        <Text
          fixed
          style={{ ...styles.running, top: 34, right: 72, textAlign: "right", width: 160 }}
          render={({ pageNumber }) => (pageNumber === 1 ? " " : SITE.name.toUpperCase())}
        />

        {/* Masthead */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginBottom: 30 }}>
          <Text style={{ fontFamily: FONT.serif, fontSize: 16, fontWeight: 600, color: COLOR.accent }}>{SITE.mark}</Text>
          <Text style={{ fontFamily: FONT.sans, fontSize: 7.5, letterSpacing: 1.6, color: COLOR.faded }}>
            NOTES & ESSAYS
          </Text>
        </View>
        <View style={{ height: 2.5, backgroundColor: COLOR.accent, width: 44, marginBottom: 16 }} />

        {/* Title block */}
        <Text
          {...bookmark(pdfText(post.title))}
          style={{ fontFamily: FONT.serif, fontSize: 27, fontWeight: 600, lineHeight: 1.15, color: COLOR.ink }}
        >
          {pdfText(post.title)}
        </Text>

        <View style={{ flexDirection: "row", marginTop: 14, marginBottom: 4 }}>
          <View style={{ width: 2, backgroundColor: COLOR.ochre, marginRight: 11 }} />
          <Text style={{ flex: 1, fontSize: 11.5, lineHeight: 1.55, fontStyle: "italic", color: COLOR.soft }}>
            {pdfText(post.excerpt)}
          </Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            marginTop: 16,
            marginBottom: 6,
            paddingVertical: 9,
            borderTopWidth: 0.6,
            borderBottomWidth: 0.6,
            borderColor: COLOR.rule,
            fontFamily: FONT.sans,
          }}
        >
          <Meta label="AUTHOR" value={SITE.name} />
          <Meta label="PUBLISHED" value={formatDateFull(post.date)} />
          <Meta label="READING TIME" value={post.readingTime.replace(" read", "")} />
        </View>

        {showToc ? (
          <View style={{ marginTop: 14, marginBottom: 6 }}>
            <Text style={{ fontFamily: FONT.sans, fontSize: 7.5, letterSpacing: 1.6, color: COLOR.accent, fontWeight: 600, marginBottom: 7 }}>
              IN THIS PIECE
            </Text>
            {ctx.sections.map((s) => (
              <Link key={s.id} src={`#${s.id}`} style={{ textDecoration: "none", color: COLOR.ink }}>
                <View style={{ flexDirection: "row", marginBottom: 2.5 }} wrap={false}>
                  <Text style={{ width: 24, fontFamily: FONT.mono, fontSize: 7.5, color: COLOR.accent, lineHeight: 1.7 }}>
                    {s.number}
                  </Text>
                  <Text style={{ flex: 1, fontSize: 9.5, lineHeight: 1.45 }}>{s.title}</Text>
                </View>
              </Link>
            ))}
          </View>
        ) : null}

        <View style={{ height: 0.6, backgroundColor: COLOR.rule, marginTop: 8, marginBottom: 6 }} />

        {body}

        {footnotes}

        {/* Closing */}
        <View wrap={false} style={{ marginTop: 26 }}>
          <Text style={{ textAlign: "center", color: COLOR.accent, letterSpacing: 6, fontSize: 11 }}>• • •</Text>
          <Text style={{ textAlign: "center", fontSize: 10.5, fontStyle: "italic", color: COLOR.soft, marginTop: 8 }}>
            That’s the piece. If it earned a margin note, I’d love to hear it.
          </Text>
          <Text style={{ textAlign: "center", fontFamily: FONT.sans, fontSize: 8, color: COLOR.faded, marginTop: 3 }}>
            {SITE.email}
          </Text>
        </View>

        {ctx.links.length > 0 ? (
          <View style={{ marginTop: 24 }}>
            <Text
             
              {...bookmark("Links")}
              style={{ fontFamily: FONT.sans, fontSize: 7.5, letterSpacing: 1.6, color: COLOR.accent, fontWeight: 600, marginBottom: 7 }}
            >
              LINKS, FOR WHEN YOU’RE READING ON PAPER
            </Text>
            {ctx.links.map((href, i) => (
              <View key={href} wrap={false} style={{ flexDirection: "row", marginBottom: 2.5 }}>
                <Text style={{ width: 24, fontFamily: FONT.sans, fontSize: 7.5, color: COLOR.accent, lineHeight: 1.6 }}>{`[${i + 1}]`}</Text>
                <Link src={href} style={{ flex: 1, fontFamily: FONT.mono, fontSize: 7, lineHeight: 1.6, color: COLOR.soft, textDecoration: "none" }}>
                  {breakUrl(href)}
                </Link>
              </View>
            ))}
          </View>
        ) : null}

        <Text
          style={{ marginTop: 22, fontFamily: FONT.sans, fontSize: 6.8, lineHeight: 1.5, color: COLOR.faded }}
        >
          Typeset from the live article at {shortUrl}. The web version may be newer and carries the interactive parts.
        </Text>

        {/* Running footer */}
        <Text fixed style={{ ...styles.running, top: PAGE_HEIGHT - 46, left: 72, width: 330, textAlign: "left" }}>
          {shortUrl}
        </Text>
        <Text
          fixed
          style={{ ...styles.running, top: PAGE_HEIGHT - 46, right: 72, width: 100, textAlign: "right" }}
          render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
        />
      </Page>
    </Document>
  );
}

/** Long URLs have no spaces to wrap on, so fold them at path boundaries to stay inside the margin. */
export function breakUrl(url: string, width = 92): string {
  const lines: string[] = [];
  let rest = url;
  while (rest.length > width) {
    const window = rest.slice(0, width);
    const cut = Math.max(window.lastIndexOf("/"), window.lastIndexOf("&"), window.lastIndexOf("?"), window.lastIndexOf("-"));
    const at = cut > width / 2 ? cut + 1 : width;
    lines.push(rest.slice(0, at));
    rest = rest.slice(at);
  }
  lines.push(rest);
  return lines.join("\n");
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ marginRight: 26, marginVertical: 2 }}>
      <Text style={{ fontSize: 6.5, letterSpacing: 1.3, color: COLOR.faded, fontWeight: 600 }}>{label}</Text>
      <Text style={{ fontSize: 9, color: COLOR.ink, marginTop: 1 }}>{value}</Text>
    </View>
  );
}
