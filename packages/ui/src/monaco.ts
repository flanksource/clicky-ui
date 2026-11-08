export { MonacoProvider } from "./monaco/MonacoProvider";
export { MonacoEditor } from "./monaco/MonacoEditor";
export {
  DocumentEditor,
  DocumentForm,
  DocumentRichEditor,
  type DocumentEditorProps,
  type DocumentFormProps,
  type DocumentRichEditorProps,
} from "./monaco/DocumentEditor";
export { documentParts } from "./monaco/document-source";
export { MonacoSchemaEditor } from "./monaco/MonacoSchemaEditor";
export { normalizeSchemaForMonaco } from "./monaco/schema-normalizer";
// `MonacoEditorProps.beforeMount`/`onMount` hand callers a `Monaco`, so the
// type has to be reachable for a consumer to annotate those callbacks.
export type { Monaco } from "@monaco-editor/react";
export type {
  MonacoEditorProps,
  MonacoProviderProps,
  MonacoSchemaEditorProps,
  MonacoValidationState,
  MonacoValidationStatus,
  MonacoWorkerFactory,
} from "./monaco/types";
