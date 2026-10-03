import { highlightCode, type CodeLang } from "@/lib/highlight";
import { CopyButton } from "@/components/article/copy-button";

interface CodeBlockProps {
  code: string;
  lang: CodeLang;
  /** Small label in the header, such as a filename or "terminal". */
  label?: string;
  /** Accessible description when the label alone is not enough. */
  caption?: string;
}

export async function CodeBlock({ code, lang, label, caption }: CodeBlockProps) {
  const trimmed = code.replace(/^\n+|\n+$/g, "");
  const html = await highlightCode(trimmed, lang);

  return (
    <figure className="code-block my-6 overflow-hidden rounded-[4px] border border-paper-edge bg-paper-deep">
      <div className="flex items-center justify-between gap-3 border-b border-paper-edge px-3 py-1.5">
        <span className="truncate font-mono text-xs text-ink-faded">
          {label ?? lang}
        </span>
        <CopyButton text={trimmed} label={label ?? lang} />
      </div>
      <div
        className="code-block__body overflow-x-auto"
        // Focusable so keyboard users can scroll long lines.
        tabIndex={0}
        role="region"
        aria-label={`${label ?? lang} code`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {caption ? (
        <figcaption className="border-t border-paper-edge px-3 py-2 text-sm leading-relaxed text-ink-faded">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
