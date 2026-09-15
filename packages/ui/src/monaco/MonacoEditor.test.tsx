import { render } from "@testing-library/react";
import { useEffect } from "react";
import { describe, expect, it, vi } from "vitest";
import { MonacoEditor } from "./MonacoEditor";
import { MonacoProvider } from "./MonacoProvider";

type FakeEditor = { getValue: () => string; setValue: (value: string) => void };

// Stands in for @monaco-editor/react's Editor: with keepCurrentModel it mounts
// onto the model already registered at `path`, which holds `modelText`.
const mounted: { editor?: FakeEditor } = {};
let modelText = "";

vi.mock("monaco-editor", () => ({}));
vi.mock("@monaco-editor/react", () => ({
  loader: { config: () => undefined },
  default: function FakeMonacoEditor({ onMount }: { onMount?: (editor: FakeEditor, monaco: unknown) => void }) {
    useEffect(() => {
      const editor: FakeEditor = {
        getValue: () => modelText,
        setValue: vi.fn((value: string) => {
          modelText = value;
        }),
      };
      mounted.editor = editor;
      onMount?.(editor, {});
    }, []);
    return null;
  },
}));

function mount(value: string, onMount = vi.fn()) {
  render(
    <MonacoProvider getWorker={() => ({}) as Worker}>
      <MonacoEditor value={value} onChange={vi.fn()} language="yaml" path="request.yaml" onMount={onMount} />
    </MonacoProvider>,
  );
  return onMount;
}

describe("MonacoEditor", () => {
  it("shows the current value when it remounts onto a kept model holding older text", () => {
    modelText = "user: before the form edit\n";

    const onMount = mount("user: after the form edit\n");

    expect(modelText).toBe("user: after the form edit\n");
    expect(onMount).toHaveBeenCalledWith(mounted.editor, {});
  });

  it("leaves a kept model that already matches untouched, preserving its undo history", () => {
    modelText = "user: unchanged\n";

    mount("user: unchanged\n");

    expect(mounted.editor?.setValue).not.toHaveBeenCalled();
  });
});
