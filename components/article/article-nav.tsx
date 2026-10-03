"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface NavSection {
  id: string;
  title: string;
}

interface ArticleNavProps {
  sections: NavSection[];
  /** id of the element whose scroll extent drives the progress bar. */
  articleId: string;
}

const ACTIVE_OFFSET = 160;

export function ArticleNav({ sections, articleId }: ArticleNavProps) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? "");
  const [menuOpen, setMenuOpen] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let frame = 0;

    function update() {
      frame = 0;
      const article = document.getElementById(articleId);
      if (article && barRef.current) {
        const rect = article.getBoundingClientRect();
        const scrollable = rect.height - window.innerHeight;
        const progress = scrollable > 0 ? Math.min(1, Math.max(0, -rect.top / scrollable)) : 0;
        barRef.current.style.transform = `scaleX(${progress})`;
      }

      let current = sections[0]?.id ?? "";
      for (const { id } of sections) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= ACTIVE_OFFSET) current = id;
      }
      setActiveId((prev) => (prev === current ? prev : current));
    }

    function onScroll() {
      if (!frame) frame = requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [articleId, sections]);

  useEffect(() => {
    if (!menuOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const activeIndex = Math.max(
    0,
    sections.findIndex((s) => s.id === activeId),
  );
  const active = sections[activeIndex];

  const list = (onNavigate?: () => void) => (
    <ol className="space-y-0.5">
      {sections.map((s, i) => {
        const isActive = s.id === activeId;
        return (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              onClick={onNavigate}
              aria-current={isActive ? "location" : undefined}
              className={cn(
                "group flex gap-2 rounded-[3px] py-1 pr-2 text-sm leading-snug transition-colors duration-150",
                isActive ? "text-ink" : "text-ink-faded hover:text-ink",
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "mt-[0.45rem] h-px w-3 shrink-0 transition-all duration-150",
                  isActive ? "w-5 bg-terracotta" : "bg-paper-edge group-hover:bg-ink-faded",
                )}
              />
              <span>
                <span className="sr-only">{`Section ${i + 1}: `}</span>
                {s.title}
              </span>
            </a>
          </li>
        );
      })}
    </ol>
  );

  return (
    <>
      {/* Reading progress. Decorative: the section nav carries the real position. */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed top-0 right-0 left-0 z-[60] h-[2px] bg-transparent"
      >
        <div
          ref={barRef}
          className="h-full origin-left bg-terracotta"
          style={{ transform: "scaleX(0)" }}
        />
      </div>

      {/* Desktop: sticky rail */}
      <nav
        aria-label="On this page"
        className="sticky top-28 hidden max-h-[calc(100vh-9rem)] self-start overflow-y-auto pr-2 lg:block"
      >
        <p className="mb-3 font-mono text-xs uppercase tracking-wide text-ink-faded">
          On this page
        </p>
        {list()}
      </nav>

      {/* Mobile and tablet: sticky bar with a collapsible list */}
      <div className="sticky top-[3.75rem] z-30 -mx-4 border-b border-paper-edge bg-paper/95 px-4 backdrop-blur-sm sm:-mx-6 sm:px-6 lg:hidden">
        <button
          ref={menuButtonRef}
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          aria-expanded={menuOpen}
          aria-controls="article-section-menu"
          className="flex w-full items-center justify-between gap-3 py-2.5 text-left text-sm"
        >
          <span className="min-w-0 truncate">
            <span className="mr-2 font-mono text-xs text-ink-faded">
              {String(activeIndex + 1).padStart(2, "0")}/{String(sections.length).padStart(2, "0")}
            </span>
            <span className="text-ink">{active?.title}</span>
          </span>
          <span className="shrink-0 font-mono text-xs text-terracotta">
            {menuOpen ? "close" : "sections"}
          </span>
        </button>
        <nav
          id="article-section-menu"
          aria-label="Sections"
          hidden={!menuOpen}
          className="max-h-[60vh] overflow-y-auto border-t border-paper-edge py-3"
        >
          {list(closeMenu)}
        </nav>
      </div>
    </>
  );
}
