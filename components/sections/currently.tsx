import Link from "next/link";
import { Reveal } from "@/components/primitives/reveal";
import { Bookshelf, LearningShelf } from "@/components/sections/bookshelf";
import { NOW } from "@/lib/now";

export function Currently() {
  return (
    <section id="currently" className="py-[min(12vh,128px)]">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <Reveal>
          <div className="mb-12 flex items-baseline justify-between">
            <h2 className="font-display text-2xl font-normal tracking-[-0.02em] text-ink-faded">
              Currently
            </h2>
            <span className="font-mono text-xs text-ink-faded">
              Updated {NOW.updated}
            </span>
          </div>
        </Reveal>

        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-16 lg:items-start">
          <Reveal>
            <div>
              <h3 className="mb-4 font-display text-lg font-normal tracking-tight text-ink">
                Reading
              </h3>
              <Bookshelf books={NOW.reading} />
            </div>
          </Reveal>

          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-1">
            <Reveal delay={0.06}>
              <div>
                <h3 className="mb-4 font-display text-lg font-normal tracking-tight text-ink">
                  Building
                </h3>
                <ul className="space-y-4">
                  {NOW.building.map((item) => (
                    <li key={item.title}>
                      <Link href={item.href} className="group">
                        <span className="font-mono text-sm text-moss transition-colors duration-200 group-hover:text-terracotta">
                          {item.title}
                        </span>
                        <span className="mt-0.5 block text-xs text-ink-faded">
                          {item.description}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div>
                <h3 className="mb-4 font-display text-lg font-normal tracking-tight text-ink">
                  Learning
                </h3>
                <LearningShelf items={NOW.learning} />
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
