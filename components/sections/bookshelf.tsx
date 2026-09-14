"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { BookSpine, LearningItem, ReadingBook } from "@/lib/now";

const SPINE_CLASS: Record<BookSpine, string> = {
  terracotta: "bg-terracotta text-ink-on-accent",
  moss: "bg-moss text-ink-on-accent",
  ochre: "bg-ochre text-ink",
  ink: "bg-ink text-paper",
};

function CoverFace({
  title,
  author,
  cover,
  spine,
  className,
}: {
  title: string;
  author?: string;
  cover?: string;
  spine: BookSpine;
  className?: string;
}) {
  const [failed, setFailed] = useState(!cover);

  return (
    <span
      className={cn(
        "relative block h-full w-full overflow-hidden",
        className
      )}
    >
      {!failed && cover ? (
        <Image
          src={cover}
          alt=""
          fill
          sizes="112px"
          className="object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <span
          className={cn(
            "flex h-full w-full flex-col justify-between p-2.5",
            SPINE_CLASS[spine]
          )}
        >
          <span className="font-display text-[11px] leading-[1.2] tracking-tight">
            {title}
          </span>
          {author ? (
            <span className="text-[9px] leading-snug opacity-80">{author}</span>
          ) : null}
        </span>
      )}
    </span>
  );
}

const BOOK_HEIGHTS = ["h-[168px]", "h-[184px]", "h-[156px]", "h-[176px]"];

export function Bookshelf({ books }: { books: readonly ReadingBook[] }) {
  const [active, setActive] = useState(0);
  const current = books[active] ?? books[0];

  return (
    <div>
      <div className="-mx-4 flex items-end gap-3 overflow-x-auto px-4 pb-1 pt-6 scroll-smooth snap-x snap-mandatory sm:mx-0 sm:px-0 md:gap-4">
        {books.map((book, i) => (
          <a
            key={book.title}
            href={book.href}
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            className={cn(
              "group relative snap-start shrink-0 origin-bottom rounded-sm border border-paper-edge bg-paper-deep shadow-[3px_4px_0_0_var(--paper-edge)] transition-transform duration-300 ease-out-quart",
              "w-26 sm:w-28",
              BOOK_HEIGHTS[i % BOOK_HEIGHTS.length],
              "motion-safe:hover:-translate-y-3 motion-safe:hover:-rotate-2 motion-safe:focus-visible:-translate-y-3",
              active === i && "z-10"
            )}
            style={{
              rotate: `${(i % 2 === 0 ? -1.4 : 1.8) + i * 0.15}deg`,
            }}
          >
            <CoverFace
              title={book.title}
              author={book.author}
              cover={book.cover}
              spine={book.spine}
            />
          </a>
        ))}
      </div>
      <div className="mt-0 h-2 border-t border-paper-edge bg-paper-deep" aria-hidden="true" />
      {current ? (
        <p className="mt-4 min-h-11">
          <a
            href={current.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm italic text-ink transition-colors duration-200 hover:text-terracotta"
          >
            {current.title}
          </a>
          <span className="mt-0.5 block text-xs text-ink-faded">
            {current.author}
          </span>
        </p>
      ) : null}
    </div>
  );
}

export function LearningShelf({ items }: { items: readonly LearningItem[] }) {
  return (
    <ul className="space-y-4">
      {items.map((item) => (
        <li key={item.title}>
          <a
            href={item.bookHref}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start gap-3"
          >
            <span className="relative h-18 w-12 shrink-0 overflow-hidden rounded-sm border border-paper-edge bg-paper-deep shadow-[2px_3px_0_0_var(--paper-edge)] transition-transform duration-300 ease-out-quart motion-safe:group-hover:-translate-y-1">
              <CoverFace
                title={item.book}
                cover={item.cover}
                spine={item.spine}
              />
            </span>
            <span className="min-w-0 pt-0.5">
              <span className="block text-sm text-ink transition-colors duration-200 group-hover:text-terracotta">
                {item.title}
              </span>
              <span className="mt-0.5 block text-xs italic text-ink-faded">
                {item.book}
              </span>
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
