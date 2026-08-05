import EditorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import JsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import TsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";
import type { Monaco } from "@flanksource/clicky-ui/monaco";

/** Worker factory for `MonacoProvider`; Vite bundles each `?worker` import. */
export function getMonacoWorker(label: string): Worker {
  if (label === "typescript" || label === "javascript") return new TsWorker();
  if (label === "json") return new JsonWorker();
  return new EditorWorker();
}

/**
 * Teaches Monaco to parse TSX.
 *
 * Semantic validation is deliberately off. Loading the real type graph
 * (`react`, `@flanksource/clicky-ui`, the DOM lib) into the browser would cost
 * megabytes, and checking against a *partial* one is worse than not checking:
 * correct code picks up red squiggles for unresolvable imports, `React.ReactNode`
 * and every intrinsic JSX element, which trains you to ignore the editor.
 *
 * Syntax validation stays on, so unbalanced braces and malformed JSX are still
 * caught while typing. Authoritative type checking belongs to `tsc -b` and the
 * dev-server overlay, which sees the file the moment you save.
 */
export function configureTsx(monaco: Monaco): void {
  const ts = monaco.languages.typescript;

  ts.typescriptDefaults.setCompilerOptions({
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
    jsx: ts.JsxEmit.Preserve,
    allowNonTsExtensions: true,
    esModuleInterop: true,
    allowJs: true,
  });

  ts.typescriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: true,
    noSyntaxValidation: false,
    noSuggestionDiagnostics: true,
  });
}
