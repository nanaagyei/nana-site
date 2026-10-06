import { getPostBySlug, getPosts } from "@/lib/writing";
import { renderArticlePdf } from "@/lib/pdf";

// Typeset once at build time; the file is then served like any other static asset.
export const dynamic = "force-static";
export const dynamicParams = false;

export async function generateStaticParams() {
  return getPosts()
    .filter((p) => !p.standalone)
    .map((p) => ({ slug: p.slug }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post || post.standalone) return new Response("Not found", { status: 404 });

  const pdf = await renderArticlePdf(post);

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${slug}.pdf"`,
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
