"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Reveal } from "@/components/primitives/reveal";

gsap.registerPlugin(ScrollTrigger);

const NOW_DATA = {
  updated: "May 2026",
  reading: [
    { title: "Deep Learning", author: "Ian Goodfellow, Yoshua Bengio & Aaron Courville" },
    { title: "AI Engineering", author: "Chip Huyen" },
  ],
  building: [
    {
      title: "Stormlog",
      description: "GPU memory profiling for PyTorch & TensorFlow",
    },
    {
      title: "Gatewise",
      description: "Intelligent airport navigation for travelers",
    },
    {
      title: "RegexLens",
      description: "Interactive regex debugger with real-time visualization",
    },
  ],
  learning: [
    { title: "GPU profiling and CUDA optimization" },
    { title: "Deep learning fundamentals and theory" },
    { title: "Low-level memory management for ML workloads" },
  ],
};

function NowCard({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`shrink-0 rounded-sm border border-paper-edge bg-paper-deep p-6 ${className ?? ""}`}
    >
      <h3 className="mb-4 font-mono text-xs uppercase tracking-[0.08em] text-ink-faded">
        {title}
      </h3>
      {children}
    </div>
  );
}

function ReadingContent() {
  return (
    <ul className="space-y-3">
      {NOW_DATA.reading.map((item) => (
        <li key={item.title}>
          <span className="text-sm italic text-ink">{item.title}</span>
          <span className="block text-xs text-ink-faded">{item.author}</span>
        </li>
      ))}
    </ul>
  );
}

function BuildingContent() {
  return (
    <ul className="space-y-3">
      {NOW_DATA.building.map((item) => (
        <li key={item.title}>
          <span className="font-mono text-sm text-moss">{item.title}</span>
          <span className="block text-xs text-ink-faded">
            {item.description}
          </span>
        </li>
      ))}
    </ul>
  );
}

function LearningContent() {
  return (
    <ul className="space-y-3">
      {NOW_DATA.learning.map((item) => (
        <li key={item.title}>
          <span className="text-sm text-ink">{item.title}</span>
        </li>
      ))}
    </ul>
  );
}

export function Currently() {
  const sectionRef = useRef<HTMLElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!sectionRef.current || !scrollRef.current || !pinRef.current) return;

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (prefersReducedMotion) return;

      const mm = gsap.matchMedia();

      mm.add("(min-width: 768px)", () => {
        const scrollWidth =
          scrollRef.current!.scrollWidth - scrollRef.current!.clientWidth;

        if (scrollWidth <= 0) return;

        gsap.to(scrollRef.current, {
          x: -scrollWidth,
          ease: "none",
          scrollTrigger: {
            trigger: pinRef.current,
            start: "top 20%",
            end: () => `+=${scrollWidth}`,
            scrub: 1,
            pin: true,
          },
        });
      });

      return () => mm.revert();
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} id="currently" className="py-[min(12vh,128px)]">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <Reveal>
          <div className="mb-12 flex items-baseline justify-between">
            <h2 className="font-display text-2xl font-normal tracking-[-0.02em] text-ink-faded">
              Currently
            </h2>
            <span className="font-mono text-xs text-ink-faded">
              Updated {NOW_DATA.updated}
            </span>
          </div>
        </Reveal>
      </div>

      {/* Desktop: pinned horizontal scroll */}
      <div ref={pinRef} className="hidden overflow-hidden md:block">
        <div
          ref={scrollRef}
          className="flex gap-8 px-[max(1.5rem,calc((100vw-1200px)/2+1.5rem))]"
        >
          <NowCard title="Reading" className="min-w-[320px]">
            <ReadingContent />
          </NowCard>
          <NowCard title="Building" className="min-w-[320px]">
            <BuildingContent />
          </NowCard>
          <NowCard title="Learning" className="min-w-[320px]">
            <LearningContent />
          </NowCard>
        </div>
      </div>

      {/* Mobile: vertical stack */}
      <Reveal>
        <div className="grid gap-4 px-4 sm:px-6 md:hidden">
          <NowCard title="Reading">
            <ReadingContent />
          </NowCard>
          <NowCard title="Building">
            <BuildingContent />
          </NowCard>
          <NowCard title="Learning">
            <LearningContent />
          </NowCard>
        </div>
      </Reveal>
    </section>
  );
}
