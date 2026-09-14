import Link from "next/link";
import { formatDateFull } from "@/lib/utils";
import type { Post } from "@/lib/writing";

export function PostNav({
  suggested,
  previous,
  next,
}: {
  suggested: Post[];
  previous: Post | null;
  next: Post | null;
}) {
  return (
    <nav
      className="mt-16 border-t border-paper-edge pt-10"
      aria-label="More writing"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/writing"
          className="text-sm text-terracotta transition-colors duration-200 hover:text-ink"
        >
          all posts
        </Link>
        <div className="flex gap-4 font-mono text-xs text-ink-faded">
          {previous ? (
            <Link
              href={`/writing/${previous.slug}`}
              className="transition-colors duration-200 hover:text-terracotta"
            >
              older
            </Link>
          ) : null}
          {next ? (
            <Link
              href={`/writing/${next.slug}`}
              className="transition-colors duration-200 hover:text-terracotta"
            >
              newer
            </Link>
          ) : null}
        </div>
      </div>

      {suggested.length > 0 ? (
        <div className="mt-8">
          <h2 className="mb-4 font-display text-lg font-normal tracking-tight">
            Keep reading
          </h2>
          <ul>
            {suggested.map((post) => (
              <li
                key={post.slug}
                className="border-t border-paper-edge first:border-t-0"
              >
                <Link
                  href={`/writing/${post.slug}`}
                  className="group block py-4"
                >
                  <span className="block text-sm text-ink transition-colors duration-200 group-hover:text-terracotta">
                    {post.title}
                  </span>
                  <span className="mt-1 block font-mono text-xs text-ink-faded">
                    {formatDateFull(post.date)}
                  </span>
                  <span className="mt-1.5 block text-sm leading-relaxed text-ink-faded">
                    {post.excerpt.replace(/[—–]/g, "-")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </nav>
  );
}
