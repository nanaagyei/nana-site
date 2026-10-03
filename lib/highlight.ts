import { createHighlighter, type Highlighter } from "shiki";

export type CodeLang = "bash" | "python" | "json" | "text";

const THEMES = { light: "github-light", dark: "github-dark-dimmed" } as const;

let highlighterPromise: Promise<Highlighter> | undefined;

function getHighlighter(): Promise<Highlighter> {
  highlighterPromise ??= createHighlighter({
    themes: [THEMES.light, THEMES.dark],
    langs: ["bash", "python", "json"],
  });
  return highlighterPromise;
}

/**
 * Highlights a trusted, build-time string into HTML. The output carries
 * `--shiki-light` / `--shiki-dark` variables so the site's dark-mode class
 * decides which one applies (see `.code-block` in globals.css).
 */
export async function highlightCode(
  code: string,
  lang: CodeLang,
): Promise<string> {
  if (lang === "text") {
    const escaped = code
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
    return `<pre class="shiki"><code>${escaped}</code></pre>`;
  }
  const highlighter = await getHighlighter();
  return highlighter.codeToHtml(code, {
    lang,
    themes: THEMES,
    defaultColor: false,
  });
}
