import type { ReactNode } from "react";
import { EventSourceFactoryContext, type EventSourceFactory } from "./event-source";

export interface EventSourceProviderProps {
  /** The factory every descendant SSE-opening hook will use. */
  value: EventSourceFactory;
  children?: ReactNode;
}

/**
 * Supplies the `EventSourceFactory` every SSE-opening hook in clicky-ui reads
 * through `useEventSourceFactory()` (./event-source). A host wraps its tree in
 * one of these to route those hooks' connections through its own transport;
 * without it, hooks use the browser's native `EventSource`.
 */
export function EventSourceProvider({ value, children }: EventSourceProviderProps) {
  return (
    <EventSourceFactoryContext.Provider value={value}>{children}</EventSourceFactoryContext.Provider>
  );
}
