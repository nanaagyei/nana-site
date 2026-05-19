import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";
import { z } from "zod/v4";

const postSchema = z.object({
  slug: z.string(),
  title: z.string(),
  date: z.string(),
  excerpt: z.string(),
  published: z.boolean().default(true),
});

export type Post = z.infer<typeof postSchema> & {
  readingTime: string;
  content: string;
};

const CONTENT_DIR = path.join(process.cwd(), "content", "writing");

export function getPosts(): Post[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];

  const files = fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".mdx"));

  const posts = files
    .map((filename) => {
      const filePath = path.join(CONTENT_DIR, filename);
      const raw = fs.readFileSync(filePath, "utf-8");
      const { data, content } = matter(raw);

      const parsed = postSchema.safeParse(data);
      if (!parsed.success) {
        console.warn(`Invalid frontmatter in ${filename}:`, parsed.error);
        return null;
      }

      return {
        ...parsed.data,
        content,
        readingTime: readingTime(content).text,
      };
    })
    .filter((p): p is Post => p !== null)
    .filter((p) => p.published);

  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getPostBySlug(slug: string): Post | undefined {
  return getPosts().find((p) => p.slug === slug);
}
