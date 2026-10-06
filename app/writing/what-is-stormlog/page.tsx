import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PdfCard, PdfLink } from "@/components/writing/pdf-download";
import { PostNav } from "@/components/writing/post-nav";
import {
  ARTICLE_SUBTITLE,
  ARTICLE_TITLE,
  StormlogArticle,
} from "@/components/stormlog-article/stormlog-article";
import { getPostBySlug, getPostNav } from "@/lib/writing";
import { SITE } from "@/lib/site";

const SLUG = "what-is-stormlog";
const PATH = `/writing/${SLUG}`;

export async function generateMetadata(): Promise<Metadata> {
  const post = getPostBySlug(SLUG);
  if (!post) return {};

  // Social images come from opengraph-image.tsx and twitter-image.tsx in this folder.
  return {
    title: ARTICLE_TITLE,
    description: post.excerpt,
    alternates: { canonical: PATH },
    openGraph: {
      title: ARTICLE_TITLE,
      description: post.excerpt,
      type: "article",
      url: PATH,
      publishedTime: post.date,
      authors: [SITE.name],
    },
    twitter: {
      card: "summary_large_image",
      title: ARTICLE_TITLE,
      description: post.excerpt,
    },
  };
}

export default function WhatIsStormlogPage() {
  const post = getPostBySlug(SLUG);
  if (!post) notFound();

  const { suggested, previous, next } = getPostNav(SLUG);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: ARTICLE_TITLE,
    description: ARTICLE_SUBTITLE,
    datePublished: post.date,
    author: { "@type": "Person", name: SITE.name, url: SITE.url },
    mainEntityOfPage: `${SITE.url}${PATH}`,
    about: ["GPU memory profiling", "Inference profiling", "PyTorch", "TensorFlow", "JAX"],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <StormlogArticle
        date={post.date}
        readingTime={post.readingTime}
        headerExtra={<PdfLink slug={SLUG} title={ARTICLE_TITLE} />}
        footer={
          <>
            <PdfCard slug={SLUG} title={ARTICLE_TITLE} />
            <PostNav suggested={suggested} previous={previous} next={next} />
          </>
        }
      />
    </>
  );
}
