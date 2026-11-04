import type { CommentVocabularyItem } from "../../../../../packages/ui/src/comments/comment-vocabulary";
import { FACET_VOCABULARY } from "./catalog";
import { vocabularyExample } from "./specimens/vocabulary/vocabulary";
import { SampleContext } from "./specimens/vocabulary/sample-context";

export default function Preview({ item }: { item: CommentVocabularyItem }) {
  const definition = FACET_VOCABULARY.find(entry => entry.id === item.id);
  if (!definition) return <p role="alert">Preview unavailable: {item.id}</p>;
  if (["slot", "order", "link"].includes(item.type)) {
    return <div className="space-y-2 p-2"><svg width="160" height="72" viewBox="0 0 160 72" aria-label={item.id} className="text-primary">
      <rect x="4" y="4" width="152" height="64" rx="4" fill="none" stroke="currentColor" strokeDasharray="4 3" />
      <path d={item.type === "order" ? "M40 24H120M120 24V52M120 52L116 46M120 52L124 46" : "M48 40H112M106 36L112 40L106 44"} stroke="currentColor" fill="none" />
      <rect x="14" y="28" width="34" height="24" rx="3" fill="currentColor" opacity="0.3" /><rect x="112" y="28" width="34" height="24" rx="3" fill="currentColor" opacity="0.3" />
      <text x="10" y="17" fontSize="9" fill="currentColor">{item.id}</text>
    </svg><p className="text-xs">{item.description}</p></div>;
  }
  const Example = vocabularyExample(definition.section);
  return <SampleContext.Provider value={item.id}><div className="pointer-events-none w-[180px] overflow-hidden" style={{ zoom: 0.75 }}><Example /></div></SampleContext.Provider>;
}
