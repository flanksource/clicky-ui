import { render } from "@testing-library/react";
import { useEffect } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { MonacoEditorProps } from "../../monaco/types";
import type { SourceMarker } from "./source-markers";
import SourceEditorMonaco from "./SourceEditorMonaco";

const LINES = ["package com.example.orders;", "", "public class OrderService {", "    double checkout() { return \"x\"; }", "}"];

const model = { getLineCount: () => LINES.length, getLineMaxColumn: (line: number) => (LINES[line - 1] ?? "").length + 1 };
const editor = {
  getModel: () => model,
  revealLineInCenter: vi.fn(),
  setPosition: vi.fn(),
  focus: vi.fn(),
};
const monaco = { editor: { setModelMarkers: vi.fn() }, MarkerSeverity: { Error: 8, Warning: 4 } };
let editorProps: MonacoEditorProps | undefined;

vi.mock("../../monaco/MonacoEditor", () => ({
  MonacoEditor: function FakeMonacoEditor(props: MonacoEditorProps) {
    editorProps = props;
    useEffect(() => props.onMount?.(editor as never, monaco as never), []);
    return <div data-testid="monaco" />;
  },
}));

const ERROR_MARKER: SourceMarker = { line: 4, column: 28, message: "incompatible types: String cannot be converted to double", severity: "error" };

beforeEach(() => {
  vi.clearAllMocks();
  editorProps = undefined;
});

function renderEditor(props: Partial<Parameters<typeof SourceEditorMonaco>[0]> = {}) {
  return render(<SourceEditorMonaco value={LINES.join("\n")} onChange={vi.fn()} path="com.example.orders.OrderService.java" markers={[]} {...props} />);
}

describe("SourceEditorMonaco", () => {
  it("edits java source at the class's model path and forwards every change", () => {
    const onChange = vi.fn();
    renderEditor({ onChange });
    expect(editorProps).toMatchObject({ language: "java", path: "com.example.orders.OrderService.java", value: LINES.join("\n") });
    expect(editorProps?.readOnly).toBeFalsy();
    editorProps?.onChange?.("changed");
    expect(onChange).toHaveBeenCalledWith("changed");
  });

  it("squiggles a diagnostic from its column to the end of its line", () => {
    renderEditor({ markers: [ERROR_MARKER] });
    expect(monaco.editor.setModelMarkers).toHaveBeenLastCalledWith(model, "jvm-compile", [
      {
        startLineNumber: 4,
        endLineNumber: 4,
        startColumn: 28,
        endColumn: LINES[3]!.length + 1,
        message: ERROR_MARKER.message,
        severity: monaco.MarkerSeverity.Error,
      },
    ]);
  });

  it("marks a diagnostic without a column from the start of its line and downgrades warnings", () => {
    renderEditor({ markers: [{ line: 1, column: 0, message: "[deprecation]", severity: "warning" }] });
    expect(monaco.editor.setModelMarkers).toHaveBeenLastCalledWith(model, "jvm-compile", [
      expect.objectContaining({ startColumn: 1, severity: monaco.MarkerSeverity.Warning }),
    ]);
  });

  it("clamps a diagnostic past the end of the text to the last line", () => {
    renderEditor({ markers: [{ ...ERROR_MARKER, line: 99 }] });
    expect(monaco.editor.setModelMarkers).toHaveBeenLastCalledWith(model, "jvm-compile", [
      expect.objectContaining({ startLineNumber: 5, endLineNumber: 5, endColumn: LINES[4]!.length + 1 }),
    ]);
  });

  it("replaces the markers when the diagnostics change and clears them on unmount", () => {
    const view = renderEditor({ markers: [ERROR_MARKER] });
    view.rerender(<SourceEditorMonaco value={LINES.join("\n")} onChange={vi.fn()} path="p.java" markers={[]} />);
    expect(monaco.editor.setModelMarkers).toHaveBeenLastCalledWith(model, "jvm-compile", []);
    monaco.editor.setModelMarkers.mockClear();
    view.unmount();
    expect(monaco.editor.setModelMarkers).toHaveBeenCalledWith(model, "jvm-compile", []);
  });

  it("scrolls to and focuses the 1-based line of a requested row", () => {
    renderEditor({ reveal: { row: 16 } });
    expect(editor.revealLineInCenter).toHaveBeenCalledWith(17);
    expect(editor.setPosition).toHaveBeenCalledWith({ lineNumber: 17, column: 1 });
    expect(editor.focus).toHaveBeenCalledOnce();
  });
});
