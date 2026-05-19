"use client";

import { Reveal } from "@/components/primitives/reveal";
import { profile } from "@/lib/profile";

export function About() {
  return (
    <section id="about" className="px-4 py-[min(12vh,96px)] sm:px-6 sm:py-[min(12vh,128px)]">
      <div className="mx-auto max-w-[680px]">
        <Reveal>
          <h2 className="font-display text-2xl font-normal tracking-[-0.02em] text-ink-faded mb-12">
            About
          </h2>
        </Reveal>

        <div className="space-y-6">
          {profile.bio.map((paragraph, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <p
                className={
                  i === 0
                    ? "text-lg leading-[1.7] text-ink first-letter:float-left first-letter:mr-2 first-letter:font-display first-letter:text-[3.5rem] first-letter:leading-[0.8] first-letter:text-terracotta"
                    : "text-base leading-[1.7] text-ink-soft"
                }
              >
                {paragraph}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
