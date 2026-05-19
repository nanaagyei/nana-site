import { notFound } from "next/navigation";
import Link from "next/link";
import { getPostBySlug, getPosts } from "@/lib/writing";
import { formatDateFull } from "@/lib/utils";
import { ProjectContent } from "@/app/projects/[slug]/content";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
    },
    alternates: {
      canonical: `/writing/${slug}`,
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) notFound();

  return (
    <article className="px-4 pt-32 pb-16 sm:px-6">
      <div className="mx-auto max-w-[680px]">
        <Link
          href="/writing"
          className="mb-12 inline-block text-sm text-ink-faded transition-colors duration-200 hover:text-terracotta"
        >
          &larr; all posts
        </Link>

        <header className="mb-12">
          <h1
            className="font-display text-3xl font-normal tracking-tight sm:text-4xl"
            style={{
              fontVariationSettings: "'opsz' 72, 'SOFT' 60, 'WONK' 1",
            }}
          >
            {post.title}
          </h1>
          <div className="mt-4 flex items-center gap-4 font-mono text-xs text-ink-faded">
            <time dateTime={post.date}>{formatDateFull(post.date)}</time>
            <span>{post.readingTime}</span>
          </div>
        </header>

        <ProjectContent content={post.content} />
      </div>
    </article>
  );
}
