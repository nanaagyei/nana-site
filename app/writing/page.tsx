import Link from "next/link";
import { getPosts } from "@/lib/writing";
import { formatDateFull } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Writing",
  description: "Essays on software engineering, ML/AI, and building in public.",
};

export default function WritingIndex() {
  const posts = getPosts();

  return (
    <div className="px-6 pt-32 pb-16">
      <div className="mx-auto max-w-[680px]">
        <h1
          className="font-display text-3xl font-normal tracking-tight mb-12"
          style={{
            fontVariationSettings: "'opsz' 72, 'SOFT' 60, 'WONK' 1",
          }}
        >
          Writing
        </h1>

        {posts.length === 0 ? (
          <p className="text-ink-faded">No posts yet. Check back soon.</p>
        ) : (
          <div className="space-y-0">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/writing/${post.slug}`}
                className="group block border-t border-paper-edge py-6 first:border-t-0"
              >
                <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                  <h2 className="text-base font-normal text-ink transition-colors duration-200 group-hover:text-terracotta">
                    {post.title}
                  </h2>
                  <div className="flex shrink-0 items-center gap-3 font-mono text-xs text-ink-faded">
                    <span>{formatDateFull(post.date)}</span>
                    <span>{post.readingTime}</span>
                  </div>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-faded">
                  {post.excerpt}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
