import { resolve } from "node:path";
import { VOCABULARY_ITEMS } from "../src/vocabularies/catalog";
import type { CommentVocabularyItem } from "../../../packages/ui/src/comments/comment-vocabulary";

type Reader = () => readonly CommentVocabularyItem[];
const readers = new Map<string, Reader>();

export function registerCommentVocabulary(dir: string, reader: Reader) {
  const key = resolve(dir);
  if (readers.has(key)) throw new Error(`Vocabulary already registered for ${key}`);
  readers.set(key, reader);
  return () => { if (readers.get(key) === reader) readers.delete(key); };
}

/** Standalone stores use the bundled catalog; live servers install their directory registry. */
export function commentVocabularyItems(dir: string): readonly CommentVocabularyItem[] {
  const reader = readers.get(resolve(dir));
  return reader ? reader() : VOCABULARY_ITEMS;
}
