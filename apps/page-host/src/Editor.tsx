import { MonacoEditor, MonacoProvider } from "@flanksource/clicky-ui/monaco";
import EditorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import TsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";
import JsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import CssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";

const getWorker = (label: string) => {
  if (label === "typescript" || label === "javascript") return new TsWorker();
  if (label === "json") return new JsonWorker();
  if (label === "css") return new CssWorker();
  return new EditorWorker();
};

export default function Editor({ path, source, onChange, projectId }: { path: string; source: string; onChange: (source: string) => void; projectId: string }) {
  const language = path.endsWith(".json") ? "json" : path.endsWith(".css") ? "css" : /\.mdx?$/.test(path) ? "markdown" : "typescript";
  return <MonacoProvider getWorker={getWorker}>
    <MonacoEditor path={`file:///${encodeURIComponent(projectId)}/${path}`} language={language} value={source} onChange={onChange} height="100%"
      onMount={(editor) => editor.updateOptions({ ariaLabel: "Source editor" })}
      beforeMount={(monaco) => monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({ noSemanticValidation: true, noSyntaxValidation: false })} />
  </MonacoProvider>;
}
