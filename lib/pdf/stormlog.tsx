import type { ReactNode } from "react";
import { prerender } from "react-dom/static";
import { renderToBuffer } from "@react-pdf/renderer";
import { SectionsCore } from "@/components/stormlog-article/sections-core";
import { SectionsDeep } from "@/components/stormlog-article/sections-deep";
import { SectionsIntro } from "@/components/stormlog-article/sections-intro";
import { ARTICLE_SUBTITLE, ARTICLE_TITLE } from "@/components/stormlog-article/stormlog-article";
import type { Post } from "@/lib/writing";
import { buildArticleDocument } from "./article-document";
import { htmlToMdast } from "./from-html";
import { whilePrinting } from "./print-mode";

async function toHtml(node: ReactNode): Promise<string> {
  const { prelude } = await prerender(node);
  const reader = prelude.getReader();
  const decoder = new TextDecoder();
  let html = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    html += decoder.decode(value, { stream: true });
  }
  return html;
}

/**
 * This article's text lives in components, not markdown. Render those same components to HTML,
 * then hand the result to the shared PDF pipeline so the page and the PDF can't drift apart.
 */
export async function renderStormlogPdf(post: Post): Promise<Buffer> {
  const html = await whilePrinting(() =>
    toHtml(
      <>
        <SectionsIntro />
        <SectionsCore />
        <SectionsDeep />
      </>,
    ),
  );

  return renderToBuffer(
    await buildArticleDocument({
      post: { ...post, title: ARTICLE_TITLE, excerpt: ARTICLE_SUBTITLE },
      tree: htmlToMdast(html),
      meta: [{ label: "COVERS", value: "Stormlog v0.4.0" }],
    }),
  );
}
