import type { CommentVocabularyItem } from "@flanksource/clicky-ui";

export default function Preview({ item }: { item: CommentVocabularyItem }) {
  if (item.id !== "shape/decision") throw new Error(`Unknown shape: ${item.id}`);
  return <svg viewBox="0 0 180 90" width="100%" height="90" role="img" aria-label={item.label}>
    <path d="M90 5 170 45 90 85 10 45Z" fill="none" stroke="currentColor" strokeWidth="2" />
    <text x="90" y="50" textAnchor="middle" fill="currentColor" fontSize="14">{item.label}</text>
  </svg>;
}
