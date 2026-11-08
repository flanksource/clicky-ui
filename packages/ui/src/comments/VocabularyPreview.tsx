import type { JSX, ReactNode } from "react";
import { cn } from "../lib/utils";
import { vocabularyAnchor, VOCABULARY_PREVIEW_ATTRIBUTE } from "./comment-vocabulary";

export function VocabularyPreview({ id, children, className }: { id: string; children: ReactNode; className?: string }): JSX.Element {
  return <div {...{ [VOCABULARY_PREVIEW_ATTRIBUTE]: id }} data-comment-anchor={vocabularyAnchor(id)} className={cn("inline-block max-w-full", className)}>{children}</div>;
}
