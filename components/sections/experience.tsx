"use client";

import { useState } from "react";
import { Reveal } from "@/components/primitives/reveal";
import { profile } from "@/lib/profile";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function Experience() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggle = (i: number) => {
    setExpandedIndex(expandedIndex === i ? null : i);
  };

  return (
    <section id="experience" className="px-4 py-[min(12vh,96px)] sm:px-6 sm:py-[min(12vh,128px)]">
      <div className="mx-auto max-w-[680px]">
        <Reveal>
          <h2 className="font-display text-2xl font-normal tracking-[-0.02em] text-ink-faded mb-12">
            Experience
          </h2>
        </Reveal>

        <div className="relative">
          {/* Timeline line */}
          <div
            className="absolute left-0 top-2 bottom-2 w-px bg-paper-edge"
            aria-hidden="true"
          />

          <div className="space-y-0">
            {profile.experience.map((role, i) => {
              const isExpanded = expandedIndex === i;

              return (
                <Reveal key={i} delay={i * 0.08}>
                  <button
                    onClick={() => toggle(i)}
                    className="group relative w-full pl-8 py-6 text-left"
                    aria-expanded={isExpanded}
                  >
                    {/* Timeline dot */}
                    <div
                      className={cn(
                        "absolute left-0 top-8 h-2 w-2 -translate-x-[3.5px] rounded-full border-2 transition-colors duration-200",
                        isExpanded || !role.end
                          ? "border-terracotta bg-terracotta"
                          : "border-paper-edge bg-paper"
                      )}
                      aria-hidden="true"
                    />

                    <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                      <div>
                        <h3 className="font-display text-lg font-normal tracking-tight">
                          {role.role}
                        </h3>
                        <p className="text-sm text-ink-soft">{role.company}</p>
                      </div>
                      <span className="shrink-0 font-mono text-xs text-ink-faded">
                        {formatDate(role.start)} &ndash;{" "}
                        {role.end ? formatDate(role.end) : "Present"}
                      </span>
                    </div>

                    {/* Expandable bullets */}
                    <div
                      className={cn(
                        "grid transition-[grid-template-rows] duration-300 ease-out",
                        isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                      )}
                    >
                      <div className="overflow-hidden">
                        <ul className="mt-4 space-y-2">
                          {role.bullets.map((bullet, j) => (
                            <li
                              key={j}
                              className="text-sm leading-relaxed text-ink-soft"
                            >
                              {bullet}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </button>
                </Reveal>
              );
            })}
          </div>
        </div>

        {/* Education */}
        <Reveal>
          <div className="mt-12 border-t border-paper-edge pt-8">
            <h3 className="font-display text-lg font-normal tracking-tight text-ink-faded mb-4">
              Education
            </h3>
            <div className="space-y-3">
              {profile.education.map((edu, i) => (
                <div
                  key={i}
                  className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between"
                >
                  <div>
                    <span className="text-sm text-ink">{edu.degree}</span>
                    <span className="text-sm text-ink-faded">
                      {" "}
                      &middot; {edu.school}
                    </span>
                  </div>
                  <span className="font-mono text-xs text-ink-faded">
                    {edu.year}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
