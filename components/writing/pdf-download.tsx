import { FileDown } from "lucide-react";

interface Props {
  slug: string;
  title: string;
}

const hrefFor = (slug: string) => `/writing/${slug}/pdf`;
const fileFor = (slug: string) => `${slug}.pdf`;

/** A quiet text link for the article header, next to the date and reading time. */
export function PdfLink({ slug, title }: Props) {
  return (
    <a
      href={hrefFor(slug)}
      download={fileFor(slug)}
      type="application/pdf"
      className="inline-flex min-h-11 items-center gap-1.5 rounded-sm text-terracotta underline decoration-transparent underline-offset-4 transition-colors duration-200 hover:text-ink hover:decoration-current focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta print:hidden"
    >
      <FileDown aria-hidden="true" className="size-4 shrink-0" strokeWidth={1.75} />
      <span>
        Save as PDF<span className="sr-only">: {title} (PDF file, downloads)</span>
      </span>
    </a>
  );
}

/** The fuller invitation that closes an article, before the "keep reading" list. */
export function PdfCard({ slug, title }: Props) {
  const descId = `pdf-desc-${slug}`;

  return (
    <aside
      aria-labelledby={`pdf-title-${slug}`}
      className="mt-16 rounded-md border border-paper-edge bg-paper-deep px-5 py-6 sm:px-7 sm:py-7 print:hidden"
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
        <div className="min-w-0">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-terracotta">
            Offline reading
          </p>
          <h2
            id={`pdf-title-${slug}`}
            className="mt-2 font-display text-xl font-normal tracking-tight text-ink"
          >
            Take this one with you
          </h2>
          <p id={descId} className="mt-2 max-w-prose text-sm leading-relaxed text-ink-soft">
            A typeset PDF of this piece, made for the page: numbered sections, code that holds
            its shape, and every link listed at the end so nothing goes missing on paper.
          </p>
        </div>

        <a
          href={hrefFor(slug)}
          download={fileFor(slug)}
          type="application/pdf"
          aria-describedby={descId}
          className="group inline-flex min-h-12 shrink-0 items-center justify-center gap-2.5 rounded-sm bg-terracotta px-6 text-sm font-medium text-ink-on-accent transition-[background-color,transform] duration-200 hover:bg-ink focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-terracotta motion-safe:active:translate-y-px"
        >
          <FileDown
            aria-hidden="true"
            className="size-[18px] transition-transform duration-200 motion-safe:group-hover:translate-y-0.5"
            strokeWidth={1.75}
          />
          <span>
            Download PDF<span className="sr-only">: {title}</span>
          </span>
        </a>
      </div>
    </aside>
  );
}
