"use client";

import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Reveal } from "@/components/primitives/reveal";
import { Pill } from "@/components/primitives/pill";
import { GitHubIcon, ExternalLinkIcon } from "@/components/primitives/icons";
import { ProjectCover } from "@/components/primitives/project-cover";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

type FeaturedProject = {
  slug: string;
  title: string;
  subtitle: string;
  year: number;
  stack: string[];
  github: string;
  site?: string;
  image?: string;
  subItems?: { label: string; href: string }[];
};

const FEATURED: FeaturedProject[] = [
  {
    slug: "stormlog",
    title: "Stormlog",
    subtitle: "GPU memory profiling for PyTorch & TensorFlow",
    year: 2025,
    stack: ["Python", "PyTorch", "Textual"],
    github: "https://github.com/Silas-Asamoah/stormlog",
    site: "https://stormlog.dev",
    image: "/images/projects/stormlog.png",
    subItems: [
      { label: "PyPI", href: "https://pypi.org/project/stormlog/" },
      { label: "Leaks Lab", href: "https://github.com/nanaagyei/stormlog-leaks-lab" },
    ],
  },
  {
    slug: "regexlens",
    title: "RegexLens",
    subtitle: "Interactive regex debugger with real-time visualization",
    year: 2025,
    stack: ["Next.js", "TypeScript", "React"],
    github: "https://github.com/nanaagyei/regexlens",
    site: "https://regexlens.dev",
    image: "/images/projects/regexlens.png",
  },
  {
    slug: "nkwapa",
    title: "Nkwapa",
    subtitle: "Offline-first EMR for hypertension and diabetes programs",
    year: 2024,
    stack: ["React", "Node.js", "PostgreSQL"],
    github: "",
    site: "https://staging.nkwapa.app",
    image: "/images/projects/nkwapa.png",
  },
  {
    slug: "akomapa-academy",
    title: "Akomapa Academy",
    subtitle: "Global health education and leadership for student clinicians",
    year: 2026,
    stack: ["Next.js", "TypeScript", "React"],
    github: "",
    site: "https://academy.akomapa.org",
    image: "/images/projects/akomapa-academy.png",
  },
];

function FeaturedCard({
  project,
  index,
}: {
  project: FeaturedProject;
  index: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!imageRef.current || !cardRef.current) return;

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (prefersReducedMotion) return;

      gsap.to(imageRef.current, {
        y: -40,
        ease: "none",
        scrollTrigger: {
          trigger: cardRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    },
    { scope: cardRef }
  );

  const isWide = index === 0;
  const primaryLink = project.site || project.github;

  return (
    <Reveal delay={index * 0.08}>
      <div
        ref={cardRef}
        className={cn(
          "group",
          isWide ? "col-span-full md:col-span-2" : "col-span-full md:col-span-1"
        )}
      >
        {(() => {
          const wrapper = (
            <div className="relative mb-4 overflow-hidden rounded-sm bg-paper-deep">
              <div
                ref={imageRef}
                className={cn(
                  "relative will-change-transform",
                  isWide ? "aspect-video" : "aspect-4/3"
                )}
              >
                <ProjectCover
                  src={project.image}
                  alt={`${project.title} screenshot`}
                  sizes={
                    isWide
                      ? "(min-width: 768px) 66vw, 100vw"
                      : "(min-width: 768px) 50vw, 100vw"
                  }
                  priority={index === 0}
                  className="h-full w-full"
                />
              </div>
            </div>
          );

          return primaryLink ? (
            <a href={primaryLink} target="_blank" rel="noopener noreferrer">
              {wrapper}
            </a>
          ) : (
            wrapper
          );
        })()}

        {/* Meta */}
        <div>
          <div className="flex items-start justify-between gap-4">
            <h3
              className="font-display text-xl font-normal tracking-tight"
              style={{
                fontVariationSettings: "'opsz' 48, 'SOFT' 60, 'WONK' 1",
              }}
            >
              {project.title}
            </h3>
            <div className="flex shrink-0 items-center gap-3 pt-1">
              {project.github && (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink-faded transition-colors duration-200 hover:text-ink"
                  aria-label={`${project.title} on GitHub`}
                >
                  <GitHubIcon />
                </a>
              )}
              {project.site && (
                <a
                  href={project.site}
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
          <p className="mt-1 text-sm text-ink-soft">{project.subtitle}</p>
          {project.subItems && (
            <div className="mt-2 flex gap-3">
              {project.subItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-terracotta transition-colors duration-200 hover:text-ink"
                >
                  {item.label} →
                </a>
              ))}
            </div>
          )}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {project.stack.map((tech) => (
              <Pill key={tech} variant="moss">
                {tech}
              </Pill>
            ))}
            <Pill>{project.year}</Pill>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

export function Work() {
  return (
    <section id="work" className="px-4 py-[min(12vh,96px)] sm:px-6 sm:py-[min(12vh,128px)]">
      <div className="mx-auto max-w-[1200px]">
        <Reveal>
          <div className="mb-12 flex items-baseline justify-between">
            <h2 className="font-display text-2xl font-normal tracking-[-0.02em] text-ink-faded">
              Selected work
            </h2>
            <Link
              href="/projects"
              className="text-sm text-terracotta transition-colors duration-200 hover:text-ink"
            >
              all projects
            </Link>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:gap-y-12 md:grid-cols-2">
          {FEATURED.map((project, i) => (
            <FeaturedCard key={project.slug} project={project} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
