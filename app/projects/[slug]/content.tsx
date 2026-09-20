import { MarkdownBody } from "@/components/writing/markdown-body";
import { renderMarkdown } from "@/lib/markdown";

export async function ProjectContent({ content }: { content: string }) {
  const html = await renderMarkdown(content);
  return <MarkdownBody html={html} />;
}
