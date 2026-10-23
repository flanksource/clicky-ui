import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { useEffect, useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Keep the Shiki dynamic imports out of jsdom (same approach as Markdown.test.tsx).
vi.mock("../data/code-highlight", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../data/code-highlight")>()),
  highlightCode: vi.fn(async () => null),
  highlightToLines: vi.fn(async () => null),
}));

const fake = vi.hoisted(() => {
  const model = { getLineCount: () => 50, getLineMaxColumn: () => 80 };
  const editor = {
    getValue: () => "",
    setValue: vi.fn(),
    getModel: () => model,
    getDomNode: () => document.createElement("div"),
    updateOptions: vi.fn(),
    createDecorationsCollection: vi.fn(() => ({ clear: vi.fn() })),
    onMouseDown: vi.fn(() => ({ dispose: vi.fn() })),
    onDidScrollChange: vi.fn(() => ({ dispose: vi.fn() })),
    revealLineInCenter: vi.fn(),
    getTopForLineNumber: (line: number) => line * 20,
    getScrollTop: () => 0,
  };
  const monaco = {
    editor: { setModelMarkers: vi.fn(), ScrollType: { Smooth: 0, Immediate: 1 } },
    MarkerSeverity: { Error: 8, Warning: 4, Info: 2 },
  };
  return { model, editor, monaco, props: [] as Array<{ language: string; path: string; value: string }> };
});

vi.mock("monaco-editor", async () => (await import("../test/monaco-core.test-utils")).monacoCoreStub);
vi.mock("@monaco-editor/react", () => ({
  loader: { config: () => undefined },
  default: function FakeMonacoEditor({
    value,
    language,
    path,
    onMount,
  }: {
    value: string;
    language: string;
    path: string;
    onMount?: (editor: typeof fake.editor, monaco: typeof fake.monaco) => void;
  }) {
    fake.props.push({ language, path, value });
    fake.editor.getValue = () => value;
    useEffect(() => {
      onMount?.(fake.editor, fake.monaco);
    }, []);
    return <div data-testid="fake-monaco">{value}</div>;
  },
}));

import { MonacoProvider } from "../monaco/MonacoProvider";
import { FileFindingsView } from "./FileFindingsView";
import type { FileFinding, FileRef, FindingsViewMode } from "./types";

const WORK_DIR = "/repo/gavel";

function finding(file: string, line: number, severity: FileFinding["severity"], message: string): FileFinding {
  return { file, workDir: WORK_DIR, line, severity, message, source: "golangci-lint", rule: "rule", kind: "lint" };
}

const FINDINGS: FileFinding[] = [
  finding("pkg/server/handler.go", 41, "error", "Error return value is not checked"),
  finding("pkg/server/handler.go", 88, "warning", "Unused parameter"),
  finding("docs/guide.md", 3, "warning", "Line too long"),
];

const FILES: Record<string, string> = {
  "pkg/server/handler.go": "package server\n",
  "docs/guide.md": "# Guide\n\nA long line.\n",
};

function Harness({
  loadFile,
  initialFile = null,
  initialView = "rendered",
  onViewChange,
  onSelectFile,
}: {
  loadFile: (file: FileRef) => Promise<string>;
  initialFile?: FileRef | null;
  initialView?: FindingsViewMode;
  onViewChange?: (view: FindingsViewMode) => void;
  onSelectFile?: (file: FileRef) => void;
}) {
  const [file, setFile] = useState<FileRef | null>(initialFile);
  const [view, setView] = useState<FindingsViewMode>(initialView);
  const [line, setLine] = useState<number | undefined>(undefined);
  return (
    <MonacoProvider getWorker={() => ({}) as Worker}>
      <FileFindingsView
        findings={FINDINGS}
        selectedFile={file}
        onSelectFile={(next) => {
          onSelectFile?.(next);
          setFile(next);
        }}
        line={line}
        onLineChange={setLine}
        view={view}
        onViewChange={(next) => {
          onViewChange?.(next);
          setView(next);
        }}
        loadFile={loadFile}
      />
    </MonacoProvider>
  );
}

const readFile = (file: FileRef) => Promise.resolve(FILES[file.file]!);

beforeEach(() => {
  vi.clearAllMocks();
  fake.props.length = 0;
});

