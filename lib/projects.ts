import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";
import { z } from "zod/v4";

const projectSchema = z.object({
  slug: z.string(),
  title: z.string(),
  subtitle: z.string(),
  year: z.number(),
  status: z.enum(["active", "shipped", "archived"]),
  role: z.string(),
  collaborators: z.array(z.string()).optional(),
  stack: z.array(z.string()),
  links: z
    .object({
      github: z.string().optional(),
      pypi: z.string().optional(),
      site: z.string().optional(),
      npm: z.string().optional(),
    })
    .optional(),
  cover: z.string().optional(),
  featured: z.boolean().default(false),
  order: z.number().default(99),
});

export type Project = z.infer<typeof projectSchema> & {
  readingTime: string;
  content: string;
};

const CONTENT_DIR = path.join(process.cwd(), "content", "projects");

export function getProjects(): Project[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];

  const files = fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".mdx"));

  const projects = files
    .map((filename) => {
      const filePath = path.join(CONTENT_DIR, filename);
      const raw = fs.readFileSync(filePath, "utf-8");
      const { data, content } = matter(raw);

      const parsed = projectSchema.safeParse(data);
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
    .filter((p): p is Project => p !== null);

  return projects.sort((a, b) => a.order - b.order);
}

export function getFeaturedProjects(): Project[] {
  return getProjects().filter((p) => p.featured);
}

export function getProjectBySlug(slug: string): Project | undefined {
  return getProjects().find((p) => p.slug === slug);
}
