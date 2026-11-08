import { useVocabulary } from "./context";
import { VocabularyStatus } from "./VocabularyStatus";
import { DensityProvider, Markdown } from "@flanksource/clicky-ui";
import { vocabularyAnchor } from "@flanksource/clicky-ui/comments";
import { VocabularyGenerationHost } from "./config";
export function VocabularyReference({ id }: { id: string }) {
  const { vocabulary, error, snapshot } = useVocabulary();
  const item = vocabulary?.items.find(entry => `${entry.catalog}:${entry.id}` === id);
  const catalog = snapshot?.catalogs.find(entry => entry.alias === item?.catalog);
  return <DensityProvider><VocabularyGenerationHost /><main className="mx-auto max-w-2xl space-y-4 p-8"><header className="flex items-center justify-between"><a href="/" className="text-primary underline">Playground</a><VocabularyStatus /></header>
    {item && vocabulary && catalog ? <><h1 className="text-lg font-semibold">{item.label}</h1><p className="font-mono text-xs">{item.catalog}:{item.id}</p>{vocabulary.renderPreview(item)}<p>{item.description}</p><Markdown text={catalog.instructions} /><h2 className="font-semibold">References</h2>{item.references.map(ref => <p key={ref} className="break-all font-mono text-xs">{ref}</p>)}<a className="text-primary underline" href={`?page=${encodeURIComponent(catalog.slug)}&anchor=${encodeURIComponent(vocabularyAnchor(item.id))}`}>Open in vocabulary page</a></> : !vocabulary ? <p role="status">{error !== null ? "Vocabulary reference unavailable. Open vocabulary status for details." : "Loading vocabulary reference…"}</p> : <p role="alert">Unknown vocabulary reference: {id}</p>}
  </main></DensityProvider>;
}
