import { useState, useSyncExternalStore } from "react";
import { debugRuntimes, subscribeToDebugRuntimes } from "../../data/debugRuntime";
import { Tabs } from "../../layout/Tabs";

export function RuntimesTab() {
  const runtimes = useSyncExternalStore(subscribeToDebugRuntimes, debugRuntimes, debugRuntimes);
  const [selectedId, setSelectedId] = useState<string>();
  const selected = runtimes.find(runtime => runtime.id === selectedId) ?? runtimes[0];
  if (!selected) return <p className="p-density-6 text-center text-muted-foreground text-sm">No page runtimes are open. Open a Facet document or a Clicky UI page to inspect its build and requests.</p>;
  return <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
    <Tabs tabs={runtimes.map(runtime => ({ id: runtime.id, label: runtime.label }))} value={selected.id} onChange={setSelectedId} />
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden" key={selected.id}>{selected.content}</div>
  </div>;
}
