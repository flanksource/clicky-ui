import { useState } from "react";
import { ActionError, Button, DropdownMenu, StatusDot, useConfirm } from "@flanksource/clicky-ui";
import type { BackendConnection } from "../../plugins/connections-server";
import { RuntimeConfigurationDialog, RuntimeStatusSection } from "../browser-mode/RuntimeStatus";
import { useRuntimeRoute } from "../browser-mode/runtime-route";
import { useVocabulary } from "./context";
import { restartEndpoint, restartVerb, useBackendConnections } from "../useBackendConnections";
import { NAVIGATION_ROUTE } from "../navigation/types";

const MANAGEMENT_LABEL = { "on-demand": "Not running · the playground starts it when needed", external: "Run outside the playground" } as const;

/** `problemsError`: the navigation response could not attach repository lint counts. */
export function VocabularyStatus({ problemsError }: { problemsError?: string | undefined }) {
  const state = useVocabulary();
  const backends = useBackendConnections();
  const { confirm, dialog } = useConfirm();
  const [runtimeOpen, setRuntimeOpen] = useState(false);
  const [, setRuntimeTab] = useRuntimeRoute("tab");
  async function restartBackend(connection: BackendConnection, closeMenu: () => void) {
    if (connection.management === "playground") {
      // The open menu would float above the dialog (floating content clears the top modal), so it closes first.
      closeMenu();
      if (!(await confirm({
        title: `Restart ${connection.name}?`,
        message: `Stops the ${connection.name} server the playground started (pid ${connection.pid}) and starts it again from its binary, so a rebuild takes effect.`,
        warning: "Requests in progress on that server fail.",
        confirmLabel: "Restart",
        remember: { key: `playground.restart-${connection.name.toLowerCase()}` },
      }))) return;
    }
    await backends.restart(connection);
  }
  const unavailable = state.error !== null || backends.error !== null;
  const disconnected = backends.connections?.some(connection => connection.status === "disconnected");
  const incompatible = backends.connections?.some(connection => connection.status === "incompatible");
  const lintUnavailable = problemsError !== undefined;
  const restarting = backends.restarting;
  const restartFailed = backends.restartError;
  const loading = restarting !== null || (!unavailable && !disconnected && !incompatible && !lintUnavailable && (!state.snapshot || !backends.connections));
  const label = unavailable ? "Playground status: unavailable" : restarting ? `Playground status: ${restarting.verb === "Restart" ? "restarting" : "starting"} ${restarting.name}` : restartFailed ? `Playground status: could not ${restartFailed.verb.toLowerCase()} ${restartFailed.name}` : disconnected ? "Playground status: disconnected" : incompatible ? "Playground status: incompatible" : state.failures.length ? "Playground status: preview issues" : lintUnavailable ? "Playground status: lint counts unavailable" : loading ? "Playground status: loading" : "Playground status: ready";
  return <>{dialog}<RuntimeConfigurationDialog open={runtimeOpen} onClose={() => setRuntimeOpen(false)} /><DropdownMenu align="right" menuLabel="Playground status" menuClassName="w-[360px] max-w-[calc(100vw-24px)] max-h-[70dvh] overflow-auto [&_summary>div:last-child]:max-w-full [&_summary>div:last-child]:flex-wrap" trigger={
    <Button variant="ghost" size="icon" aria-label={label} title={label} className="shrink-0 [@media(pointer:coarse)]:size-11">
      <span aria-hidden="true">{loading && !unavailable ? <span className="inline-block size-2.5 rounded-full bg-muted-foreground/40" /> : <StatusDot size="md" status={unavailable || restartFailed || disconnected ? "error" : incompatible || state.failures.length || lintUnavailable ? "warning" : "success"} />}</span>
    </Button>
  }>{closeMenu => <div className="space-y-3 p-3 text-xs">
    {/* The open menu would float above the dialog, so it closes first (as for restarts). */}
    <RuntimeStatusSection onOpenConfiguration={tab => { closeMenu(); if (tab) setRuntimeTab(tab); setRuntimeOpen(true); }} />
    <h2 className="font-semibold">Connections</h2>
    {!backends.connections && backends.error === null && <p role="status" className="text-muted-foreground">Checking connections…</p>}
    {backends.connections?.map(connection => {
      const verb = restartVerb(connection);
      const failed = restartFailed?.name === connection.name ? restartFailed : null;
      return <div key={connection.name} className="space-y-1">
        <div className="flex items-center justify-between gap-3"><span className="font-medium">{connection.name}</span><span className="flex items-center gap-1.5"><StatusDot status={backends.error !== null || connection.status === "incompatible" ? "warning" : connection.status === "connected" ? "success" : "error"} />{backends.error !== null ? "Unknown" : connection.status === "connected" ? "Connected" : connection.status === "incompatible" ? "Incompatible" : "Disconnected"}</span></div>
        <p className="break-all text-muted-foreground">{connection.url}</p>
        <div className="flex items-center justify-between gap-3">
          <span className="text-muted-foreground">{connection.management === "playground" ? `Started by the playground · pid ${connection.pid}` : MANAGEMENT_LABEL[connection.management]}</span>
          {connection.management !== "external" && <Button size="sm" variant="outline" aria-label={`${verb} ${connection.name}`} disabled={restarting !== null} onClick={() => void restartBackend(connection, closeMenu)}>{restarting?.name === connection.name ? `${restarting.verb}ing…` : verb}</Button>}
        </div>
        {failed && <ActionError title={`Could not ${failed.verb.toLowerCase()} ${connection.name}`} error={failed.error} context={[["Operation", `${failed.verb} ${connection.name}`], ["Method", "POST"], ["Endpoint", restartEndpoint(connection.name)]]} />}
        {backends.error === null && connection.error && <ActionError title={`${connection.name} connection unavailable`} error={connection.error} context={[["Server", connection.url]]} />}
      </div>;
    })}
    {backends.error !== null && <ActionError title="Connection status unavailable" error={backends.error} context={[["Endpoint", "/__playground/connections"]]} />}
    <Button size="sm" variant="outline" disabled={backends.refreshing} onClick={backends.retry}>{backends.refreshing ? "Checking connections…" : "Refresh connections"}</Button>
    {lintUnavailable && <>
      <hr className="border-border" />
      <h2 className="font-semibold">Repository lint</h2>
      <ActionError title="Lint counts unavailable" error={problemsError} context={[["Endpoint", NAVIGATION_ROUTE]]} />
    </>}
    <hr className="border-border" />
    <h2 className="font-semibold">Comment vocabularies</h2>
    <p className="text-muted-foreground">{state.refreshing ? "Refreshing vocabularies…" : state.error !== null ? "Vocabulary selection is unavailable until loading succeeds." : state.snapshot ? "Vocabularies are ready." : "Loading vocabularies…"}</p>
    {state.snapshot?.catalogs.map(catalog => <div key={catalog.alias} className="space-y-1"><div className="flex justify-between gap-3"><a className="underline" href={`?page=${encodeURIComponent(catalog.slug)}`}>{catalog.alias}</a><span>{state.snapshot!.items.filter(item => item.catalog === catalog.alias).length} items{state.error !== null ? " · last loaded" : ""}</span></div><Button size="sm" variant="outline" aria-label={`Regenerate previews for ${catalog.alias}`} onClick={() => void state.previews.regenerate(catalog.alias)}>Regenerate previews</Button></div>)}
    {state.error !== null ? <ActionError title="Vocabulary loading failed" error={state.error} context={[["Operation", "Load comment vocabularies"], ["Method", "GET"], ["Endpoint", "/__playground/vocabularies"]]} actions={<Button size="sm" variant="outline" disabled={state.refreshing} onClick={state.retry}>{state.refreshing ? "Retrying…" : "Retry vocabulary loading"}</Button>} /> : <Button size="sm" variant="outline" disabled={state.refreshing} onClick={state.retry}>Refresh vocabularies</Button>}
    {state.failures.map(failure => <ActionError key={`${failure.alias}:${failure.message}`} title="Vocabulary preview issue" error={failure.message} context={[["Alias", failure.alias]]} />)}
  </div>}</DropdownMenu></>;
}
