import type { editor as MonacoEditorApi } from "monaco-editor";
import { useEffect, useState } from "react";
import type { Monaco } from "../../monaco";
import { MonacoEditor } from "../../monaco/MonacoEditor";
import type { SourceMarker } from "./source-markers";

const MARKER_OWNER = "jvm-compile";

export type SourceEditorMonacoProps = {
  value: string;
  onChange: (value: string) => void;
  /** Names the editor's model; one per class so switching classes keeps each draft apart. */
  path: string;
  markers: SourceMarker[];
  /** Scrolls to and focuses a 0-based row; pass a new object to repeat the same row. */
  reveal?: { row: number } | undefined;
  height?: string | number | undefined;
};

type Mounted = { editor: MonacoEditorApi.IStandaloneCodeEditor; monaco: Monaco };

/**
 * The Monaco-backed patch editor. Imported only through `SourceEditor`'s
 * `React.lazy`, which keeps `monaco-editor` out of the `/jvm` entry's static
 * graph; the host must render a `MonacoProvider` from `/monaco` above it.
 */
export default function SourceEditorMonaco({ value, onChange, path, markers, reveal, height = "60vh" }: SourceEditorMonacoProps) {
  const [mounted, setMounted] = useState<Mounted | null>(null);

  useEffect(() => {
    if (!mounted) return;
    const model = mounted.editor.getModel();
    if (!model) return;
    const { monaco } = mounted;
    const lineCount = model.getLineCount();
    monaco.editor.setModelMarkers(
      model,
      MARKER_OWNER,
      markers.map((marker) => {
        const line = Math.min(marker.line, lineCount);
        return {
          startLineNumber: line,
          endLineNumber: line,
          startColumn: marker.column > 0 ? marker.column : 1,
          endColumn: model.getLineMaxColumn(line),
          message: marker.message,
          severity: marker.severity === "error" ? monaco.MarkerSeverity.Error : monaco.MarkerSeverity.Warning,
        };
      }),
    );
  }, [mounted, markers, value]);

  // The model outlives the editor (keepCurrentModel), so its markers must not.
  useEffect(() => {
    if (!mounted) return;
    return () => {
      const model = mounted.editor.getModel();
      if (model) mounted.monaco.editor.setModelMarkers(model, MARKER_OWNER, []);
    };
  }, [mounted]);

  useEffect(() => {
    if (!mounted || !reveal) return;
    const lineNumber = reveal.row + 1;
    mounted.editor.setPosition({ lineNumber, column: 1 });
    mounted.editor.revealLineInCenter(lineNumber);
    mounted.editor.focus();
  }, [mounted, reveal]);

  return (
    <MonacoEditor
      value={value}
      onChange={onChange}
      language="java"
      path={path}
      height={height}
      onMount={(editor, monaco) => setMounted({ editor, monaco })}
    />
  );
}