describe("FileFindingsView", () => {
  it("lists the files with findings, with per-severity counts, and asks to open a clicked file", async () => {
    const onSelectFile = vi.fn();
    render(<Harness loadFile={readFile} onSelectFile={onSelectFile} />);

    // Single-child folders are folded into their file's row.
    const row = await screen.findByText("pkg > server > handler.go");
    expect(screen.getByText("docs > guide.md")).toBeInTheDocument();
    expect(screen.getAllByTitle("1 error")).toHaveLength(1);
    expect(screen.getAllByTitle("1 warning")).toHaveLength(2);
    expect(screen.getByText("Select a file to see its findings in context.")).toBeInTheDocument();

    fireEvent.click(row);

    expect(onSelectFile).toHaveBeenCalledWith({ workDir: WORK_DIR, file: "pkg/server/handler.go" });
  });

  it("loads the open file and shows code in the editor with its markers", async () => {
    let finishLoading!: (text: string) => void;
    const loadFile = vi.fn(() => new Promise<string>((resolve) => (finishLoading = resolve)));
    render(<Harness loadFile={loadFile} initialFile={{ workDir: WORK_DIR, file: "pkg/server/handler.go" }} />);

    expect(await screen.findByText("Loading pkg/server/handler.go")).toBeInTheDocument();
    finishLoading("package server\n");
    await waitFor(() => expect(screen.getByTestId("fake-monaco")).toHaveTextContent("package server"));

    expect(loadFile).toHaveBeenCalledWith({ workDir: WORK_DIR, file: "pkg/server/handler.go" });
    expect(fake.props.at(-1)?.language).toBe("go");
    await waitFor(() => {
      expect(fake.monaco.editor.setModelMarkers).toHaveBeenCalledWith(
        fake.model,
        "findings",
        expect.arrayContaining([expect.objectContaining({ startLineNumber: 41 })]),
      );
    });
    expect(screen.queryByRole("tablist", { name: "Markdown view" })).toBeNull();
  });

  it("shows the whole load error, not a summary of it", async () => {
    const loadFile = () => Promise.reject(new Error("GET /api/file: 404 file not found: pkg/server/handler.go"));
    render(<Harness loadFile={loadFile} initialFile={{ workDir: WORK_DIR, file: "pkg/server/handler.go" }} />);

    const alert = await screen.findByRole("alert");

    expect(alert).toHaveTextContent("Could not load pkg/server/handler.go");
    expect(alert).toHaveTextContent("GET /api/file: 404 file not found: pkg/server/handler.go");
  });

  it("renders a markdown file with its findings and switches to the editor on request", async () => {
    const onViewChange = vi.fn();
    render(
      <Harness
        loadFile={readFile}
        initialFile={{ workDir: WORK_DIR, file: "docs/guide.md" }}
        onViewChange={onViewChange}
      />,
    );

    expect(await screen.findByRole("heading", { level: 1, name: "Guide" })).toBeInTheDocument();
    expect(await screen.findByText(/Line too long/)).toBeInTheDocument();
    expect(screen.queryByTestId("fake-monaco")).toBeNull();

    fireEvent.click(screen.getByRole("tab", { name: "Source" }));

    expect(onViewChange).toHaveBeenCalledWith("source");
    await waitFor(() => expect(screen.getByTestId("fake-monaco")).toHaveTextContent("A long line."));
    expect(fake.props.at(-1)?.language).toBe("markdown");
    expect(screen.queryByRole("heading", { level: 1, name: "Guide" })).toBeNull();
  });

  it("opens a markdown file in the editor when the view is source", async () => {
    render(
      <Harness loadFile={readFile} initialFile={{ workDir: WORK_DIR, file: "docs/guide.md" }} initialView="source" />,
    );

    await waitFor(() => expect(screen.getByTestId("fake-monaco")).toHaveTextContent("# Guide"));
    const toggle = screen.getByRole("tablist", { name: "Markdown view" });
    expect(within(toggle).getByRole("tab", { name: "Source" })).toBeInTheDocument();
  });

  it("says so when the open file has no findings in this run", async () => {
    render(<Harness loadFile={readFile} initialFile={{ workDir: WORK_DIR, file: "gone/away.go" }} />);

    expect(await screen.findByText("gone/away.go has no findings in this run.")).toBeInTheDocument();
  });

  it("does not reload the open file when the host passes a new loadFile each render", async () => {
    const loads = vi.fn(readFile);
    function Unstable() {
      const [, force] = useState(0);
      return (
        <>
          <button type="button" onClick={() => force((n) => n + 1)}>
            rerender
          </button>
          <Harness
            loadFile={(file) => loads(file)}
            initialFile={{ workDir: WORK_DIR, file: "pkg/server/handler.go" }}
          />
        </>
      );
    }
    render(<Unstable />);
    await waitFor(() => expect(screen.getByTestId("fake-monaco")).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: "rerender" }));

    expect(loads).toHaveBeenCalledTimes(1);
  });
});
