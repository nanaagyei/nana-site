import { cn } from "@/lib/utils";

interface PillProps {
  children: React.ReactNode;
  variant?: "moss" | "default";
  className?: string;
}

export function Pill({ children, variant = "default", className }: PillProps) {
  return (
    <span
      className={cn(
        "inline-block rounded-full px-2.5 py-0.5 font-mono text-xs leading-relaxed",
        variant === "moss"
          ? "bg-moss/10 text-moss"
          : "bg-paper-edge/60 text-ink-faded",
        className
      )}
    >
      {children}
    </span>
  );
}
