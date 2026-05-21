"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV_ITEMS = [
  { label: "projects", href: "/projects" },
  { label: "writing", href: "/writing" },
  { label: "now", href: "/now" },
  { label: "connect", href: "#connect" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleNavClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      // Handle hash links (like #connect) - smooth scroll on homepage
      if (href.startsWith("#")) {
        const sectionId = href.slice(1);

        if (pathname === "/") {
          e.preventDefault();
          const el = document.getElementById(sectionId);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }
        // On other pages, Link will navigate to /#connect
      }

      setMobileOpen(false);
    },
    [pathname]
  );

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-colors duration-300",
          scrolled
            ? "bg-paper/95 backdrop-blur-sm border-b border-terracotta/20"
            : "bg-transparent"
        )}
      >
        <nav
          className="mx-auto flex max-w-[1200px] items-center justify-between px-4 py-4 sm:px-6"
          aria-label="Main navigation"
        >
          <Link
            href="/"
            className="group relative font-display text-[1.5rem] font-medium tracking-[-0.01em]"
            style={{
              fontVariationSettings: "'opsz' 48, 'SOFT' 100, 'WONK' 1",
            }}
          >
            nana
            <span
              className="absolute bottom-0 right-0 h-[1px] w-[60%] bg-terracotta transition-all duration-200 ease-out group-hover:w-full"
              aria-hidden="true"
            />
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-8 md:flex">
            <ul className="flex items-center gap-8">
              {NAV_ITEMS.map((item) => (
                <li key={item.label}>
                  {item.href.startsWith("#") ? (
                    <a
                      href={pathname === "/" ? item.href : `/${item.href}`}
                      className="text-sm tracking-wide text-ink-soft transition-colors duration-200 hover:text-ink"
                      onClick={(e) => handleNavClick(e, item.href)}
                    >
                      {item.label}
                    </a>
                  ) : (
                    <Link
                      href={item.href}
                      className="text-sm tracking-wide text-ink-soft transition-colors duration-200 hover:text-ink"
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
            <ThemeToggle />
          </div>

          {/* Mobile hamburger */}
          <button
            className="relative z-50 flex h-10 w-10 items-center justify-center md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            <div className="flex w-5 flex-col gap-[5px]">
              <span
                className={cn(
                  "block h-[1.5px] w-full bg-ink transition-all duration-300",
                  mobileOpen && "translate-y-[3.25px] rotate-45"
                )}
              />
              <span
                className={cn(
                  "block h-[1.5px] w-full bg-ink transition-all duration-300",
                  mobileOpen && "-translate-y-[3.25px] -rotate-45"
                )}
              />
            </div>
          </button>
        </nav>
      </header>

      {/* Mobile overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 flex flex-col items-center justify-center bg-paper transition-opacity duration-300 md:hidden",
          mobileOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        )}
        aria-hidden={!mobileOpen}
      >
        <ul className="flex flex-col items-center gap-10">
          {NAV_ITEMS.map((item) => (
            <li key={item.label}>
              {item.href.startsWith("#") ? (
                <a
                  href={pathname === "/" ? item.href : `/${item.href}`}
                  className="font-display text-3xl font-light text-ink"
                  style={{
                    fontVariationSettings: "'opsz' 48, 'SOFT' 80, 'WONK' 1",
                  }}
                  onClick={(e) => handleNavClick(e, item.href)}
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  href={item.href}
                  className="font-display text-3xl font-light text-ink"
                  style={{
                    fontVariationSettings: "'opsz' 48, 'SOFT' 80, 'WONK' 1",
                  }}
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ul>
        <div className="mt-12">
          <ThemeToggle />
        </div>
      </div>
    </>
  );
}
