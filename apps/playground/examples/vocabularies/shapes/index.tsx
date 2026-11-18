import { VocabularyPreview, type VocabularyDeclaration } from "@flanksource/clicky-ui/comments";

export const vocabulary = {
  alias: "shapes",
  instructions: "This vocabulary describes diagram shapes. Read `shapes:shape/key` as a shape variant. Open the referenced example page to see the specimen. A request to use a reference means change to that shape; a reference identifying an existing diagram element describes its current shape. The decision diamond has separately labelled outcomes.",
  items: [{ type: "shape", id: "shape/decision", label: "Decision", description: "Use a diamond for a decision with separately labelled outcomes.", references: ["examples/vocabularies/shapes/index.tsx"], variant: "diamond" }],
} satisfies VocabularyDeclaration;

export const meta = { title: "Shapes vocabulary", description: "Decision shapes for diagrams." };

export default function ShapesVocabulary() {
  return <article className="space-y-4"><h1 className="text-xl font-semibold">{meta.title}</h1><h2 className="text-lg font-semibold">shape</h2>{vocabulary.items.map(item => <div key={item.id} className="flex flex-col items-start gap-4 sm:flex-row sm:items-center"><VocabularyPreview id={item.id}><svg viewBox="0 0 180 90" width="180" height="90" role="img" aria-label={item.label}><path d="M90 5 170 45 90 85 10 45Z" fill="none" stroke="currentColor" strokeWidth="2" /><text x="90" y="50" textAnchor="middle" fill="currentColor" fontSize="14">{item.label}</text></svg></VocabularyPreview><div><h3>{item.label}</h3><p>{item.description}</p></div></div>)}</article>;
}
