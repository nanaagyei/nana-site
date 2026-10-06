import { notFound } from "next/navigation";
import { renderStormlogPdf } from "@/lib/pdf/stormlog";
import { getPostBySlug } from "@/lib/writing";

const SLUG = "what-is-stormlog";

// Typeset once at build time, like the other article PDFs.
export const dynamic = "force-static";

export async function GET() {
  const post = getPostBySlug(SLUG);
  if (!post) notFound();

  const pdf = await renderStormlogPdf(post);

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${SLUG}.pdf"`,
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
