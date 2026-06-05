import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeStringify from "rehype-stringify";

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypePrettyCode, {
    theme: {
      light: "github-light",
      dark: "github-dark-dimmed",
    },
    keepBackground: false,
  })
  .use(rehypeStringify);

export async function renderMarkdown(content: string): Promise<string> {
  const result = await processor.process(content);
  return String(result);
}
