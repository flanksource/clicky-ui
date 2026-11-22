import { useState } from "react";
import { ActionError, Button, DropdownMenu, StatusDot } from "@flanksource/clicky-ui";
import { RuntimeConfigurationDialog, RuntimeStatusSection } from "../browser-mode/RuntimeStatus";
import { useRuntimeRoute } from "../browser-mode/runtime-route";
import { useVocabulary } from "./context";
import { useBackendConnections } from "../useBackendConnections";

export function VocabularyStatus() {
  const state = useVocabulary();
  const backends = useBackendConnections();
  const [runtimeOpen, setRuntimeOpen] = useState(false);
  const [, setRuntimeTab] = useRuntimeRoute("tab");
  const unavailable = state.error !== null || backends.error !== null;
  const disconnected = backends.connections?.some(connection => connection.status === "disconnected");
  const incompatible = backends.connections?.some(connection => connection.status === "incompatible");
  const loading = !unavailable && !disconnected && !incompatible && (!state.snapshot || !backends.connections);
  const label = unavailable ? "Playground status: unavailable" : disconnected ? "Playground status: disconnected" : incompatible ? "Playground status: incompatible" : state.failures.length ? "Playground status: preview issues" : loading ? "Playground status: loading" : "Playground status: ready";
  return <><RuntimeConfigurationDialog open={runtimeOpen} onClose={() => setRuntimeOpen(false)} /><DropdownMenu align="right" menuLabel="Playground status" menuClassName="w-[360px] max-w-[calc(100vw-24px)] max-h-[70dvh] overflow-auto [&_summary>div:last-child]:max-w-full [&_summary>div:last-child]:flex-wrap" trigger={
    <Button variant="ghost" size="icon" aria-label={label} title={label} className="shrink-0 [@media(pointer:coarse)]:size-11">
      <span aria-hidden="true">{loading && !unavailable ? <span className="inline-block size-2.5 rounded-full bg-muted-foreground/40" /> : <StatusDot size="md" status={unavailable || disconnected ? "error" : incompatible || state.failures.length ? "warning" : "success"} />}</span>
    </Button>
  }>{closeMenu => <div className="space-y-3 p-3 text-xs">
    {/* The open menu would float above the dialog, so it closes first. */}
    <RuntimeStatusSection onOpenConfiguration={tab => { closeMenu(); if (tab) setRuntimeTab(tab); setRuntimeOpen(true); }} />
    <h2 className="font-semibold">Connections</h2>
    {!backends.connections && backends.error === null && <p role="status" className="text-muted-foreground">Checking connections…</p>}
    {backends.connections?.map(connection => <div key={connection.name} className="space-y-1">
        <div className="flex items-center justify-between gap-3"><span className="font-medium">{connection.name}</span><span className="flex items-center gap-1.5"><StatusDot status={backends.error !== null || connection.status === "incompatible" ? "warning" : connection.status === "connected" ? "success" : "error"} />{backends.error !== null ? "Unknown" : connection.status === "connected" ? "Connected" : connection.status === "incompatible" ? "Incompatible" : "Disconnected"}</span></div>
        <p className="break-all text-muted-foreground">{connection.url}</p>
        {backends.error === null && connection.error && <ActionError title={`${connection.name} connection unavailable`} error={connection.error} context={[["Server", connection.url]]} />}
      </div>)}
    {backends.error !== null && <ActionError title="Connection status unavailable" error={backends.error} context={[["Endpoint", "/__playground/connections"]]} />}
    <Button size="sm" variant="outline" disabled={backends.refreshing} onClick={backends.retry}>{backends.refreshing ? "Checking connections…" : "Refresh connections"}</Button>
    <hr className="border-border" />
    <h2 className="font-semibold">Comment vocabularies</h2>
    <p className="text-muted-foreground">{state.refreshing ? "Refreshing vocabularies…" : state.error !== null ? "Vocabulary selection is unavailable until loading succeeds." : state.snapshot ? "Vocabularies are ready." : "Loading vocabularies…"}</p>
    {state.snapshot?.catalogs.map(catalog => <div key={catalog.alias} className="space-y-1"><div className="flex justify-between gap-3"><a className="underline" href={`?page=${encodeURIComponent(catalog.slug)}`}>{catalog.alias}</a><span>{state.snapshot!.items.filter(item => item.catalog === catalog.alias).length} items{state.error !== null ? " · last loaded" : ""}</span></div><Button size="sm" variant="outline" aria-label={`Regenerate previews for ${catalog.alias}`} onClick={() => void state.previews.regenerate(catalog.alias)}>Regenerate previews</Button></div>)}
    {state.error !== null ? <ActionError title="Vocabulary loading failed" error={state.error} context={[["Operation", "Load comment vocabularies"], ["Method", "GET"], ["Endpoint", "/__playground/vocabularies"]]} actions={<Button size="sm" variant="outline" disabled={state.refreshing} onClick={state.retry}>{state.refreshing ? "Retrying…" : "Retry vocabulary loading"}</Button>} /> : <Button size="sm" variant="outline" disabled={state.refreshing} onClick={state.retry}>Refresh vocabularies</Button>}
    {state.failures.map(failure => <ActionError key={`${failure.alias}:${failure.message}`} title="Vocabulary preview issue" error={failure.message} context={[["Alias", failure.alias]]} />)}
  </div>}</DropdownMenu></>;
}
