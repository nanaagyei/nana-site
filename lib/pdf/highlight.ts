import { codeToTokens, type BundledLanguage } from "shiki";

export interface CodeToken {
  text: string;
  color?: string;
  italic?: boolean;
  bold?: boolean;
}

/** Highlights with a light theme so printed code stays legible; falls back to plain lines. */
export async function highlightForPrint(code: string, lang?: string | null): Promise<CodeToken[][]> {
  const plain = () => code.split("\n").map((line) => [{ text: line }]);
  if (!lang || lang === "text" || lang === "txt") return plain();

  try {
    const { tokens } = await codeToTokens(code, { lang: lang as BundledLanguage, theme: "github-light" });
    return tokens.map((line) =>
      line.map((t) => ({
        text: t.content,
        color: t.color,
        // shiki FontStyle bit flags: 1 italic, 2 bold
        italic: ((t.fontStyle ?? 0) & 1) === 1,
        bold: ((t.fontStyle ?? 0) & 2) === 2,
      })),
    );
  } catch {
    return plain();
  }
}
