import Image from "next/image";
import { GitHubIcon } from "@/components/primitives/icons";
import { cn } from "@/lib/utils";

type ProjectCoverProps = {
  src?: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
};

export function ProjectCover({
  src,
  alt,
  sizes = "(min-width: 768px) 40vw, 100vw",
  priority = false,
  className,
}: ProjectCoverProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-paper-deep text-ink-faded",
        className
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover object-top"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <GitHubIcon className="h-16 w-16 opacity-35 sm:h-20 sm:w-20" />
          <span className="sr-only">{alt}</span>
        </div>
      )}
    </div>
  );
}
