"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";

const ease = [0.16, 1, 0.3, 1] as const;

export function NotFoundScene() {
  const reduce = useReducedMotion();

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-6 py-24 text-center">
      <motion.div
        className="relative mb-10 flex h-44 w-32 items-center justify-center rounded-sm border border-paper-edge bg-paper-deep"
        initial={reduce ? false : { opacity: 0, y: 18, rotate: -10 }}
        animate={{ opacity: 1, y: 0, rotate: -3 }}
        transition={
          reduce
            ? { duration: 0 }
            : { type: "spring", stiffness: 100, damping: 18 }
        }
      >
        <span
          className="font-display text-5xl font-normal tracking-tight text-ink-faded"
          style={{
            fontVariationSettings: "'opsz' 72, 'SOFT' 80, 'WONK' 1",
          }}
        >
          404
        </span>
      </motion.div>

      <motion.h1
        className="font-display text-4xl font-normal tracking-tight"
        style={{
          fontVariationSettings: "'opsz' 72, 'SOFT' 80, 'WONK' 1",
        }}
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduce ? { duration: 0 } : { duration: 0.6, delay: 0.08, ease }}
      >
        Nothing here
      </motion.h1>

      <motion.p
        className="mt-4 max-w-[36ch] text-sm leading-relaxed text-ink-soft"
        initial={reduce ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduce ? { duration: 0 } : { duration: 0.55, delay: 0.16, ease }}
      >
        This page is missing, moved, or never existed. The rest of the site is
        still here.
      </motion.p>

      <motion.div
        className="mt-8 flex flex-wrap items-center justify-center gap-6"
        initial={reduce ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduce ? { duration: 0 } : { duration: 0.5, delay: 0.24, ease }}
      >
        <Link
          href="/"
          className="text-sm text-terracotta transition-colors duration-200 hover:text-ink"
        >
          back home
        </Link>
        <Link
          href="/projects"
          className="text-sm text-ink-faded transition-colors duration-200 hover:text-terracotta"
        >
          projects
        </Link>
        <Link
          href="/writing"
          className="text-sm text-ink-faded transition-colors duration-200 hover:text-terracotta"
        >
          writing
        </Link>
      </motion.div>
    </div>
  );
}
