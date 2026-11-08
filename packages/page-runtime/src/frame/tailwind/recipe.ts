import { compile } from "tailwindcss";
import autoprefixer from "autoprefixer";
import postcss from "postcss";
import type { PageStylesRecipe } from "../../schema.ts";

export type { PageStylesRecipe };
export type LibraryStyles = {
  /** The recipe module's URL, used for loading only: it carries the requesting page and is not part of any cache key. */
  id: string;
  name: string;
  version: string;
  /** The recipe module's `lock.integrity` entry; absent for linked modules, which cannot key a cache. */
  integrity?: string;
  base: string;
  recipe: PageStylesRecipe;
};
export type CompilerLoaders = Required<Pick<NonNullable<Parameters<typeof compile>[1]>, "loadStylesheet" | "loadModule">>;
export const layerOrder = "@layer theme, base, facet, components, utilities;";

/** Deterministic library order: a library that is extended comes before its extender, and ties are sorted by name. */
export function orderLibraries(libraries: LibraryStyles[]): LibraryStyles[] {
  const byName = new Map(libraries.map((library) => [library.name, library]));
  const waiting = new Map<string, Set<string>>();
  for (const library of libraries) {
    const needs = new Set(library.recipe.extends ?? []);
    for (const name of needs) if (!byName.has(name)) throw new Error(`${library.name}/page-styles: extends ${name}, which is not a managed library`);
    waiting.set(library.name, needs);
  }
  const ordered: LibraryStyles[] = [];
  while (waiting.size) {
    const ready = [...waiting].filter(([, needs]) => needs.size === 0).map(([name]) => name).sort();
    if (!ready.length) throw new Error(`page-styles: libraries extend each other in a cycle: ${[...waiting.keys()].sort().join(", ")}`);
    const next = ready[0]!;
    ordered.push(byName.get(next)!);
    waiting.delete(next);
    for (const needs of waiting.values()) needs.delete(next);
  }
  return ordered;
}

/** Only the most-derived recipes compile: their presets already include the libraries they extend. */
function compiledLibraries(libraries: LibraryStyles[]): LibraryStyles[] {
  const extended = new Set(libraries.flatMap((library) => library.recipe.extends ?? []));
  return libraries.filter((library) => !extended.has(library.name));
}

export async function compileLibraries(options: { libraries: LibraryStyles[]; loaders: CompilerLoaders }) {
  const entries: Record<string, LibraryStyles> = {};
  const entry = compiledLibraries(options.libraries).map((library, index) => {
    const id = `page-runtime:recipe-${index}`;
    entries[id] = library;
    return `@import "${id}";`;
  });
  return compile([layerOrder, ...entry].join("\n"), {
    loadStylesheet: async (id, base) => {
      const library = entries[id];
      if (library) return { path: id, base: library.base, content: library.recipe.entry };
      return options.loaders.loadStylesheet(id, base);
    },
    loadModule: options.loaders.loadModule,
  });
}

export function transformCss(options: { css: string; libraries: LibraryStyles[] }): string {
  options.css = postcss([autoprefixer({ grid: false })]).process(options.css, { from: undefined }).css;
  for (const { recipe } of options.libraries) {
    if (recipe.transform) options.css = recipe.transform(options.css);
  }
  return options.css;
}

const strings = (value: unknown): value is string[] => Array.isArray(value) && value.every((item) => typeof item === "string");

export function validateRecipe(value: unknown, name: string): PageStylesRecipe {
  if (!value || typeof value !== "object") throw new Error(`${name}/page-styles: expected a recipe`);
  const recipe = value as PageStylesRecipe;
  if (recipe.name !== name || typeof recipe.layer !== "string" || !recipe.layer || typeof recipe.entry !== "string" || typeof recipe.theme !== "string" || !strings(recipe.base) || !recipe.base.length || recipe.base.some((specifier) => !specifier) || !strings(recipe.runtimeDependencies) || (recipe.extends !== undefined && !strings(recipe.extends)) || (recipe.transform !== undefined && typeof recipe.transform !== "function")) throw new Error(`${name}/page-styles: invalid recipe`);
  const imported = recipe.base.find((specifier) => recipe.entry.includes(specifier));
  if (imported) throw new Error(`${name}/page-styles: entry must not import the base stylesheet ${imported}`);
  return recipe;
}
