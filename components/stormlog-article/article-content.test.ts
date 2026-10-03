import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import { getPostBySlug, getPosts } from "@/lib/writing";
import { SECTIONS } from "./sections";

const DIR = path.join(process.cwd(), "components", "stormlog-article");
const SOURCES = ["sections-intro.tsx", "sections-core.tsx", "sections-deep.tsx"].map((f) =>
  fs.readFileSync(path.join(DIR, f), "utf-8"),
);
const ALL = SOURCES.join("\n");

// Visible text only: drop import lines and className strings so class names don't trip the checks.
const TEXT = ALL.replace(/^import .*$/gm, "").replace(/className="[^"]*"/g, "");

describe("stormlog explainer: structure", () => {
  it("registers a standalone post that the dynamic route skips", () => {
    const post = getPostBySlug("what-is-stormlog");
    expect(post?.standalone).toBe(true);
    expect(post?.readingTime).toMatch(/min read/);
    expect(getPosts().some((p) => p.slug === "what-is-stormlog")).toBe(true);
  });

  it("has unique section ids and renders every one exactly once", () => {
    const ids = SECTIONS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) {
      const uses = ALL.match(new RegExp(`sectionMeta\\("${id}"\\)`, "g")) ?? [];
      expect(uses, id).toHaveLength(1);
    }
  });

  it("only links in-page to sections that exist", () => {
    const ids = new Set<string>(SECTIONS.map((s) => s.id));
    for (const m of ALL.matchAll(/href="#([a-z0-9-]+)"/g)) {
      expect(ids.has(m[1] as string), m[1]).toBe(true);
    }
  });

  it("only links to on-site pages that exist", () => {
    const slugs = new Set(getPosts().map((p) => p.slug));
    for (const m of ALL.matchAll(/href="\/writing\/([a-z0-9-]+)"/g)) {
      expect(slugs.has(m[1] as string), m[1]).toBe(true);
    }
    for (const m of ALL.matchAll(/href="\/projects\/([a-z0-9-]+)"/g)) {
      expect(fs.existsSync(path.join(process.cwd(), "content", "projects", `${m[1]}.mdx`)), m[1]).toBe(true);
    }
  });
});

describe("stormlog explainer: writing rules", () => {
  const BANNED = [
    "fast-paced", "ever-evolving", "game-changer", "revolutionary", "unlock", "powerful",
    "seamless", "robust", "cutting-edge", "delve", "dive into", "journey", "at its core",
    "in the realm of", "stands out", "whether you", "here’s where", "here's where",
    "magic happens", "the future is", "worth noting", "important to note",
  ];

  it.each(BANNED)("avoids %s", (phrase) => {
    expect(TEXT.toLowerCase()).not.toContain(phrase);
  });

  it("avoids “real” as an intensifier and “flag” in prose", () => {
    expect(TEXT).not.toMatch(/\breal\b/i);
    expect(TEXT).not.toMatch(/\bflags?\b/i);
  });

  it("uses no em dashes", () => {
    expect(TEXT).not.toContain("—");
  });
});
