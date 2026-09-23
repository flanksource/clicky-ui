import EditorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import JsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";

/**
 * Worker factory for `MonacoProvider`; Vite bundles each `?worker` import.
 * The kitchen sink only edits JSON/YAML, so it skips the TypeScript worker.
 */
export function getMonacoWorker(label: string): Worker {
  if (label === "json") return new JsonWorker();
  return new EditorWorker();
}
