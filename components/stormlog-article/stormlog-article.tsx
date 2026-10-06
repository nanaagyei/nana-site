import type { ReactNode } from "react";
import Link from "next/link";
import { ArticleNav } from "@/components/article/article-nav";
import { SECTIONS } from "@/components/stormlog-article/sections";
import { SectionsCore } from "@/components/stormlog-article/sections-core";
import { SectionsDeep } from "@/components/stormlog-article/sections-deep";
import { SectionsIntro } from "@/components/stormlog-article/sections-intro";
import { formatDateFull } from "@/lib/utils";

export const ARTICLE_ID = "stormlog-article";

export const ARTICLE_TITLE = "What Stormlog Is, How It Works, and Why We’re Building It";
export const ARTICLE_SUBTITLE =
  "A visual guide to GPU memory profiling, telemetry, diagnostics, artifacts, distributed workloads, and inference profiling.";

export function StormlogArticle({
  date,
  readingTime,
  footer,
  headerExtra,
}: {
  date: string;
  readingTime: string;
  footer?: ReactNode;
  /** Sits under the byline, e.g. a download link. */
  headerExtra?: ReactNode;
}) {
  return (
    <article className="explainer px-4 pt-32 pb-16 sm:px-6">
      <div className="mx-auto max-w-[980px]">
        <Link
          href="/writing"
          className="mb-12 inline-block text-sm text-ink-faded transition-colors duration-200 hover:text-terracotta"
        >
          &larr; all posts
        </Link>

        <header className="mb-10 max-w-[720px] lg:ml-[calc(180px+3.5rem)]">
          <h1
            className="font-display text-3xl font-normal tracking-tight text-balance sm:text-4xl"
            style={{ fontVariationSettings: "'opsz' 72, 'SOFT' 60, 'WONK' 1" }}
          >
            {ARTICLE_TITLE}
          </h1>
          <p className="mt-4 text-lg leading-snug text-ink-soft">{ARTICLE_SUBTITLE}</p>
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-ink-faded">
            <span>Prince Agyei Tuffour</span>
            <time dateTime={date}>{formatDateFull(date)}</time>
            <span>{readingTime}</span>
            <span>Stormlog v0.4.0</span>
          </div>
          {headerExtra ? <div className="mt-1 text-sm">{headerExtra}</div> : null}
        </header>

        <div className="lg:grid lg:grid-cols-[180px_minmax(0,720px)] lg:gap-x-14">
          <ArticleNav sections={[...SECTIONS]} articleId={ARTICLE_ID} />
          <div className="mt-8 min-w-0 lg:mt-0">
            <div id={ARTICLE_ID}>
              <SectionsIntro />
              <SectionsCore />
              <SectionsDeep />
            </div>
            {footer}
          </div>
        </div>
      </div>
    </article>
  );
}
