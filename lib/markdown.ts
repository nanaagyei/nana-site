import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeStringify from "rehype-stringify";
import { remarkMermaid } from "@/lib/remark-mermaid";

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkMermaid)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypePrettyCode, {
    theme: {
      light: "github-light",
      dark: "github-dark-dimmed",
    },
    keepBackground: false,
  })
  .use(rehypeStringify, { allowDangerousHtml: true });

export async function renderMarkdown(content: string): Promise<string> {
  const result = await processor.process(content);
  return String(result);
}
