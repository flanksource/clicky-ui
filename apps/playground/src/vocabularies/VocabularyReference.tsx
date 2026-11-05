import { useVocabulary } from "./context";
import { VocabularyStatus } from "./VocabularyStatus";
export function VocabularyReference({ id }: { id: string }) {
  const { vocabulary, error } = useVocabulary();
  const item = vocabulary?.items.find(entry => `${entry.catalog}:${entry.id}` === id);
  return <main className="mx-auto max-w-2xl space-y-4 p-8"><header className="flex items-center justify-between"><a href="/" className="text-primary underline">Playground</a><VocabularyStatus /></header>
    {item && vocabulary ? <><h1 className="text-lg font-semibold">{item.id}</h1>{vocabulary.renderPreview(item)}<p>{item.description}</p>{item.references.map(ref => <p key={ref} className="break-all font-mono text-xs">{ref}</p>)}</> : !vocabulary ? <p role="status">{error !== null ? "Vocabulary reference unavailable. Open vocabulary status for details." : "Loading vocabulary reference…"}</p> : <p role="alert">Unknown vocabulary reference: {id}</p>}
  </main>;
}
