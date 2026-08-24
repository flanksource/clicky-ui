import { useEffect, useSyncExternalStore } from "react";
import { DebugClient } from "./debugClient";
import { debugStore, type DebugStore, type DebugStoreState } from "./debugStore";
import type { DebugLogLine, ExecutionSummary } from "./types";

/**
 * The console's live connection: one SSE stream carrying both records and log
 * lines.
 *
 * One stream, not two, because an HTTP/1.1 origin gets six connections and this
 * server already holds session streams on the same one. The frames are tagged,
 * so the split happens here rather than on the wire.
 */

export type UseDebugStreamOptions = {
  /** Off by default — a closed console must not hold a connection open. */
  enabled: boolean;
  client?: DebugClient | undefined;
  store?: DebugStore | undefined;
  /**
   * Builds the EventSource. Injected so a test can drive frames without a
   * server, and so a host with its own auth wrapper can supply one.
   */
  createEventSource?: ((url: string) => EventSource) | undefined;
};

export function useDebugStream(options: UseDebugStreamOptions): DebugStoreState {
  const store = options.store ?? debugStore;
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);

  useEffect(() => {
    if (!options.enabled) {
      store.setConnected(false);
      return;
    }
    const client = options.client ?? new DebugClient();
    const create = options.createEventSource ?? ((url: string) => new EventSource(url));
    const source = create(client.streamUrl(store.lastSequence()));

    const onRecord = (event: MessageEvent) => {
      const record = parse<ExecutionSummary>(event.data);
      if (record) store.addRecord(record);
    };
    const onLog = (event: MessageEvent) => {
      const line = parse<DebugLogLine>(event.data);
      if (line) store.addLog(line);
    };

    source.addEventListener("record", onRecord as EventListener);
    source.addEventListener("log", onLog as EventListener);
    source.onopen = () => store.setConnected(true);
    // EventSource reconnects on its own and resumes from Last-Event-ID, so this
    // reports the gap rather than tearing the stream down and rebuilding it.
    source.onerror = () => store.setConnected(false, "reconnecting to the devtools stream");

    return () => {
      source.removeEventListener("record", onRecord as EventListener);
      source.removeEventListener("log", onLog as EventListener);
      source.close();
      store.setConnected(false);
    };
  }, [options.enabled, options.client, options.createEventSource, store]);

  return state;
}

function parse<T>(data: string): T | null {
  try {
    return JSON.parse(data) as T;
  } catch {
    // A malformed frame is the server's bug, not a reason to drop the stream:
    // the next frame is very likely fine, and a console that went blank here
    // would hide every record that follows.
    return null;
  }
}
