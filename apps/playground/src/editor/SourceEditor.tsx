import { useEffect, useRef } from "react";
import { cn } from "@flanksource/clicky-ui";
import { MonacoEditor, MonacoProvider, type Monaco } from "@flanksource/clicky-ui/monaco";
import type { editor } from "monaco-editor";

import { configureTsx, getMonacoWorker } from "./monaco-setup";
import type { PageSource } from "./useSource";

export type SourceEditorProps = {
  slug: string;
  source: PageSource;
  onClose: () => void;
};

export function SourceEditor({ slug, source, onClose }: SourceEditorProps) {
  const { draft, setDraft, dirty, ready, saving, error, save, revert } = source;

  // Monaco binds its ⌘S action once on mount, so route it through a ref that
  // always points at the current save closure.
  const saveRef = useRef(save);
  useEffect(() => {
    saveRef.current = save;
  }, [save]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "s" || !(event.metaKey || event.ctrlKey)) return;
      event.preventDefault();
      void saveRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleMount = (instance: editor.IStandaloneCodeEditor, monaco: Monaco) => {
    instance.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      void saveRef.current();
    });
  };

  return (
    <div className="flex h-full min-h-0 flex-col border-r border-border">
      <div className="flex shrink-0 items-center gap-2 border-b border-border px-density-3 py-density-2">
        <span className="truncate font-mono text-xs text-muted-foreground">
          src/pages/{slug}.tsx
        </span>
        {dirty && (
          <span
            title="Unsaved changes"
            aria-label="Unsaved changes"
            className="size-1.5 shrink-0 rounded-full bg-amber-500"
          />
        )}

        <div className="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={revert}
            disabled={!dirty || saving}
            className="rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40"
          >
            Revert
          </button>
          <button
            type="button"
            onClick={() => void save()}
            disabled={!dirty || saving}
            title="Save (⌘S)"
            className={cn(
              "rounded-md border px-2 py-1 text-xs font-medium transition-colors",
              dirty && !saving
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground",
              "disabled:opacity-40",
            )}
          >
            {saving ? "Saving…" : "Save"}
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close editor"
            className="rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            ✕
          </button>
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="shrink-0 border-b border-destructive/40 bg-destructive/10 px-density-3 py-density-2 text-xs text-destructive"
        >
          {error}
        </p>
      )}

      {!ready ? (
        <p className="p-density-3 text-xs text-muted-foreground">Loading source…</p>
      ) : (
        <div className="min-h-0 flex-1 [&>[data-slot=monaco-editor]]:h-full [&>[data-slot=monaco-editor]]:rounded-none [&>[data-slot=monaco-editor]]:border-0">
          <MonacoProvider getWorker={getMonacoWorker}>
            <MonacoEditor
              value={draft}
              onChange={setDraft}
              language="typescript"
              path={`file:///src/pages/${slug}.tsx`}
              height="100%"
              beforeMount={configureTsx}
              onMount={handleMount}
            />
          </MonacoProvider>
        </div>
      )}
    </div>
  );
}
