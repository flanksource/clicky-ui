import { createHash } from "node:crypto";
import { globSync } from "node:fs";
import { readdir, readFile, realpath } from "node:fs/promises";
import { basename, dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import type { CommentVocabularyItem } from "../../../packages/ui/src/comments/comment-vocabulary";
import { readStaticExports, type MetadataGlob } from "./static-metadata";
import { liveSourceGraph } from "./production-source-graph";
import { sourceUrl, type SourceRoot } from "./source-roots";

export type VocabularySnapshot = {
  revision: string;
  catalogs: { alias: string; slug: string; file: string; page: string; instructions: string; previewRevision: string }[];
  items: CommentVocabularyItem[];
};
type Options = { roots: string[]; sourceRoots: readonly SourceRoot[]; pagesDir?: string };
type VocabularyPage = { file: string; root: string; slug: string; alias: string; instructions: string; items: CommentVocabularyItem[]; metadataFiles: Set<string> };
type DeclarationCache = { revision: string; files: Set<string>; globs: MetadataGlob[]; module: Record<string, unknown> };
const declarations = new Map<string, DeclarationCache>();

async function metadataRevision(files: Set<string>, globs: MetadataGlob[]): Promise<string> {
  const hash = createHash("sha256");
  for (const glob of globs) hash.update(glob.directory).update(glob.pattern).update(JSON.stringify(globSync(glob.pattern, { cwd: glob.directory }).sort()));
  for (const file of [...files].sort()) {
    hash.update(file);
    try { hash.update(await readFile(file)); }
    catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      hash.update("\0deleted");
    }
  }
  return hash.digest("hex");
}

async function readVocabulary(file: string, roots: readonly SourceRoot[]) {
  const key = JSON.stringify([file, roots.map(root => root.directory)]);
  const cached = declarations.get(key);
  if (cached && await metadataRevision(cached.files, cached.globs) === cached.revision) return cached;
  const files = new Set<string>();
  const globs: MetadataGlob[] = [];
  const module = readStaticExports({ file, roots: roots.map(root => root.directory), names: ["vocabulary"], onRead: file => files.add(file), onGlob: glob => globs.push(glob) });
  const entry = { module, files, globs, revision: await metadataRevision(files, globs) };
  declarations.set(key, entry);
  return entry;
}

