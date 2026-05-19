import { renderMarkdown } from "@/lib/markdown";

export async function ProjectContent({ content }: { content: string }) {
  const html = await renderMarkdown(content);

  return (
    <div
      className="prose-custom"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
