import type { CommentVocabularyItem } from "../../../../packages/ui/src/comments/comment-vocabulary";

export type VocabularySnapshot = {
  revision: string;
  catalogs: { id: string; preview: string }[];
  items: CommentVocabularyItem[];
};
