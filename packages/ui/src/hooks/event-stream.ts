import type { EventSourceFactory } from "./event-source";

interface EventStreamOptions<T> {
  onData(value: T, id: string): void;
  messageEvent?: string;
  endEvent?: string;
  onInvalidMessage?(error: Error): void;
  onOpen?(): void;
  onEnd?(event: Event): void;
  onError(error: Error, terminal: boolean): void;
}

export function subscribeJSON<T>(open: EventSourceFactory, url: string, options: EventStreamOptions<T>): () => void {
  const source = open(url);
  let closed = false;
  function close() {
    if (closed) return;
    closed = true;
    source.close();
  }
  source.addEventListener("open", () => { if (!closed) options.onOpen?.(); });
  source.addEventListener(options.messageEvent ?? "message", event => {
    if (closed) return;
    const message = event as MessageEvent;
    let data: T;
    try {
      data = JSON.parse(message.data) as T;
    } catch (reason) {
      const error = new Error(`unparseable JSON ${options.messageEvent ?? "message"} frame: ${String(reason)}`);
      if (options.onInvalidMessage) options.onInvalidMessage(error);
      else {
        close();
        options.onError(error, true);
      }
      return;
    }
    try {
      options.onData(data, message.lastEventId);
    } catch (reason) {
      close();
      options.onError(reason instanceof Error ? reason : new Error(String(reason)), true);
    }
  });
  source.addEventListener(options.endEvent ?? "end", event => {
    if (closed) return;
    close();
    options.onEnd?.(event);
  });
  source.addEventListener("error", event => {
    if (closed) return;
    if (event instanceof MessageEvent) {
      close();
      let reason: Error;
      try {
        const { error } = JSON.parse(event.data) as { error?: unknown };
        if (typeof error !== "string" || !error) throw new Error("Invalid stream error event");
        reason = new Error(error);
      } catch (failure) {
        reason = failure instanceof Error ? failure : new Error(String(failure));
      }
      options.onError(reason, true);
      return;
    }
    const terminal = source.readyState === 2;
    if (terminal) close();
    const message = event instanceof ErrorEvent && event.message ? event.message : terminal ? "Stream closed" : "Connection lost. Reconnecting…";
    options.onError(new Error(message), terminal);
  });
  return close;
}
