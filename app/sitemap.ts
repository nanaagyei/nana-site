import type { MetadataRoute } from "next";
import { getProjects } from "@/lib/projects";
import { getPosts } from "@/lib/writing";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const projects = getProjects().map((p) => ({
    url: `${SITE.url}/projects/${p.slug}`,
    lastModified: new Date(),
  }));

  const posts = getPosts().map((p) => ({
    url: `${SITE.url}/writing/${p.slug}`,
    lastModified: new Date(p.date),
  }));

  return [
    { url: SITE.url, lastModified: new Date() },
    { url: `${SITE.url}/projects`, lastModified: new Date() },
    { url: `${SITE.url}/writing`, lastModified: new Date() },
    { url: `${SITE.url}/now`, lastModified: new Date() },
    ...projects,
    ...posts,
  ];
}
