import { notFound } from "next/navigation";
import Link from "next/link";
import { getPostBySlug, getPostNav, getPosts } from "@/lib/writing";
import { formatDateFull } from "@/lib/utils";
import { ProjectContent } from "@/app/projects/[slug]/content";
import { PostNav } from "@/components/writing/post-nav";
import type { Metadata } from "next";
import { OG_IMAGE, socialImages } from "@/lib/metadata";

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
      images: socialImages,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [OG_IMAGE.url],
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

  const { suggested, previous, next, companion } = getPostNav(slug);

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
          {companion ? (
            <p className="mt-5 text-sm text-ink-faded">
              Companion piece:{" "}
              <Link
                href={`/writing/${companion.slug}`}
                className="text-terracotta underline decoration-transparent underline-offset-2 transition-colors duration-200 hover:text-ink hover:decoration-current"
              >
                {companion.title}
              </Link>
            </p>
          ) : null}
        </header>

        <ProjectContent content={post.content} />

        <PostNav suggested={suggested} previous={previous} next={next} />
      </div>
    </article>
  );
}
