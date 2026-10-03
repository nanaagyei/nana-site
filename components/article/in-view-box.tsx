"use client";

import type { ReactNode } from "react";
import { useInView } from "@/components/article/use-in-view";

/**
 * Marks its subtree once it scrolls into view so CSS can start entrance motion.
 * `data-inview` is absent until hydration, so no-JavaScript readers see the final state.
 */
export function InViewBox({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const [ref, inView] = useInView<HTMLDivElement>(0.3);
  return (
    <div ref={ref} className={className} data-inview={inView ? "active" : "pending"}>
      {children}
    </div>
  );
}
