import { createContext, useContext } from "react";
import type { CommentVocabulary } from "../../../../packages/ui/src/comments/comment-vocabulary";
import type { VocabularySnapshot } from "./types";
import type { PreviewIssue, VocabularyPreviews } from "./previews";

export type VocabularyState = {
  vocabulary: CommentVocabulary | undefined;
  snapshot: VocabularySnapshot | null;
  error: unknown;
  refreshing: boolean;
  retry: () => void;
  failures: PreviewIssue[];
  previews: VocabularyPreviews;
};
export const VocabularyContext = createContext<VocabularyState | null>(null);
export function useVocabulary() {
  const value = useContext(VocabularyContext);
  if (!value) throw new Error("Vocabulary consumers require VocabularyProvider");
  return value;
}
