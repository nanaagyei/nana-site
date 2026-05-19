"use client";

import { useRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { profile } from "@/lib/profile";

gsap.registerPlugin(SplitText);

export function Hero() {
  const containerRef = useRef<HTMLElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!containerRef.current || !nameRef.current || !taglineRef.current || !metaRef.current) return;

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (prefersReducedMotion) return;

      document.fonts.ready.then(() => {
        const nameSplit = new SplitText(nameRef.current!, {
          type: "chars",
        });

        const taglineSplit = new SplitText(taglineRef.current!, {
          type: "words",
        });

        const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

        tl.set([nameSplit.chars, taglineSplit.words, metaRef.current], {
          opacity: 0,
          y: 20,
        });

        tl.to(nameSplit.chars, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.03,
        });

        tl.to(
          taglineSplit.words,
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.04,
          },
          "-=0.3"
        );

        tl.to(
          metaRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
          },
          "-=0.2"
        );
      });
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      className="flex min-h-[80vh] flex-col justify-end px-4 pb-12 pt-28 sm:min-h-[85vh] sm:px-6 sm:pb-24 sm:pt-32 md:min-h-[90vh]"
    >
      <div className="mx-auto w-full max-w-[1200px]">
        {/* Split name into first + last for controlled line breaks on mobile */}
        <h1
          ref={nameRef}
          className="font-display font-normal leading-[0.95] tracking-[-0.03em] text-[clamp(2.5rem,10vw,7rem)]"
          style={{
            fontVariationSettings: "'opsz' 144, 'SOFT' 80, 'WONK' 1",
          }}
        >
          <span className="block">Prince</span>
          <span className="block">Agyei Tuffour</span>
        </h1>

        <p
          ref={taglineRef}
          className="mt-4 max-w-[48ch] text-base leading-relaxed text-ink-soft sm:mt-6 sm:text-lg md:text-xl"
        >
          {profile.one_liner}
        </p>

        <div
          ref={metaRef}
          className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-faded sm:mt-8"
        >
          <span>{profile.location}</span>
          <span aria-hidden="true" className="hidden h-3 w-px bg-paper-edge sm:block" />
          <span>{profile.role}</span>
        </div>

        <div className="mt-12 text-xs tracking-[0.08em] uppercase text-ink-faded/60 sm:mt-24">
          scroll
        </div>
      </div>
    </section>
  );
}
