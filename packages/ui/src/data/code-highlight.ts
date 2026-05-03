// Lazy-loaded wrapper around Shiki's `codeToHtml` shorthand
// (https://shiki.style/guide/shorthands). The shorthand handles per-language
// and per-theme grammar loading and in-memory caching itself, so this module
// only owns the singleton imports of `shiki` and `@shikijs/transformers` so
// we don't pay them more than once.

type ShikiModule = typeof import("shiki");
type ShikiTransformersModule = typeof import("@shikijs/transformers");
type ShikiTransformer = NonNullable<
  Parameters<ShikiModule["codeToHtml"]>[1]["transformers"]
>[number];

let shikiLoad: Promise<ShikiModule> | null = null;
let transformersLoad: Promise<ShikiTransformersModule> | null = null;

function loadShiki(): Promise<ShikiModule> {
  shikiLoad ??= import("shiki");
  return shikiLoad;
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

export async function highlightCode(
  source: string,
  opts: HighlightOptions,
): Promise<string | null> {
  if (!source || !opts.lang) return null;
  try {
    const { codeToHtml } = await loadShiki();
    return await codeToHtml(source, {
      lang: opts.lang,
      theme: opts.theme ?? "github-light",
      ...(opts.transformers ? { transformers: opts.transformers } : {}),
    });
  } catch {
    return null;
  }
}
