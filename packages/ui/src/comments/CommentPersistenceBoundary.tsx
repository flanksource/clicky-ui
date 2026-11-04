import { useState, useSyncExternalStore, type ReactNode } from "react";
import { copyText } from "../components/clipboard";
import { Context, createStore, type Store } from "./comment-persistence";

export function CommentPersistenceBoundary({
  scope,
  children,
}: {
  scope?: string;
  children: ReactNode;
}) {
  const [store] = useState(() => (scope ? createStore(scope) : null));
  return (
    <Context.Provider value={store}>
      {children}
      {store && <PersistenceError store={store} />}
    </Context.Provider>
  );
}

function PersistenceError({ store }: { store: Store }) {
  useSyncExternalStore(store.subscribe, () => store.version);
  const drafts = store.drafts();
  if (!store.error && drafts.length === 0) return null;
  return (
    <div className="fixed bottom-2 left-2 max-w-sm rounded border bg-background p-2 text-xs shadow">
      {store.error && (
        <p role="alert" data-comment-storage-error>
          {store.error}
        </p>
      )}
      {drafts.length > 0 && (
        <details>
          <summary>Saved drafts ({drafts.length})</summary>
          <p>
            Drafts remain available here if their original target disappears.
          </p>
          {drafts.map(({ key, body }) => (
            <div key={key} className="space-y-1 border-t py-2">
              <p className="whitespace-pre-wrap">{body}</p>
              <button type="button" onClick={() => void copyText(body)}>
                Copy draft
              </button>{" "}
              <button type="button" onClick={() => store.discardDraft(key)}>
                Discard draft
              </button>
            </div>
          ))}
        </details>
      )}
    </div>
  );
}
