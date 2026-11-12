import { vocabularyHref, type CommentVocabulary, type CommentVocabularyItem } from "./comment-vocabulary";
import { HoverCard } from "../overlay/HoverCard";

export function VocabularyChip({ item, vocabulary }: { item: CommentVocabularyItem; vocabulary?: CommentVocabulary }) {
  return <HoverCard placement="top" trigger={
    <span tabIndex={0} className="inline-flex max-w-full items-center gap-1 rounded border border-border bg-muted px-1 align-middle text-xs" aria-label={item.id}>
      {vocabulary && <span aria-hidden className="pointer-events-none relative inline-flex h-5 w-8 overflow-hidden"><span className="absolute left-0 top-0 origin-top-left scale-[0.2]">{vocabulary.renderPreview(item)}</span></span>}
      <span>{item.label}</span>
    </span>
  }>
    <div className="max-w-80 space-y-2 p-2">
      {vocabulary?.renderPreview(item)}
      <strong className="text-xs">{item.id}</strong>
      <p className="text-xs">{item.description}</p>
      <a href={vocabularyHref(item)} target="_blank" rel="noreferrer" className="text-xs text-primary underline">Open reference</a>
      {item.references.map(reference => <div key={reference} className="break-all font-mono text-[10px] text-muted-foreground">{reference}</div>)}
    </div>
  </HoverCard>;
}
