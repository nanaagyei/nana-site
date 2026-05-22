import type { Metadata } from "next";
import { SITE } from "./site";

export const OG_IMAGE = {
  url: "/images/screen-meta.png",
  width: 3840,
  height: 2080,
  alt: `${SITE.name} — ${SITE.description}`,
} as const;

export const socialImages = [OG_IMAGE];

export const defaultOpenGraph: NonNullable<Metadata["openGraph"]> = {
  title: SITE.name,
  description: SITE.description,
  url: SITE.url,
  siteName: SITE.mark,
  locale: "en_US",
  type: "website",
  images: socialImages,
};

export const defaultTwitter: NonNullable<Metadata["twitter"]> = {
  card: "summary_large_image",
  title: SITE.name,
  description: SITE.description,
  images: [OG_IMAGE.url],
};
