import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { useEffect, useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const fake = vi.hoisted(() => {
  const model = { getLineCount: () => 50, getLineMaxColumn: () => 80 };
  const state = {
    value: "",
    decorations: [] as Array<{ range: unknown; options: Record<string, unknown> }>,
    onMouseDown: undefined as ((event: { target: { position?: { lineNumber: number } } }) => void) | undefined,
  };
  const editor = {
    getValue: () => state.value,
    setValue: vi.fn(),
    getModel: () => model,
    getDomNode: () => document.createElement("div"),
    updateOptions: vi.fn(),
    createDecorationsCollection: vi.fn((decorations: typeof state.decorations) => {
      state.decorations = decorations;
      return { clear: vi.fn() };
    }),
    onMouseDown: vi.fn((callback: NonNullable<typeof state.onMouseDown>) => {
      state.onMouseDown = callback;
      return { dispose: vi.fn() };
    }),
    onDidScrollChange: vi.fn(() => ({ dispose: vi.fn() })),
    revealLineInCenter: vi.fn(),
    getTopForLineNumber: (line: number) => line * 20,
    getScrollTop: () => 0,
  };
  const registered: string[] = [];
  const monaco = {
    editor: { setModelMarkers: vi.fn(), ScrollType: { Smooth: 0, Immediate: 1 } },
    MarkerSeverity: { Error: 8, Warning: 4, Info: 2 },
    languages: {
      getLanguages: vi.fn(() => registered.map((id) => ({ id }))),
      register: vi.fn((language: { id: string }) => void registered.push(language.id)),
      setMonarchTokensProvider: vi.fn(),
      setLanguageConfiguration: vi.fn(),
    },
  };
  return { model, state, editor, monaco, registered, languages: [] as string[] };
});

vi.mock("monaco-editor", async () => (await import("../test/monaco-core.test-utils")).monacoCoreStub);
vi.mock("@monaco-editor/react", () => ({
  loader: { config: () => undefined },
  default: function FakeMonacoEditor({
    value,
    language,
    beforeMount,
    onMount,
  }: {
    value: string;
    language: string;
    beforeMount?: (monaco: typeof fake.monaco) => void;
    onMount?: (editor: typeof fake.editor, monaco: typeof fake.monaco) => void;
  }) {
    fake.state.value = value;
    // @monaco-editor/react runs beforeMount ahead of creating the model, so the
    // language an editor opens with has to be registered by then.
    const [created] = useState(() => {
      beforeMount?.(fake.monaco);
      fake.languages.push(language);
      return true;
    });
    void created;
    useEffect(() => {
      onMount?.(fake.editor, fake.monaco);
    }, []);
    return null;
  },
}));

import { MonacoProvider } from "../monaco/MonacoProvider";
import { AnnotatedCode } from "./AnnotatedCode";
import type { FileFinding } from "./types";

const FINDINGS: FileFinding[] = [
  {
    file: "pkg/a.go",
    line: 12,
    column: 3,
    severity: "warning",
    message: "Unused parameter",
    source: "golangci-lint",
    rule: "unparam",
    kind: "lint",
  },
  {
    file: "pkg/a.go",
    line: 30,
    column: 2,
    endLine: 34,
    endColumn: 5,
    severity: "error",
    message: "Test failed",
    source: "go test",
    rule: "TestA",
    kind: "test",
  },
];

function mount(props: Partial<React.ComponentProps<typeof AnnotatedCode>> = {}) {
  return render(
    <MonacoProvider getWorker={() => ({}) as Worker}>
      <AnnotatedCode path="pkg/a.go" workDir="/repo" source={"package a\n"} findings={FINDINGS} {...props} />
    </MonacoProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  fake.state.onMouseDown = undefined;
  fake.languages.length = 0;
  fake.registered.length = 0;
});

describe("AnnotatedCode", () => {
  it.each([
    ["web/src/App.tsx", "findings-typescript"],
    ["config/data.json", "findings-json"],
    ["pkg/a.go", "go"],
  ])("opens %s as %s, registered before the editor creates its model", async (path, language) => {
    mount({ path });

    await waitFor(() => expect(fake.languages).toEqual([language]));
    expect(fake.registered.includes(language)).toBe(language.startsWith("findings-"));
  });

  it("marks each finding's range, using the rest of the line when it has no end", async () => {
    mount();

    await waitFor(() => {
      expect(fake.monaco.editor.setModelMarkers).toHaveBeenCalledWith(fake.model, "findings", [
        {
          severity: 4,
          message: "Unused parameter",
          source: "golangci-lint",
          code: "unparam",
          startLineNumber: 12,
          startColumn: 3,
          endLineNumber: 12,
          endColumn: 80,
        },
        {
          severity: 8,
          message: "Test failed",
          source: "go test",
          code: "TestA",
          startLineNumber: 30,
          startColumn: 2,
          endLineNumber: 34,
          endColumn: 5,
        },
      ]);
    });
  });

  it("decorates the gutter and covered lines, with the message on hover", async () => {
    mount();

    await waitFor(() => expect(fake.state.decorations).toHaveLength(2));

    expect(fake.editor.updateOptions).toHaveBeenCalledWith({ glyphMargin: true });
    expect(fake.state.decorations[1]).toEqual({
      range: { startLineNumber: 30, startColumn: 1, endLineNumber: 34, endColumn: 1 },
      options: {
        isWholeLine: true,
        className: "bg-red-500/10",
        glyphMarginClassName: expect.stringContaining("bg-red-500"),
        glyphMarginHoverMessage: { value: "Test failed" },
      },
    });
  });

  it("lists the findings in a read-only rail", async () => {
    mount();

    const rail = await screen.findByTestId("comment-all-rail");

    expect(within(rail).getByText(/Unused parameter/)).toBeInTheDocument();
    expect(within(rail).getByText(/Test failed/)).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).toBeNull();
  });

  it("focuses the thread of a finding when a line inside its range is clicked", async () => {
    const onLineChange = vi.fn();
    mount({ onLineChange });
    await waitFor(() => expect(fake.state.onMouseDown).toBeDefined());

    fake.state.onMouseDown!({ target: { position: { lineNumber: 33 } } });

    const focused = await screen.findByTestId("comment-focused-rail");
    expect(within(focused).getByText(/Test failed/)).toBeInTheDocument();
    expect(within(focused).getByText("Attached to line 30")).toBeInTheDocument();
    expect(onLineChange).toHaveBeenCalledWith(30);
  });

  it("ignores a click on a line no finding covers", async () => {
    const onLineChange = vi.fn();
    mount({ onLineChange });
    await waitFor(() => expect(fake.state.onMouseDown).toBeDefined());

    fake.state.onMouseDown!({ target: { position: { lineNumber: 20 } } });

    expect(screen.queryByTestId("comment-focused-rail")).toBeNull();
    expect(onLineChange).not.toHaveBeenCalled();
  });

  it("reveals the requested line and focuses the finding that starts there", async () => {
    mount({ line: 12 });

    await waitFor(() => expect(fake.editor.revealLineInCenter).toHaveBeenCalledWith(12));
    const focused = await screen.findByTestId("comment-focused-rail");
    expect(within(focused).getByText(/Unused parameter/)).toBeInTheDocument();
  });

  it("reveals a line with no finding without opening a thread", async () => {
    mount({ line: 20 });

    await waitFor(() => expect(fake.editor.revealLineInCenter).toHaveBeenCalledWith(20));
    expect(screen.queryByTestId("comment-focused-rail")).toBeNull();
  });

  it("scrolls the editor to a thread's line when its card is clicked in the rail", async () => {
    mount();
    const cards = await screen.findAllByTestId("comment-feed-item");

    fireEvent.click(cards[1]!);

    expect(fake.editor.revealLineInCenter).toHaveBeenCalledWith(30, 0);
  });

  it("aligns the focused thread with the editor's position of its line", async () => {
    mount();
    await waitFor(() => expect(fake.state.onMouseDown).toBeDefined());

    fake.state.onMouseDown!({ target: { position: { lineNumber: 12 } } });

    const focused = await screen.findByTestId("comment-focused-rail");
    // getTopForLineNumber(12) = 240 and jsdom reports every rect at 0.
    await waitFor(() => expect(focused).toHaveStyle({ top: "240px" }));
  });
});
