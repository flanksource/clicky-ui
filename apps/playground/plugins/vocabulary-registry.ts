import { resolve } from "node:path";
import type { CommentVocabularyItem } from "../../../packages/ui/src/comments/comment-vocabulary";

type Reader = { items(): readonly CommentVocabularyItem[]; instructions(alias: string): string; pageFile(slug: string): string | undefined };
const readers = new Map<string, Reader>();

export function registerCommentVocabulary(dir: string, reader: Reader) {
  const key = resolve(dir);
  if (readers.has(key)) throw new Error(`Vocabulary already registered for ${key}`);
  readers.set(key, reader);
  return () => { if (readers.get(key) === reader) readers.delete(key); };
}

export function commentVocabularyItems(dir: string): readonly CommentVocabularyItem[] {
  const reader = readers.get(resolve(dir));
  return reader ? reader.items() : [];
}

export function instructions(alias: string): string {
  const matches = [...readers.values()].filter(reader => reader.items().some(item => item.catalog === alias));
  if (matches.length !== 1) throw new Error(matches.length ? `Ambiguous vocabulary alias ${alias}` : `Unknown vocabulary alias ${alias}`);
  return matches[0]!.instructions(alias);
}

/** The file of a `vocabularies/<alias>` page, which lives in a vocabulary root rather than under src/pages. */
export function vocabularyPageFile(slug: string): string {
  const files = [...readers.values()].map(reader => reader.pageFile(slug)).filter((file): file is string => file !== undefined);
  if (files.length !== 1) throw new Error(files.length ? `Ambiguous vocabulary page ${slug}` : `Unknown vocabulary page ${slug}`);
  return files[0]!;
}
