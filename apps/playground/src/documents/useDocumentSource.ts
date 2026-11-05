import { useCallback, useEffect, useRef, useState } from "react";
import type { PageSource } from "../editor/useSource";
import { documentError, documentJson, GAVEL_ROUTE, jsonBody, workspaceURL } from "./api";
import { reconcileDocument, type DocumentBuffer } from "./document-state";
import type { DocumentFile, DocumentLease, DocumentRepository } from "./types";
import { setDocumentDirty } from "./navigation-guard";

export type RepositorySource = PageSource & {
  repository?: DocumentRepository;
  revision?: string;
  live?: string;
  conflict?: boolean;
};
export function useDocumentSource(id: string | undefined): RepositorySource {
  const [state, setState] = useState<{
    id: string;
    buffer: DocumentBuffer;
    repository: DocumentRepository;
  }>();
  const [error, setError] = useState<Error | string | null>(null);
  const [saving, setSaving] = useState(false);
  const [live, setLive] = useState("Loading document…");
  const stateRef = useRef(state);
  stateRef.current = state;
  useEffect(() => {
    if (!id) return;
    let disposed = false;
    let lease: DocumentLease | undefined;
    let events: EventSource | undefined;
    let acquiring: Promise<void> | undefined;
    let lastRenewed = 0;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    let target: { repository: DocumentRepository; path: string } | undefined;
    setError(null);
    const fail = (cause: unknown) => {
      if (!disposed)
        setError(documentError(cause));
    };
    const reconcile = (file: DocumentFile) => {
      if (disposed || !target) return;
      const repository = target.repository;
      setState((current) => ({
        id,
        repository,
        buffer: reconcileDocument(
          current?.id === id ? current.buffer : null,
          file,
        ),
      }));
    };
    const release = () => {
      clearTimeout(timeout);
      events?.close();
      events = undefined;
      const previous = lease;
      lease = undefined;
      if (previous)
        void documentJson(`${GAVEL_ROUTE}/api/workspace/watch/${previous.id}`, {
          method: "DELETE",
          keepalive: true,
        }).catch(fail);
    };
    const armTimeout = () => {
      clearTimeout(timeout);
      if (lease)
        timeout = setTimeout(
          () => {
            release();
            if (!disposed)
              setLive("Live updates paused · resume by interacting");
          },
          Math.max(0, Date.parse(lease.expires) - Date.now()),
        );
    };
    const acquire = () =>
      (acquiring ??= (async () => {
        if (!target || disposed || document.hidden) return;
        const next = await documentJson<DocumentLease>(
          `${GAVEL_ROUTE}/api/workspace/watch`,
          jsonBody("POST", { root: target.repository.root, path: target.path }),
        );
        if (disposed || document.hidden) {
          void documentJson(`${GAVEL_ROUTE}/api/workspace/watch/${next.id}`, {
            method: "DELETE",
          }).catch(fail);
          return;
        }
        lease = next;
        lastRenewed = Date.now();
        reconcile(next.file);
        setError(null);
        setLive("Live updates active");
        armTimeout();
        events = new EventSource(
          `${GAVEL_ROUTE}/api/workspace/watch/${next.id}/stream`,
        );
        events.addEventListener("file", (event) => {
          reconcile(
            JSON.parse((event as MessageEvent<string>).data) as DocumentFile,
          );
          setError(null);
        });
        events.addEventListener("expired", () => {
          release();
          setLive("Live updates paused · resume by interacting");
        });
        events.addEventListener("file-error", (event) => {
          fail(JSON.parse((event as MessageEvent<string>).data).error);
          release();
          setLive("Live updates paused");
        });
        events.onerror = () => {
          release();
          if (!disposed) {
            setLive("Live updates disconnected · resume by interacting");
            setError("The file event stream disconnected");
          }
        };
      })()
        .catch(fail)
        .finally(() => {
          acquiring = undefined;
        }));
    const activity = (event: Event) => {
      if (!event.isTrusted) return;
      if (document.hidden || disposed) return;
      if (!lease) {
        void acquire();
        return;
      }
      if (Date.now() - lastRenewed < Math.min(3000, lease.idleMilliseconds / 3))
        return;
      lastRenewed = Date.now();
      const current = lease;
      void documentJson<DocumentLease>(
        `${GAVEL_ROUTE}/api/workspace/watch/${current.id}`,
        { method: "POST" },
      )
        .then((renewed) => {
          if (lease?.id !== current.id || disposed) return;
          lease = renewed;
          armTimeout();
        })
        .catch((cause: unknown) => {
          if (lease?.id !== current.id || disposed) return;
          release();
          setLive("Live updates disconnected · resume by interacting");
          fail(cause);
        });
    };
    const visibility = () => {
      if (document.hidden) {
        release();
        setLive("Live updates paused while tab is hidden");
      } else void acquire();
    };
    void documentJson<{ repository: DocumentRepository; path: string }>(
      `/__playground/documents/target?${new URLSearchParams({ id })}`,
    )
      .then(async (value) => {
        if (disposed) return;
        target = value;
        reconcile(
          await documentJson<DocumentFile>(
            workspaceURL("file", value.repository.root, value.path),
          ),
        );
        await acquire();
      })
      .catch(fail);
    for (const event of [
      "pointerdown",
      "keydown",
      "wheel",
      "touchstart",
    ] as const)
      window.addEventListener(event, activity, {
        capture: true,
        passive: true,
      });
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("pagehide", release);
    return () => {
      disposed = true;
      release();
      for (const event of [
        "pointerdown",
        "keydown",
        "wheel",
        "touchstart",
      ] as const)
        window.removeEventListener(event, activity, true);
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("pagehide", release);
    };
  }, [id]);
  const current = state?.id === id ? state : undefined;
  const dirty = current
    ? current.buffer.draft !== current.buffer.base.source
    : false;
  useEffect(() => {
    if (id) setDocumentDirty(id, dirty);
    return () => {
      if (id) setDocumentDirty(id, false);
    };
  }, [id, dirty]);
  useEffect(() => {
    if (!dirty) return;
    const unload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", unload);
    return () => {
      window.removeEventListener("beforeunload", unload);
    };
  }, [dirty]);
  const save = useCallback(async () => {
    const current = stateRef.current;
    if (!id || current?.id !== id) return false;
    setSaving(true);
    try {
      const file = await documentJson<DocumentFile>(
        `${GAVEL_ROUTE}/api/workspace/file`,
        jsonBody("PUT", {
          root: current.repository.root,
          path: current.buffer.base.path,
          revision: current.buffer.base.revision,
          source: current.buffer.draft,
        }),
      );
      setState((latest) =>
        latest?.id === id
          ? {
              ...latest,
              buffer: reconcileDocument({ ...latest.buffer, base: file }, file),
            }
          : latest,
      );
      setError(null);
      window.dispatchEvent(new Event("playground:documents-refresh"));
      return true;
    } catch (cause) {
      setError(documentError(cause));
      return false;
    } finally {
      setSaving(false);
    }
  }, [id]);
  return {
    draft: current?.buffer.draft ?? "",
    saved: current?.buffer.base.source ?? "",
    path: current
      ? `${current.repository.root}/${current.buffer.base.path}`
      : null,
    dirty,
    ready: Boolean(current),
    loading: Boolean(id) && !current,
    saving,
    error,
    save,
    live,
    ...(current
      ? {
          repository: current.repository,
          revision: current.buffer.base.revision,
          conflict: current.buffer.conflict,
        }
      : {}),
    setDraft: (draft) =>
      setState((value) =>
        value && value.id === id
          ? { ...value, buffer: { ...value.buffer, draft } }
          : value,
      ),
    revert: () => {
      setError(null);
      setState((value) =>
        value && value.id === id
          ? { ...value, buffer: reconcileDocument(null, value.buffer.disk) }
          : value,
      );
    },
  };
}
