import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { beforeAll, describe, expect, it, vi } from "vitest";

// Keep the Shiki dynamic imports out of jsdom (same approach as Markdown.test.tsx).
vi.mock("../data/code-highlight", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../data/code-highlight")>()),
  highlightCode: vi.fn(async () => null),
  highlightToLines: vi.fn(async () => null),
}));
// Monaco does not run in jsdom; the stub stands in for the editor's source and change seam.
vi.mock("./AnnotatedCode", () => ({
  AnnotatedCode: ({ source, onChange }: { source: string; onChange?: (source: string) => void }) => (
    <textarea data-testid="editor" value={source} onChange={(event) => onChange?.(event.target.value)} />
  ),
}));

import { FileFindingsView, type FileFindingsViewProps } from "./FileFindingsView";
import type { FileReviewView } from "./file-review/FileReview";
import { emptyProblemFilters, type ProblemFilters } from "./file-review/problem-filters";
import type { FileFinding, FileRef, FileTreeSelection } from "./types";

const WORK_DIR = "/repo/notes";
const GUIDE: FileRef = { workDir: WORK_DIR, file: "docs/guide.md" };
const DRAFT: FileRef = { workDir: WORK_DIR, file: "docs/draft.md" };
const FINDING: FileFinding = { file: GUIDE.file, workDir: WORK_DIR, line: 1, severity: "warning", message: "Heading too long", source: "markdownlint", kind: "lint" };
const TEXTS: Record<string, string> = { [GUIDE.file]: "# Guide\n", [DRAFT.file]: "# Untouched draft\n\nBody.\n" };

function Harness({
  initialView = "preview",
  initialSelection = null,
  ...props
}: { initialView?: FileReviewView; initialSelection?: FileTreeSelection | null } & Pick<
  FileFindingsViewProps,
  "loadFile" | "files" | "onSourceChange" | "fileTabs"
>) {
  const [selected, setSelected] = useState<FileTreeSelection | null>(initialSelection);
  const [view, setView] = useState<FileReviewView>(initialView);
  const [problemFilters, setProblemFilters] = useState<ProblemFilters>(emptyProblemFilters);
  return (
    <FileFindingsView
      {...props}
      findings={[FINDING]}
      selected={selected}
      onSelect={setSelected}
      onLineChange={() => {}}
      view={view}
      onViewChange={setView}
      problemFilters={problemFilters}
      onProblemFiltersChange={setProblemFilters}
    />
  );
}

const readFile = (file: FileRef) => Promise.resolve(TEXTS[file.file]!);

// jsdom does no layout and gives Range no client rects; measured highlights are simply empty.
beforeAll(() => {
  Range.prototype.getClientRects = () => [] as unknown as DOMRectList;
  Range.prototype.getBoundingClientRect = () => new DOMRect();
});

describe("FileFindingsView files", () => {
  it("lists a file with no findings in the tree and opens it instead of the no-findings placeholder", async () => {
    const loadFile = vi.fn(readFile);
    render(<Harness loadFile={loadFile} files={[GUIDE, DRAFT]} />);

    fireEvent.click(await screen.findByText("draft.md"));

    expect(await screen.findByRole("heading", { level: 1, name: "Untouched draft" })).toBeVisible();
    expect({ listed: screen.getByText("guide.md").textContent, loaded: loadFile.mock.calls, placeholder: screen.queryByText(/has no findings in this run/) }).toEqual({
      listed: "guide.md",
      loaded: [[DRAFT]],
      placeholder: null,
    });
  });

  it("still says so when the open file is neither listed nor has findings", async () => {
    render(<Harness loadFile={readFile} files={[GUIDE]} initialSelection={{ kind: "file", ref: { workDir: WORK_DIR, file: "gone.md" } }} />);

    expect(await screen.findByText("gone.md has no findings in this run.")).toBeInTheDocument();
  });
});

describe("FileFindingsView onSourceChange", () => {
  it("reports an edit with its file and shows the draft in Preview and in host tabs", async () => {
    const onSourceChange = vi.fn();
    render(
      <Harness
        loadFile={readFile}
        files={[GUIDE, DRAFT]}
        initialSelection={{ kind: "file", ref: GUIDE }}
        initialView="source"
        onSourceChange={onSourceChange}
        fileTabs={() => [{ id: "echo", label: "Echo", render: ({ source }) => <pre data-testid="echo">{source}</pre> }]}
      />,
    );

    const editor = await screen.findByTestId("editor");
    fireEvent.change(editor, { target: { value: "# Edited guide\n" } });

    expect(onSourceChange.mock.calls).toEqual([[GUIDE, "# Edited guide\n"]]);
    await waitFor(() => expect(screen.getByTestId("editor")).toHaveValue("# Edited guide\n"));
    fireEvent.click(screen.getByRole("tab", { name: "Preview" }));
    expect(await screen.findByRole("heading", { level: 1, name: "Edited guide" })).toBeVisible();
    fireEvent.click(screen.getByRole("tab", { name: "Echo" }));
    expect(screen.getByTestId("echo").textContent).toBe("# Edited guide\n");
  });

  it("keeps Source a read-only listing without onSourceChange", async () => {
    const { container } = render(<Harness loadFile={readFile} initialSelection={{ kind: "file", ref: GUIDE }} initialView="source" />);

    await waitFor(() => expect(container.querySelector("[data-source-line]")).not.toBeNull());
    expect(screen.queryByTestId("editor")).toBeNull();
  });
});
