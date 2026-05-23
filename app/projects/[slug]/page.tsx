import { notFound } from "next/navigation";
import Link from "next/link";
import { getProjectBySlug, getProjects } from "@/lib/projects";
import { Pill } from "@/components/primitives/pill";
import { ProjectContent } from "./content";
import type { Metadata } from "next";
import { OG_IMAGE, socialImages } from "@/lib/metadata";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const projects = getProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return {};

  return {
    title: project.title,
    description: project.subtitle,
    openGraph: {
      title: project.title,
      description: project.subtitle,
      type: "article",
      images: socialImages,
    },
    twitter: {
      card: "summary_large_image",
      title: project.title,
      description: project.subtitle,
      images: [OG_IMAGE.url],
    },
    alternates: {
      canonical: `/projects/${slug}`,
    },
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) notFound();

  return (
    <article className="px-4 pt-32 pb-16 sm:px-6">
      <div className="mx-auto max-w-[680px]">
        {/* Back link */}
        <Link
          href="/projects"
          className="mb-12 inline-block text-sm text-ink-faded transition-colors duration-200 hover:text-terracotta"
        >
          &larr; all projects
        </Link>

        {/* Header */}
        <header className="mb-12">
          <h1
            className="font-display text-3xl font-normal tracking-tight sm:text-4xl"
            style={{
              fontVariationSettings: "'opsz' 72, 'SOFT' 60, 'WONK' 1",
            }}
          >
            {project.title}
          </h1>
          <p className="mt-3 text-lg text-ink-soft">{project.subtitle}</p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {project.stack.map((tech) => (
              <Pill key={tech} variant="moss">
                {tech}
              </Pill>
            ))}
            <Pill>{project.year}</Pill>
          </div>

          {/* Links */}
          <div className="mt-4 flex gap-4">
            {project.links?.github && (
              <a
                href={project.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-terracotta transition-colors duration-200 hover:text-ink"
              >
                GitHub
              </a>
            )}
            {project.links?.pypi && (
              <a
                href={project.links.pypi}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-terracotta transition-colors duration-200 hover:text-ink"
              >
                PyPI
              </a>
            )}
            {project.links?.site && (
              <a
                href={project.links.site}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-terracotta transition-colors duration-200 hover:text-ink"
              >
                Live site
              </a>
            )}
          </div>

          {project.collaborators && project.collaborators.length > 0 && (
            <p className="mt-4 text-xs text-ink-faded">
              with {project.collaborators.join(", ")}
            </p>
          )}
        </header>

        {/* MDX Content */}
        <ProjectContent content={project.content} />
      </div>
    </article>
  );
}
