import { PLAYGROUND_VOCABULARY } from "./config";
export function VocabularyReference({ id }: { id: string }) {
  const item = PLAYGROUND_VOCABULARY.items.find(entry => `${entry.catalog}:${entry.id}` === id);
  return <main className="mx-auto max-w-2xl space-y-4 p-8"><a href="/" className="text-primary underline">Playground</a>
    {item ? <><h1 className="text-lg font-semibold">{item.id}</h1>{PLAYGROUND_VOCABULARY.renderPreview(item)}<p>{item.description}</p>{item.references.map(ref => <p key={ref} className="break-all font-mono text-xs">{ref}</p>)}</> : <p role="alert">Unknown vocabulary reference: {id}</p>}
  </main>;
}
