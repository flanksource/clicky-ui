import type { CommentVocabularyItem } from "../../../../packages/ui/src/comments/comment-vocabulary";

export type VocabularySnapshot = {
  revision: string;
  catalogs: VocabularyCatalog[];
  items: CommentVocabularyItem[];
};

export type VocabularyCatalog = { alias: string; slug: string; file: string; page: string; instructions: string; previewRevision: string };
