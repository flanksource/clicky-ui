import Editor, { loader, type Monaco } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { useResolvedTheme } from "../hooks/use-theme";
import { useMonacoWorkerFactory } from "./MonacoProvider";
import type { MonacoEditorProps } from "./types";

loader.config({ monaco });

export function MonacoEditor({
  value,
  onChange,
  language,
  path,
  height = "20rem",
  beforeMount,
  onMount,
  onValidate,
}: MonacoEditorProps) {
  const workers = useMonacoWorkerFactory();
  const theme = useResolvedTheme() === "dark" ? "vs-dark" : "light";

  if (!workers) {
    return <div role="alert" className="rounded-md border border-destructive/40 p-3 text-sm text-destructive">Monaco workers are not configured.</div>;
  }

  return (
    <div className="overflow-hidden rounded-md border border-input" data-slot="monaco-editor">
      <Editor
        value={value}
        onChange={(next) => onChange(next ?? "")}
        language={language}
        path={path}
        height={height}
        theme={theme}
        keepCurrentModel
        {...(beforeMount ? { beforeMount } : {})}
        {...(onMount
          ? { onMount: (instance, monacoInstance) => onMount(instance, monacoInstance) }
          : {})}
        {...(onValidate ? { onValidate } : {})}
        options={{
          automaticLayout: true,
          fontFamily: "var(--font-mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace)",
          fontSize: 13,
          lineHeight: 20,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          tabSize: 2,
          wordWrap: "on",
          quickSuggestions: { other: true, comments: true, strings: true },
        }}
      />
    </div>
  );
}

export type { Monaco };
