import { useEffect, useMemo, useRef, useState } from "react";
import type { editor, Uri } from "monaco-editor";
import { Button } from "../components/button";
import { MonacoEditor, type Monaco } from "./MonacoEditor";
import { useMonacoWorkerFactory } from "./use-monaco-worker";
import { normalizeSchemaForMonaco } from "./schema-normalizer";
import { registerMonacoSchema } from "./schema-registry";
import type { MonacoSchemaEditorProps, MonacoValidationState } from "./types";

export function MonacoSchemaEditor(props: MonacoSchemaEditorProps) {
  const { value, language, path, schema, schemaUri, onValidationChange } = props;
  const [retry, setRetry] = useState(0);
  const workers = useMonacoWorkerFactory();
  const cleanup = useRef<(() => void) | undefined>(undefined);
  const markerCleanup = useRef<(() => void) | undefined>(undefined);
  const disposeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const initialValidationTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const model = useRef<editor.ITextModel | null>(null);
  const normalized = useMemo(() => normalizeSchemaForMonaco(schema), [schema]);

  useEffect(
    () => {
      if (disposeTimer.current) clearTimeout(disposeTimer.current);
      return () => {
        markerCleanup.current?.();
        cleanup.current?.();
        if (initialValidationTimer.current) clearTimeout(initialValidationTimer.current);
        const current = model.current;
        disposeTimer.current = setTimeout(() => current?.dispose(), 0);
      };
    },
    [],
  );
  useEffect(() => {
    onValidationChange(
      !normalized.schema
        ? {
            status: "unavailable",
            errors: [`Unsupported schema keywords: ${normalized.unsupportedKeywords.join(", ")}`],
          }
        : workers
        ? { status: "loading", errors: [] }
        : { status: "unavailable", errors: ["Monaco workers are not configured."] },
    );
  }, [value, retry, workers, onValidationChange, normalized.schema]);

  if (!workers) {
    return <Unavailable errors={["Monaco workers are not configured."]} onRetry={() => setRetry((n) => n + 1)} />;
  }

  if (!normalized.schema) {
    const errors = [`Unsupported schema keywords: ${normalized.unsupportedKeywords.join(", ")}`];
    return <Unavailable errors={errors} onRetry={() => setRetry((n) => n + 1)} />;
  }

  const setValidation = (markers: editor.IMarker[]) => {
    const current = model.current;
    if (!current) return;
    const version = current.getVersionId();
    queueMicrotask(() => {
      if (model.current?.getVersionId() !== version) return;
      // Monaco YAML reports JSON Schema violations (for example enum mismatches)
      // as warnings, while malformed YAML is reported as an error. Both mean the
      // document is not valid for submission; hints and informational markers do not.
      const errors = markers.filter((marker) => marker.severity >= 4).map((marker) => marker.message);
      onValidationChange({ status: errors.length > 0 ? "invalid" : "valid", errors });
    });
  };

  const prepare = (monaco: Monaco) => {
    cleanup.current?.();
    cleanup.current = registerMonacoSchema(monaco, language, path, schemaUri, normalized.schema!);
  };

  const mount = (instance: editor.IStandaloneCodeEditor, monaco: Monaco) => {
    if (disposeTimer.current) clearTimeout(disposeTimer.current);
    model.current = instance.getModel();
    markerCleanup.current?.();
    const disposable = monaco.editor.onDidChangeMarkers((uris: readonly Uri[]) => {
      const current = model.current;
      if (!current || !uris.some((uri) => uri.toString() === current.uri.toString())) return;
      setValidation(monaco.editor.getModelMarkers({ resource: current.uri }));
    });
    markerCleanup.current = () => disposable.dispose();
    // The language service doesn't emit a marker-change event when an initial
    // document is valid (the marker set starts and remains empty). Give the
    // worker its normal validation window, then explicitly complete that empty
    // result so forms cannot remain stuck in the loading state.
    initialValidationTimer.current = setTimeout(() => {
      const current = model.current;
      if (current) setValidation(monaco.editor.getModelMarkers({ resource: current.uri }));
    }, 1_500);
  };

  return (
    <MonacoEditor
      key={retry}
      {...props}
      beforeMount={(monaco) => {
        try {
          prepare(monaco);
        } catch (error) {
          onValidationChange({
            status: "unavailable",
            errors: [error instanceof Error ? error.message : String(error)],
          });
        }
      }}
      onMount={mount}
      onValidate={setValidation}
    />
  );
}

function Unavailable({ errors, onRetry }: { errors: string[]; onRetry: () => void }) {
  return (
    <div role="alert" className="space-y-2 rounded-md border border-destructive/40 p-3 text-sm text-destructive">
      <div>{errors.join("; ")}</div>
      <Button type="button" variant="outline" size="sm" onClick={onRetry}>Retry editor</Button>
    </div>
  );
}

export type { MonacoValidationState };
