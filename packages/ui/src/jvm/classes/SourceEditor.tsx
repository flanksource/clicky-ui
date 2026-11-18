import { lazy, Suspense } from "react";
import { Loading } from "../../components/loading";
import type { SourceEditorMonacoProps } from "./SourceEditorMonaco";

// The only path from the `/jvm` entry to Monaco: `import()` keeps the editor,
// `@monaco-editor/react` and `monaco-editor` out of its static graph, so a host
// that only reads decompiled source never loads them.
const SourceEditorMonaco = lazy(() => import("./SourceEditorMonaco"));

/** The patch editor, fetched the first time a class is edited. Needs a `MonacoProvider` from `/monaco` above it. */
export function SourceEditor(props: SourceEditorMonacoProps) {
  return (
    <Suspense fallback={<Loading />}>
      <SourceEditorMonaco {...props} />
    </Suspense>
  );
}
