import { SITE } from "@/lib/site";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-paper-edge px-4 py-12 sm:px-6">
      <div className="mx-auto flex max-w-[1200px] flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
        <div className="flex flex-col gap-1">
          <span className="font-display text-sm text-ink-faded">
            {SITE.name}
          </span>
          <span className="font-mono text-xs text-ink-faded">
            &copy; {year}
          </span>
        </div>

        <ul className="flex items-center gap-6 text-sm text-ink-faded">
          <li>
            <a
              href={`mailto:${SITE.email}`}
              className="transition-colors duration-200 hover:text-terracotta"
            >
              email
            </a>
          </li>
          <li>
            <a
              href={SITE.social.github}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors duration-200 hover:text-terracotta"
            >
              github
            </a>
          </li>
          <li>
            <a
              href={SITE.social.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors duration-200 hover:text-terracotta"
            >
              linkedin
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