async function pageSources(directory: string): Promise<string[]> {
  const files = await Promise.all((await readdir(directory, { withFileTypes: true })).map(async entry => {
    if (/^[._]/.test(entry.name) || ["node_modules", "dist"].includes(entry.name) || /\.(test|stories)\./.test(entry.name)) return [];
    const file = join(directory, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Vocabulary pages cannot traverse symbolic link ${file}`);
    if (entry.isDirectory()) return pageSources(file);
    return entry.isFile() && file.endsWith(".tsx") ? [file] : [];
  }));
  return files.flat().sort();
}

export function vocabularyDeclaration(value: unknown, file: string): { alias: string; instructions: string; items: CommentVocabularyItem[] } {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${file}: vocabulary must be an object`);
  const declaration = value as Record<string, unknown>;
  const { alias, instructions } = declaration;
  if (typeof alias !== "string" || !/^[a-z][a-z0-9-]*$/.test(alias)) throw new Error(`${file}: vocabulary alias must match /^[a-z][a-z0-9-]*$/`);
  if (typeof instructions !== "string" || !instructions.trim()) throw new Error(`${file}: vocabulary requires non-empty instructions`);
  if (!Array.isArray(declaration["items"]) || !declaration["items"].length) throw new Error(`${file}: vocabulary requires a non-empty items array`);
  const ids = new Set<string>();
  const items = declaration["items"].map((value: unknown): CommentVocabularyItem => {
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${file}: invalid vocabulary item`);
    const item = { ...value, catalog: alias } as Record<string, unknown>;
    for (const key of ["type", "id", "label", "description"]) if (typeof item[key] !== "string" || !item[key].trim()) throw new Error(`${file}: each item requires a non-empty ${key}`);
    if (!Array.isArray(item["references"]) || !item["references"].length || !item["references"].every(reference => typeof reference === "string" && reference.trim())) throw new Error(`${file}: each item requires non-empty references`);
    const key = `${alias}:${item["id"]}`;
    if (ids.has(key)) throw new Error(`${file}: Duplicate vocabulary item ${key}`);
    ids.add(key);
    return JSON.parse(JSON.stringify(item, (_key, entry: unknown) => {
      if (["function", "symbol", "bigint", "undefined"].includes(typeof entry) || (typeof entry === "number" && !Number.isFinite(entry))) throw new Error(`${file}: metadata must be JSON serializable`);
      return entry;
    })) as CommentVocabularyItem;
  });
  return { alias, instructions, items };
}

export async function vocabularyPages(options: Options): Promise<VocabularyPage[]> {
  const pages: VocabularyPage[] = [];
  const aliases = new Map<string, string>();
  const roots = [...new Set(await Promise.all(options.roots.map(root => realpath(root))))];
  const normal = options.pagesDir ? await realpath(options.pagesDir) : undefined;
  for (const root of [...roots, ...(normal && !roots.includes(normal) ? [normal] : [])]) {
    for (const file of await pageSources(root)) {
      if (pages.some(page => page.file === file)) continue;
      const { module, files: metadataFiles } = await readVocabulary(file, options.sourceRoots);
      if (!Object.hasOwn(module, "vocabulary")) continue;
      const declaration = vocabularyDeclaration(module["vocabulary"], file);
      const previous = aliases.get(declaration.alias);
      if (previous) throw new Error(`Duplicate vocabulary alias ${declaration.alias}: ${previous} and ${file}`);
      aliases.set(declaration.alias, file);
      pages.push({ ...declaration, root, file, metadataFiles, slug: normal && file.startsWith(normal + "/") ? relative(normal, file).slice(0, -4) : `vocabularies/${declaration.alias}` });
    }
  }
  return pages;
}

function displayFile(page: VocabularyPage): string {
  const parts = page.root.split("/");
  const src = parts.lastIndexOf("src");
  const prefix = src >= 0 ? parts.slice(src).join("/") : parts.includes("examples") ? parts.slice(Math.max(0, parts.lastIndexOf("examples") - 1)).join("/") : basename(page.root);
  return `${prefix}/${relative(page.root, page.file)}`;
}

async function installedVersions(): Promise<string[]> {
  return Promise.all(["@flanksource/clicky-ui", "@flanksource/facet"].map(async name => {
    let directory = dirname(fileURLToPath(import.meta.resolve(name)));
    while (true) {
      try {
        const manifest = JSON.parse(await readFile(join(directory, "package.json"), "utf8")) as { name?: string; version?: string };
        if (manifest.name === name) {
          if (!manifest.version) throw new Error(`Installed ${name} has no version`);
          return `${name}@${manifest.version}`;
        }
      } catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
      const parent = dirname(directory);
      if (parent === directory) throw new Error(`Cannot find installed version of ${name}`);
      directory = parent;
    }
  }));
}

export function directoryVocabulary(options: Options) {
  let snapshot: VocabularySnapshot | undefined;
  let files = new Map<string, string>();
  let failure: unknown;
  let pending: Promise<VocabularySnapshot> | undefined;
  const load = async (): Promise<VocabularySnapshot> => {
    const pages = await vocabularyPages(options);
    files = new Map(pages.map(page => [page.slug, page.file]));
    const versions = await installedVersions();
    const catalogs: VocabularySnapshot["catalogs"] = [];
    for (const page of pages) {
      const files = new Set(await liveSourceGraph({ root: page.root, files: [page.file], aliases: {}, libraryImports: [], sourceRoots: options.sourceRoots, allowedRoots: options.sourceRoots.map(root => root.directory) }));
      for (const file of page.metadataFiles) files.add(file);
      const hash = createHash("sha256").update(JSON.stringify(versions));
      for (const file of [...files].sort()) hash.update(file).update(await readFile(file));
      const previewRevision = hash.digest("hex").slice(0, 20);
      catalogs.push({ alias: page.alias, slug: page.slug, file: displayFile(page), page: `${sourceUrl(page.file, options.sourceRoots)}?vocabVersion=${previewRevision}`, instructions: page.instructions, previewRevision });
    }
    const items = pages.flatMap(page => page.items);
    const revision = createHash("sha256").update(JSON.stringify({ catalogs, items })).digest("hex").slice(0, 20);
    failure = undefined;
    if (snapshot?.revision === revision) return snapshot;
    snapshot = { revision, catalogs, items };
    return snapshot;
  };
  const current = () => {
    if (failure) throw failure;
    if (!snapshot) throw new Error("Vocabulary pages have not been loaded");
    return snapshot;
  };
  return {
    refresh() {
      pending ??= load().catch(cause => { failure = cause; throw cause; }).finally(() => { pending = undefined; });
      return pending;
    },
    items: () => current().items,
    instructions(alias: string) {
      const catalog = current().catalogs.find(catalog => catalog.alias === alias);
      if (!catalog) throw new Error(`Unknown vocabulary alias ${alias}`);
      return catalog.instructions;
    },
    /** The absolute file behind a vocabulary page slug, or undefined when no vocabulary page has that slug. */
    pageFile(slug: string): string | undefined {
      current();
      return files.get(slug);
    },
  };
}
