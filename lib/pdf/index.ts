import { renderToBuffer } from "@react-pdf/renderer";
import type { Post } from "@/lib/writing";
import { buildArticleDocument } from "./article-document";

export async function renderArticlePdf(post: Post): Promise<Buffer> {
  return renderToBuffer(await buildArticleDocument({ post }));
}
