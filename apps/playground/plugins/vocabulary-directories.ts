import { createHash } from "node:crypto";
import { readdir, readFile, realpath, stat } from "node:fs/promises";
import { basename, join, resolve } from "node:path";
import type { CommentVocabularyItem } from "../../../packages/ui/src/comments/comment-vocabulary";
import type { VocabularySnapshot } from "../src/vocabularies/types";

type Source = { directory: string; catalog: string; preview: string };
type Options = { roots: string[]; loadModule: (file: string) => Promise<Record<string, unknown>>; invalidate: (files: string[]) => void };

async function sourceFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async entry => {
    if (/^[._]/.test(entry.name) || ["node_modules", "dist"].includes(entry.name) || /\.(test|stories)\./.test(entry.name)) return [];
    const file = join(directory, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Vocabulary directories cannot traverse symbolic link ${file}`);
    if (entry.isDirectory()) return sourceFiles(file);
    return entry.isFile() ? [file] : [];
  }));
  return files.flat().sort();
}

async function discover(roots: string[]) {
  const files: string[] = [];
  const sources: Source[] = [];
  for (const input of roots) {
    const root = await realpath(resolve(input));
    if (!(await stat(root)).isDirectory()) throw new Error(`Vocabulary root is not a directory: ${input}`);
    const found = await sourceFiles(root);
    files.push(...found);
    const direct = found.includes(join(root, "Preview.tsx"));
    const directories = direct ? [root] : (await readdir(root, { withFileTypes: true })).filter(entry => entry.isDirectory() && !/^[._]/.test(entry.name) && entry.name !== "node_modules").map(entry => join(root, entry.name));
    const before = sources.length;
    for (const directory of directories.sort()) {
      const catalog = join(directory, "catalog.ts");
      if (!found.includes(catalog)) continue;
      const preview = join(directory, "Preview.tsx");
      if (!found.includes(preview)) throw new Error(`Vocabulary catalog ${catalog} requires Preview.tsx`);
      sources.push({ directory, catalog, preview });
    }
    if (sources.length === before) throw new Error(`No vocabulary catalogs found in ${root}; expected <catalog>/catalog.ts and Preview.tsx`);
  }
  const hash = createHash("sha256");
  for (const file of [...new Set(files)].sort()) hash.update(file).update(await readFile(file));
  return { files, sources, revision: hash.digest("hex").slice(0, 20) };
}

function catalogItems(module: Record<string, unknown>, source: Source): CommentVocabularyItem[] {
  const arrays = [...new Set(Object.values(module).filter(Array.isArray))];
  if (arrays.length !== 1 || arrays[0]!.length === 0) throw new Error(`${source.catalog} must export one non-empty array of vocabulary items`);
  const items: CommentVocabularyItem[] = [];
  for (const value of arrays[0]!) {
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${source.catalog} contains an invalid vocabulary item`);
    const item = value as Record<string, unknown>;
    for (const key of ["catalog", "type", "id", "label", "description"]) {
      if (typeof item[key] !== "string" || !item[key].trim()) throw new Error(`${source.catalog}: each item requires a non-empty ${key}`);
    }
    if (item["catalog"] !== basename(source.directory)) throw new Error(`${source.catalog}: catalog must match its directory name ${basename(source.directory)}`);
    if (!Array.isArray(item["references"]) || !item["references"].length || !item["references"].every(reference => typeof reference === "string" && reference.trim())) throw new Error(`${source.catalog}: each item requires non-empty references`);
    items.push(JSON.parse(JSON.stringify(item, (_key, entry: unknown) => {
      if (["function", "symbol", "bigint", "undefined"].includes(typeof entry)) throw new Error(`${source.catalog}: metadata must be JSON serializable`);
      return entry;
    })) as CommentVocabularyItem);
  }
  return items;
}

export function directoryVocabulary(options: Options) {
  let snapshot: VocabularySnapshot | undefined;
  let failure: unknown;
  let pending: Promise<VocabularySnapshot> | undefined;
  const load = async (): Promise<VocabularySnapshot> => {
    const discovery = await discover(options.roots);
    if (!failure && discovery.revision === snapshot?.revision) return snapshot;
    options.invalidate(discovery.files);
    const items: CommentVocabularyItem[] = [];
    const catalogs: VocabularySnapshot["catalogs"] = [];
    const ids = new Set<string>();
    for (const source of discovery.sources) {
      const entries = catalogItems(await options.loadModule(source.catalog), source);
      const id = entries[0]!.catalog;
      if (catalogs.some(entry => entry.id === id)) throw new Error(`Duplicate vocabulary catalog ${id}`);
      for (const item of entries) {
        const key = `${item.catalog}:${item.id}`;
        if (ids.has(key)) throw new Error(`Duplicate vocabulary item ${key}`);
        ids.add(key);
        items.push(item);
      }
      catalogs.push({ id, preview: `/@fs${source.preview.split("/").map(encodeURIComponent).join("/")}?vocabVersion=${discovery.revision}` });
    }
    failure = undefined;
    snapshot = { revision: discovery.revision, items, catalogs };
    return snapshot;
  };
  return {
    refresh() {
      pending ??= load().catch(cause => { failure = cause; throw cause; }).finally(() => { pending = undefined; });
      return pending;
    },
    items() {
      if (failure) throw failure;
      if (!snapshot) throw new Error("Vocabulary directories have not been loaded");
      return snapshot.items;
    },
  };
}
