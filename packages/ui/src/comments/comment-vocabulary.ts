import type { ReactNode } from "react";

export type CommentVocabularyItem = {
  catalog: string;
  type: string;
  id: string;
  label: string;
  description: string;
  references: readonly string[];
};
export type VocabularyDeclarationItem = Omit<CommentVocabularyItem, "catalog"> & { readonly [field: string]: unknown };
export type VocabularyDeclaration = { alias: string; instructions: string; items: readonly VocabularyDeclarationItem[] };
export const VOCABULARY_PREVIEW_ATTRIBUTE = "data-vocabulary-preview";
export function vocabularyAnchor(id: string): string {
  return `vocabulary:${id}`;
}
export type CommentVocabulary = {
  items: readonly CommentVocabularyItem[];
  renderPreview: (item: CommentVocabularyItem) => ReactNode;
};
export type VocabularyChoice = { label: string; query?: string; item?: CommentVocabularyItem };
export function vocabularyHref(item: CommentVocabularyItem): string {
  return `/?vocabulary=${encodeURIComponent(`${item.catalog}:${item.id}`)}`;
}
export function vocabularyChoices(items: readonly CommentVocabularyItem[], query: string): VocabularyChoice[] {
  const q = query.toLowerCase().replace(/^lines(?=\/|$)/, "line");
  if (!q.includes("/")) {
    return [...new Set(items.map(item => item.type))].filter(type => type.includes(q))
      .map(type => ({ label: type, query: `${type}/` }));
  }
  return items.filter(item => `${item.id} ${item.label}`.toLowerCase().includes(q))
    .map(item => ({ label: item.label, item }));
}
/** Only Markdown links outside literal code resolve as selections. */
export function vocabularyReferences(body: string, items: readonly CommentVocabularyItem[]): CommentVocabularyItem[] {
  const found = new Map<string, CommentVocabularyItem>();
  const prose = body.replace(/```[\s\S]*?(?:```|$)|`[^`\n]*`/g, "");
  for (const match of prose.matchAll(/\[[^\]\n]*\]\((\/\?vocabulary=[^)\s]+)\)/g)) {
    const href = match[1]!;
    const item = items.find(candidate => vocabularyHref(candidate) === href);
    if (!item) throw new Error(`Unknown vocabulary reference: ${href}`);
    found.set(`${item.catalog}:${item.id}`, item);
  }
  return [...found.values()];
}
