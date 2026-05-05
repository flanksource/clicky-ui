// Lazy-loaded wrapper around a Shiki *core* highlighter pre-registered with a
// fixed language + theme set. The default `shiki` entry point bundles every
// grammar/theme as separate dynamic imports — Vite then code-splits each into
// its own chunk (~280 langs + 50 themes), even when only a handful are ever
// used. Switching to `shiki/core` and registering a curated subset cuts the
// app dist by ~6M and ~300 chunks.
//
// Languages are picked from what the renderer actually emits (Clicky code
// blocks + Java stack traces). Anything outside the list silently falls back
// to plain text — same behavior as before, just without paying for grammars
// nobody asked for.

import type { HighlighterCore, ThemeRegistrationAny } from "shiki/core";

type ShikiTransformersModule = typeof import("@shikijs/transformers");
type ShikiTransformer = NonNullable<
  Parameters<HighlighterCore["codeToHtml"]>[1]["transformers"]
>[number];

const SUPPORTED_LANGS = [
  "java",
  "go",
  "python",
  "javascript",
  "typescript",
  "tsx",
  "jsx",
  "json",
  "yaml",
  "bash",
  "shell",
  "sql",
  "xml",
  "html",
  "css",
] as const;

type SupportedLang = (typeof SUPPORTED_LANGS)[number];

const SUPPORTED_THEMES = ["github-light", "github-dark"] as const;
type SupportedTheme = (typeof SUPPORTED_THEMES)[number];
const DEFAULT_THEME: SupportedTheme = "github-light";

let highlighterLoad: Promise<HighlighterCore> | null = null;
let transformersLoad: Promise<ShikiTransformersModule> | null = null;

function loadHighlighter(): Promise<HighlighterCore> {
  highlighterLoad ??= (async () => {
    const [{ createHighlighterCore }, { createOnigurumaEngine }] = await Promise.all([
      import("shiki/core"),
      import("shiki/engine/oniguruma"),
    ]);
    return createHighlighterCore({
      themes: [
        import("@shikijs/themes/github-light") as Promise<{ default: ThemeRegistrationAny }>,
        import("@shikijs/themes/github-dark") as Promise<{ default: ThemeRegistrationAny }>,
      ],
      langs: [
        import("@shikijs/langs/java"),
        import("@shikijs/langs/go"),
        import("@shikijs/langs/python"),
        import("@shikijs/langs/javascript"),
        import("@shikijs/langs/typescript"),
        import("@shikijs/langs/tsx"),
        import("@shikijs/langs/jsx"),
        import("@shikijs/langs/json"),
        import("@shikijs/langs/yaml"),
        import("@shikijs/langs/bash"),
        import("@shikijs/langs/sql"),
        import("@shikijs/langs/xml"),
        import("@shikijs/langs/html"),
        import("@shikijs/langs/css"),
      ],
      engine: createOnigurumaEngine(import("shiki/wasm")),
    });
  })();
  return highlighterLoad;
}

export function loadShikiTransformers(): Promise<ShikiTransformersModule> {
  transformersLoad ??= import("@shikijs/transformers");
  return transformersLoad;
}

export type HighlightOptions = {
  lang: string;
  theme?: string;
  transformers?: ShikiTransformer[];
};

function resolveLang(input: string): SupportedLang | null {
  const lang = input.toLowerCase();
  if ((SUPPORTED_LANGS as readonly string[]).includes(lang)) return lang as SupportedLang;
  if (lang === "shell" || lang === "sh" || lang === "zsh") return "bash";
  if (lang === "ts") return "typescript";
  if (lang === "js") return "javascript";
  if (lang === "py") return "python";
  if (lang === "yml") return "yaml";
  return null;
}

function resolveTheme(input: string | undefined): SupportedTheme {
  if (input && (SUPPORTED_THEMES as readonly string[]).includes(input)) {
    return input as SupportedTheme;
  }
  return DEFAULT_THEME;
}

export async function highlightCode(
  source: string,
  opts: HighlightOptions,
): Promise<string | null> {
  if (!source || !opts.lang) return null;
  const lang = resolveLang(opts.lang);
  if (!lang) return null;
  try {
    const highlighter = await loadHighlighter();
    return highlighter.codeToHtml(source, {
      lang,
      theme: resolveTheme(opts.theme),
      ...(opts.transformers ? { transformers: opts.transformers } : {}),
    });
  } catch {
    return null;
  }
}
