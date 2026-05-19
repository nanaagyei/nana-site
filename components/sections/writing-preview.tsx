import Link from "next/link";
import { Reveal } from "@/components/primitives/reveal";
import { getPosts } from "@/lib/writing";

export function WritingPreview() {
  const posts = getPosts();

  if (posts.length === 0) return null;

  return (
    <section id="writing" className="px-4 py-[min(12vh,96px)] sm:px-6 sm:py-[min(12vh,128px)]">
      <div className="mx-auto max-w-[680px]">
        <Reveal>
          <div className="flex items-baseline justify-between mb-12">
            <h2 className="font-display text-2xl font-normal tracking-[-0.02em] text-ink-faded">
              Writing
            </h2>
            <Link
              href="/writing"
              className="text-sm text-terracotta transition-colors duration-200 hover:text-ink"
            >
              all posts
            </Link>
          </div>
        </Reveal>

        <div className="space-y-0">
          {posts.map((post, i) => (
            <Reveal key={post.slug} delay={i * 0.06}>
              <Link
                href={`/writing/${post.slug}`}
                className="group block border-t border-paper-edge py-6 first:border-t-0"
              >
                <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                  <h3 className="text-base font-normal text-ink transition-colors duration-200 group-hover:text-terracotta">
                    {post.title}
                  </h3>
                  <span className="shrink-0 font-mono text-xs text-ink-faded">
                    {post.readingTime}
                  </span>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-faded">
                  {post.excerpt}
                </p>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
