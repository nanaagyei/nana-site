"use client";

import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Reveal } from "@/components/primitives/reveal";
import { Pill } from "@/components/primitives/pill";
import { GitHubIcon, ExternalLinkIcon } from "@/components/primitives/icons";
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
  },
  {
    slug: "guidr",
    title: "Guidr",
    subtitle: "AI-powered graduate school discovery platform",
    year: 2026,
    stack: ["FastAPI", "Next.js", "PostgreSQL"],
    github: "https://github.com/nanaagyei/guidr",
  },
  {
    slug: "gatewise",
    title: "Gatewise",
    subtitle: "Intelligent airport navigation for travelers",
    year: 2026,
    stack: ["TypeScript", "React Native", "Supabase"],
    github: "",
  },
];

// Abstract SVG patterns for project cover placeholders
const PATTERNS = [
  // Concentric circles
  (
    <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden="true" key="p0">
      <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.15" />
      <circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.12" />
      <circle cx="100" cy="100" r="40" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.09" />
      <circle cx="100" cy="100" r="20" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.06" />
    </svg>
  ),
  // Grid dots
  (
    <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden="true" key="p1">
      {Array.from({ length: 8 }).map((_, row) =>
        Array.from({ length: 8 }).map((_, col) => (
          <circle
            key={`${row}-${col}`}
            cx={25 + col * 22}
            cy={25 + row * 22}
            r="1.5"
            fill="currentColor"
            opacity={0.06 + (row + col) * 0.008}
          />
        ))
      )}
    </svg>
  ),
  // Diagonal lines
  (
    <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden="true" key="p2">
      {Array.from({ length: 12 }).map((_, i) => (
        <line
          key={i}
          x1={-20 + i * 22}
          y1="0"
          x2={-20 + i * 22 + 200}
          y2="200"
          stroke="currentColor"
          strokeWidth="0.5"
          opacity={0.06 + i * 0.006}
        />
      ))}
    </svg>
  ),
  // Hexagonal pattern
  (
    <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden="true" key="p3">
      {[
        [100, 60], [60, 85], [140, 85], [60, 115], [140, 115], [100, 140],
      ].map(([cx, cy], i) => (
        <polygon
          key={i}
          points={Array.from({ length: 6 }).map((_, j) => {
            const angle = (Math.PI / 3) * j - Math.PI / 6;
            return `${(cx ?? 0) + 18 * Math.cos(angle)},${(cy ?? 0) + 18 * Math.sin(angle)}`;
          }).join(" ")}
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
          opacity={0.08 + i * 0.01}
        />
      ))}
    </svg>
  ),
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
        {/* Cover with abstract pattern */}
        {primaryLink ? (
          <a href={primaryLink} target="_blank" rel="noopener noreferrer">
            <div className="relative mb-4 overflow-hidden rounded-sm bg-paper-deep text-ink-faded">
              <div
                className={cn(
                  "flex items-center justify-center",
                  isWide ? "aspect-[16/9]" : "aspect-[4/3]"
                )}
              >
                <div
                  ref={imageRef}
                  className="absolute inset-0 flex items-center justify-center will-change-transform"
                >
                  <div className="h-3/4 w-3/4">
                    {PATTERNS[index % PATTERNS.length]}
                  </div>
                </div>
              </div>
            </div>
          </a>
        ) : (
          <div className="relative mb-4 overflow-hidden rounded-sm bg-paper-deep text-ink-faded">
            <div
              className={cn(
                "flex items-center justify-center",
                isWide ? "aspect-[16/9]" : "aspect-[4/3]"
              )}
            >
              <div
                ref={imageRef}
                className="absolute inset-0 flex items-center justify-center will-change-transform"
              >
                <div className="h-3/4 w-3/4">
                  {PATTERNS[index % PATTERNS.length]}
                </div>
              </div>
            </div>
          </div>
        )}

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
