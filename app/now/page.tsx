import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { ProjectContent } from "@/app/projects/[slug]/content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Now",
  description: "What I'm currently reading, building, and learning.",
};

export default function NowPage() {
  const filePath = path.join(process.cwd(), "content", "now.mdx");
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  return (
    <div className="px-6 pt-32 pb-16">
      <div className="mx-auto max-w-[680px]">
        <h1
          className="font-display text-3xl font-normal tracking-tight mb-4"
          style={{
            fontVariationSettings: "'opsz' 72, 'SOFT' 60, 'WONK' 1",
          }}
        >
          Now
        </h1>
        <p className="mb-12 font-mono text-xs text-ink-faded">
          Last updated {data.updated as string}
        </p>

        <ProjectContent content={content} />
      </div>
    </div>
  );
}
