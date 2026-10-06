import path from "path";
import { Font, StyleSheet } from "@react-pdf/renderer";

/** Print palette: the site's paper-and-ink tones, tuned for white paper and ink economy. */
export const COLOR = {
  ink: "#1d1814",
  soft: "#3b332c",
  faded: "#7a6f66",
  rule: "#d9d1c7",
  wash: "#f6f2ec",
  accent: "#a2432b",
  ochre: "#c58a1c",
} as const;

export const FONT = {
  serif: "Fraunces",
  sans: "InstrumentSans",
  mono: "SourceCodePro",
} as const;

const FONTS = path.join(process.cwd(), "node_modules", "@expo-google-fonts");

/** `name` like "400Regular" or "600SemiBold_Italic", as the package lays them out. */
function file(pkg: string, prefix: string, name: string) {
  return path.join(FONTS, pkg, name, `${prefix}_${name}.ttf`);
}

let registered = false;

/** Registers fonts once per process. Safe to call from every render. */
export function registerPdfFonts() {
  if (registered) return;
  registered = true;

  const family = (
    name: string,
    pkg: string,
    prefix: string,
    faces: [number, boolean][],
  ) =>
    Font.register({
      family: name,
      fonts: faces.map(([fontWeight, italic]) => {
        const label = { 400: "400Regular", 600: "600SemiBold", 700: "700Bold" }[fontWeight];
        return {
          src: file(pkg, prefix, `${label}${italic ? "_Italic" : ""}`),
          fontWeight,
          ...(italic ? { fontStyle: "italic" as const } : {}),
        };
      }),
    });

  const all: [number, boolean][] = [[400, false], [400, true], [600, false], [600, true], [700, false], [700, true]];
  family(FONT.serif, "fraunces", "Fraunces", all);
  family(FONT.sans, "instrument-sans", "InstrumentSans", all.filter(([w]) => w !== 700));
  family(FONT.mono, "source-code-pro", "SourceCodePro", [[400, false], [400, true], [600, false]]);

  // Hyphenating mid-word reads badly in a ragged-right column.
  Font.registerHyphenationCallback((word) => [word]);
}

/** Glyphs the bundled Latin subsets lack, mapped to the nearest plain equivalent. */
const GLYPH_MAP: Record<string, string> = {
  "─": "-",
  "━": "-",
  "│": "|",
  "┃": "|",
  "├": "|",
  "┌": "+",
  "┐": "+",
  "└": "`",
  "┘": "+",
  "┬": "+",
  "┴": "+",
  "┼": "+",
  "→": "->",
  "←": "<-",
  "↔": "<->",
  "⇒": "=>",
  "≤": "<=",
  "≥": ">=",
  "≈": "~",
  "×": "x",
  "✓": "ok",
  "✔": "ok",
  "✗": "x",
  "●": "•",
  "…": "...",
  " ": " ",
  " ": " ",
  " ": " ",
};

/** Keeps text inside what the embedded fonts can draw, so nothing renders as a blank box. */
export function pdfText(input: string, mono = false): string {
  let out = "";
  for (const ch of input) {
    const cp0 = ch.codePointAt(0) ?? 0;
    // Source Code Pro (the code face) draws box lines and arrows; the text faces don't.
    if (mono && ((cp0 >= 0x2190 && cp0 <= 0x21ff) || (cp0 >= 0x2500 && cp0 <= 0x257f))) {
      out += ch;
      continue;
    }
    const mapped = GLYPH_MAP[ch];
    if (mapped !== undefined) {
      out += mapped;
      continue;
    }
    const cp = ch.codePointAt(0) ?? 0;
    const ok =
      ch === "\n" ||
      ch === "\t" ||
      (cp >= 0x20 && cp <= 0x7e) ||
      (cp >= 0xa1 && cp <= 0x24f) ||
      (cp >= 0x2010 && cp <= 0x2027) ||
      cp === 0x20ac;
    if (ok) out += ch;
  }
  return out;
}

export const styles = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    color: COLOR.ink,
    fontFamily: FONT.serif,
    fontSize: 10.5,
    lineHeight: 1.6,
    paddingTop: 76,
    paddingBottom: 76,
    paddingHorizontal: 72,
  },
  running: {
    position: "absolute",
    fontFamily: FONT.sans,
    fontSize: 7.5,
    letterSpacing: 0.6,
    color: COLOR.faded,
  },
});
