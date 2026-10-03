"use client";

import { useEffect, useRef, useState } from "react";

type CopyState = "idle" | "copied" | "failed";

export function CopyButton({ text, label }: { text: string; label: string }) {
  const [state, setState] = useState<CopyState>("idle");
  const timer = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  async function copy() {
    let next: CopyState = "copied";
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      next = "failed";
    }
    setState(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), 2000);
  }

  return (
    <>
      <button
        type="button"
        onClick={copy}
        className="rounded-[3px] px-2 py-1 font-mono text-xs text-ink-faded transition-colors duration-150 hover:bg-paper-edge/60 hover:text-ink"
        aria-label={`Copy ${label} to clipboard`}
      >
        {state === "copied" ? "copied" : state === "failed" ? "copy failed" : "copy"}
      </button>
      <span className="sr-only" role="status" aria-live="polite">
        {state === "copied"
          ? `${label} copied to clipboard`
          : state === "failed"
            ? "Copy failed. Select the code and copy it manually."
            : ""}
      </span>
    </>
  );
}
