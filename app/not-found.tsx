import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-6">
      <h1
        className="font-display text-4xl font-normal tracking-tight"
        style={{
          fontVariationSettings: "'opsz' 72, 'SOFT' 80, 'WONK' 1",
        }}
      >
        Nothing here
      </h1>
      <Link
        href="/"
        className="mt-6 text-sm text-terracotta transition-colors duration-200 hover:text-ink"
      >
        back home
      </Link>
    </div>
  );
}
