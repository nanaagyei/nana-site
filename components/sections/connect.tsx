import { Reveal } from "@/components/primitives/reveal";
import { GitHubIcon, LinkedInIcon } from "@/components/primitives/icons";
import { SITE } from "@/lib/site";

export function Connect() {
  return (
    <section id="connect" className="px-4 py-[min(12vh,128px)] sm:px-6">
      <div className="mx-auto max-w-[680px]">
        <Reveal>
          <h2 className="font-display text-2xl font-normal tracking-[-0.02em] text-ink-faded mb-12">
            Connect
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="mb-8 text-base leading-relaxed text-ink-soft">
            I&apos;m always open to conversations about software engineering,
            ML/AI, open-source tools, or interesting problems. The best way to
            reach me is email.
          </p>
        </Reveal>

        <Reveal delay={0.15}>
          <a
            href={`mailto:${SITE.email}`}
            className="group inline-block break-all font-display text-xl tracking-tight text-terracotta transition-colors duration-200 hover:text-ink sm:break-normal sm:text-2xl md:text-3xl"
            style={{
              fontVariationSettings: "'opsz' 48, 'SOFT' 60, 'WONK' 1",
            }}
          >
            {SITE.email}
            <span className="block h-px w-0 bg-ink transition-all duration-300 ease-out group-hover:w-full" />
          </a>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="mt-8 flex gap-4">
            <a
              href={SITE.social.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink-faded transition-colors duration-200 hover:text-terracotta"
              aria-label="GitHub"
            >
              <GitHubIcon className="h-5 w-5" />
            </a>
            <a
              href={SITE.social.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink-faded transition-colors duration-200 hover:text-terracotta"
              aria-label="LinkedIn"
            >
              <LinkedInIcon className="h-5 w-5" />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
