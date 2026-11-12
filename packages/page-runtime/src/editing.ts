import { createContext, createElement, useContext, useSyncExternalStore, type ReactElement, type ReactNode } from "react";

const scope = globalThis as typeof globalThis & { __pageEditing?: { removed: Set<string>; listeners: Set<() => void> } };
const { removed, listeners } = scope.__pageEditing ??= { removed: new Set<string>(), listeners: new Set<() => void>() };
const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };

const reviewScope = createContext("");
export function EditingScope({ scope, children }: { scope: string; children: ReactNode }) { return createElement(reviewScope.Provider, { value: scope }, children); }

export function setRemoved(identity: string, value: boolean): void {
  if (value) removed.add(identity); else removed.delete(identity);
  for (const listener of listeners) listener();
}

function EditableBoundary({ identities, children }: { identities: string[]; children: ReactNode }) {
  const scope = useContext(reviewScope);
  return useSyncExternalStore(subscribe, () => identities.some(identity => removed.has(scope && identity.startsWith("review:") ? `review:${scope}:${identity.slice(7)}` : identity)), () => false) ? null : children;
}

export function editableElement(element: ReactElement<Record<string, unknown>>): ReactElement {
  const review = element.props["data-review-id"];
  const source = element.props["data-editable-source"] ?? element.props["data-source"];
  const identities = [...(typeof review === "string" ? [`review:${review}`] : []), ...(typeof source === "string" && source.includes("#") ? [`source:${source}`] : [])];
  return identities.length ? createElement(EditableBoundary, { identities, key: element.key, children: element }) : element;
}
