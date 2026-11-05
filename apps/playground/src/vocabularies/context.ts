import { createContext, useContext } from "react";
import type { CommentVocabulary } from "../../../../packages/ui/src/comments/comment-vocabulary";
import type { VocabularySnapshot } from "./types";

export type PreviewFailure = { error: Error; componentStack: string | null; catalog: string; item: string; module: string; revision: string };
export type VocabularyState = {
  vocabulary: CommentVocabulary | undefined;
  snapshot: VocabularySnapshot | null;
  error: unknown;
  refreshing: boolean;
  retry: () => void;
  failures: PreviewFailure[];
};
export const VocabularyContext = createContext<VocabularyState | null>(null);
export function useVocabulary() {
  const value = useContext(VocabularyContext);
  if (!value) throw new Error("Vocabulary consumers require VocabularyProvider");
  return value;
}
