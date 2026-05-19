import Link from "next/link";
import { getProjects } from "@/lib/projects";
import { Reveal } from "@/components/primitives/reveal";
import { Pill } from "@/components/primitives/pill";
import { GitHubIcon, ExternalLinkIcon } from "@/components/primitives/icons";
import { renderMarkdown } from "@/lib/markdown";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Open-source tools, ML/AI experiments, and software engineering projects by Prince Agyei Tuffour.",
};

export default async function ProjectsPage() {
  const projects = getProjects();

  const projectsWithHtml = await Promise.all(
    projects.map(async (p) => ({
      ...p,
      html: await renderMarkdown(p.content),
    }))
  );

  return (
    <div className="px-4 pt-32 pb-16 sm:px-6">
      <div className="mx-auto max-w-[900px]">
        <Reveal>
          <div className="mb-16">
            <Link
              href="/"
              className="mb-8 inline-block text-sm text-ink-faded transition-colors duration-200 hover:text-terracotta"
            >
              &larr; home
            </Link>
            <h1
              className="font-display text-3xl font-normal tracking-tight sm:text-4xl"
              style={{
                fontVariationSettings: "'opsz' 72, 'SOFT' 60, 'WONK' 1",
              }}
            >
              Projects
            </h1>
            <p className="mt-3 max-w-[50ch] text-base leading-relaxed text-ink-soft">
              Open-source tools, ML/AI experiments, and things I&apos;ve built
              to learn or solve a problem.
            </p>
          </div>
        </Reveal>

        <div className="space-y-12">
          {projectsWithHtml.map((project, i) => (
            <Reveal key={project.slug} delay={i * 0.04}>
              <div className="border-t border-paper-edge pt-10 first:border-t-0 first:pt-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2
                      className="font-display text-xl font-normal tracking-tight"
                      style={{
                        fontVariationSettings:
                          "'opsz' 48, 'SOFT' 60, 'WONK' 1",
                      }}
                    >
                      {project.title}
                    </h2>
                    <p className="mt-1 text-sm text-ink-faded">
                      {project.subtitle}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 pt-1">
                    {project.links?.github && (
                      <a
                        href={project.links.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-ink-faded transition-colors duration-200 hover:text-ink"
                        aria-label={`${project.title} on GitHub`}
                      >
                        <GitHubIcon />
                      </a>
                    )}
                    {project.links?.site && (
                      <a
                        href={project.links.site}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-ink-faded transition-colors duration-200 hover:text-terracotta"
                        aria-label={`${project.title} live site`}
                      >
                        <ExternalLinkIcon />
                      </a>
                    )}
                  </div>
                </div>

                <div
                  className="mt-4 text-sm leading-[1.7] text-ink-soft"
                  dangerouslySetInnerHTML={{ __html: project.html }}
                />

                <div className="mt-4 flex flex-wrap items-center gap-1.5">
                  {project.stack.map((tech) => (
                    <Pill key={tech} variant="moss">
                      {tech}
                    </Pill>
                  ))}
                  <Pill>{project.year}</Pill>
                  <span className="ml-2 font-mono text-xs text-ink-faded">
                    {project.role}
                  </span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
