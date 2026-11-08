import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { useState } from "react";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

// Keep the Shiki dynamic imports out of jsdom (same approach as Markdown.test.tsx).
vi.mock("../data/code-highlight", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../data/code-highlight")>()),
  highlightCode: vi.fn(async () => null),
  highlightToLines: vi.fn(async () => null),
}));

import { FileFindingsView, type FileFindingsViewProps } from "./FileFindingsView";
import type { FileReviewView } from "./file-review/FileReview";
import { emptyProblemFilters, type ProblemFilters } from "./file-review/problem-filters";
import type { FileFinding, FileRef, FileTreeSelection } from "./types";

const WORK_DIR = "/repo/gavel";
const GO_FILE = "pkg/server/handler.go";
const MD_FILE = "docs/guide.md";

function finding(file: string, line: number, severity: FileFinding["severity"], message: string): FileFinding {
  return { file, workDir: WORK_DIR, line, severity, message, source: "golangci-lint", rule: "rule", kind: "lint" };
}

const FINDINGS: FileFinding[] = [
  finding(GO_FILE, 3, "error", "Error return value is not checked"),
  finding(GO_FILE, 5, "warning", "Unused parameter"),
  finding(MD_FILE, 3, "warning", "Line too long"),
];

const FILES: Record<string, string> = {
  [GO_FILE]: ["package server", "", "func Handle() {", "\tcall()", "\t_ = x", "}"].join("\n"),
  [MD_FILE]: "# Guide\n\nA long line.\n",
};

type HostSeams = Pick<
  FileFindingsViewProps,
  "getFindingActions" | "getFileActions" | "getFolderActions" | "fileTabs" | "folderTabs" | "treeNode" | "fileToolbar" | "fileUrl" | "showPath"
>;

function Harness({
  loadFile,
  initialFile = null,
  initialSelection = initialFile ? { kind: "file", ref: initialFile } : null,
  initialView = "preview",
  onViewChange,
  onSelect,
  onLineChange,
  findings = FINDINGS,
  ...seams
}: {
  loadFile: (file: FileRef) => Promise<string>;
  initialFile?: FileRef | null;
  initialSelection?: FileTreeSelection | null;
  initialView?: FileReviewView;
  onViewChange?: (view: FileReviewView) => void;
  onSelect?: (selection: FileTreeSelection) => void;
  onLineChange?: (line: number | undefined) => void;
  findings?: FileFinding[];
} & HostSeams) {
  const [selected, setSelected] = useState<FileTreeSelection | null>(initialSelection);
  const [view, setView] = useState<FileReviewView>(initialView);
  const [line, setLine] = useState<number | undefined>(undefined);
  const [problemFilters, setProblemFilters] = useState<ProblemFilters>(emptyProblemFilters);
  return (
    <FileFindingsView
      {...seams}
      findings={findings}
      selected={selected}
      onSelect={(next) => {
        onSelect?.(next);
        setSelected(next);
      }}
      line={line}
      onLineChange={(next) => {
        onLineChange?.(next);
        setLine(next);
      }}
      view={view}
      onViewChange={(next) => {
        onViewChange?.(next);
        setView(next);
      }}
      problemFilters={problemFilters}
      onProblemFiltersChange={setProblemFilters}
      loadFile={loadFile}
    />
  );
}

const readFile = (file: FileRef) => Promise.resolve(FILES[file.file]!);
const listedLines = (container: HTMLElement) => container.querySelectorAll("[data-source-line]").length;

// jsdom does no layout and gives Range no client rects; measured highlights are simply empty.
beforeAll(() => {
  Range.prototype.getClientRects = () => [] as unknown as DOMRectList;
  Range.prototype.getBoundingClientRect = () => new DOMRect();
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("FileFindingsView", () => {
  it("lists the files with findings, with per-severity counts, and asks to open a clicked file", async () => {
    const onSelect = vi.fn();
    render(<Harness loadFile={readFile} onSelect={onSelect} />);

    // Single-child folders are folded into their file's row.
    const row = await screen.findByText("pkg/server/handler.go");
    expect(screen.getByText("docs/guide.md")).toBeInTheDocument();
    expect(screen.getAllByTitle("1 error")).toHaveLength(1);
    expect(screen.getAllByTitle("1 warning")).toHaveLength(2);
    expect(screen.getByText("Select a file to see its findings in context.")).toBeInTheDocument();

    fireEvent.click(row);

    expect(onSelect).toHaveBeenCalledWith({ kind: "file", ref: { workDir: WORK_DIR, file: GO_FILE } });
  });

  it("loads a code file and lists its source with each finding under its line, even when the view is preview", async () => {
    let finishLoading!: (text: string) => void;
    const loadFile = vi.fn(() => new Promise<string>((resolve) => (finishLoading = resolve)));
    const { container } = render(<Harness loadFile={loadFile} initialFile={{ workDir: WORK_DIR, file: GO_FILE }} />);

    expect(await screen.findByText(`Loading ${GO_FILE}`)).toBeInTheDocument();
    finishLoading(FILES[GO_FILE]!);
    await waitFor(() => expect(listedLines(container)).toBe(6));

    const messages = (line: number) => within(container.querySelector<HTMLElement>(`[data-source-line="${line}"]`)!).queryAllByRole("button").map((b) => b.textContent);
    expect({
      loaded: loadFile.mock.calls[0],
      tabs: screen.getAllByRole("tab").map((tab) => tab.textContent?.replace(/\d+$/, "")),
      line3: messages(3),
      line5: messages(5),
    }).toEqual({
      loaded: [{ workDir: WORK_DIR, file: GO_FILE }],
      tabs: ["Source", "Problems"],
      line3: ["Error return value is not checkedgolangci-lint rule"],
      line5: ["Unused parametergolangci-lint rule"],
    });
  });

  it("reports the line of a picked finding and shows the host's actions beside it", async () => {
    const onLineChange = vi.fn();
    const { container } = render(
      <Harness
        loadFile={readFile}
        initialFile={{ workDir: WORK_DIR, file: GO_FILE }}
        onLineChange={onLineChange}
        getFindingActions={(f) => [{ label: `Ignore ${f.rule}`, onSelect: vi.fn() }]}
      />,
    );
    await waitFor(() => expect(listedLines(container)).toBe(6));

    const row = container.querySelector<HTMLElement>('[data-source-line="5"] [data-source-finding]')!;
    fireEvent.click(within(row).getByRole("button", { name: /Unused parameter/ }));

    fireEvent.click(within(row).getByRole("button", { name: "Problem actions" }));
    expect({ line: onLineChange.mock.calls.at(-1), action: screen.getByRole("menuitem", { name: "Ignore rule" }).textContent }).toEqual({
      line: [5],
      action: "Ignore rule",
    });
  });

  it("shows the whole load error, not a summary of it", async () => {
    const loadFile = () => Promise.reject(new Error("GET /api/file: 404 file not found: pkg/server/handler.go"));
    render(<Harness loadFile={loadFile} initialFile={{ workDir: WORK_DIR, file: GO_FILE }} />);

    const alert = await screen.findByRole("alert");

    expect(alert).toHaveTextContent("Could not load pkg/server/handler.go");
    expect(alert).toHaveTextContent("GET /api/file: 404 file not found: pkg/server/handler.go");
  });

  it("renders a markdown file with its findings and switches to the source listing on request", async () => {
    const onViewChange = vi.fn();
    const { container } = render(
      <Harness loadFile={readFile} initialFile={{ workDir: WORK_DIR, file: MD_FILE }} onViewChange={onViewChange} />,
    );

    expect(await screen.findByRole("heading", { level: 1, name: "Guide" })).toBeVisible();
    expect(await screen.findByText(/Line too long/)).toBeInTheDocument();
    expect(listedLines(container)).toBe(0);

    fireEvent.click(screen.getByRole("tab", { name: "Source" }));

    expect(onViewChange).toHaveBeenCalledWith("source");
    await waitFor(() => expect(container.querySelector('[data-source-line="3"]')).toHaveTextContent("A long line."));
  });

  it("says so when the open file has no findings in this run", async () => {
    render(<Harness loadFile={readFile} initialFile={{ workDir: WORK_DIR, file: "gone/away.go" }} />);

    expect(await screen.findByText("gone/away.go has no findings in this run.")).toBeInTheDocument();
  });

  describe("host seams", () => {
    const ROUTES_FILE = "pkg/server/routes.go";
    const FOLDER: FileTreeSelection = { kind: "folder", ref: { workDir: WORK_DIR, file: "pkg/server" } };
    const WITH_FOLDER = [...FINDINGS, finding(ROUTES_FILE, 2, "error", "Route has no handler")];
    const folderGroups = (container: HTMLElement) =>
      Array.from(container.querySelectorAll<HTMLElement>("[data-folder-file]"), (group) => ({
        file: group.dataset.folderFile,
        lines: Array.from(group.querySelectorAll<HTMLElement>("[data-problem-line]"), (row) => row.dataset.problemLine),
      }));

    it("selects a folder and lists the problems beneath it grouped by file, opening a problem's file at its line", async () => {
      const onSelect = vi.fn();
      const onLineChange = vi.fn();
      const { container } = render(<Harness loadFile={readFile} findings={WITH_FOLDER} onSelect={onSelect} onLineChange={onLineChange} />);

      fireEvent.click(await screen.findByText("pkg/server"));
      const groups = folderGroups(container);
      const tabs = screen.getAllByRole("tab").map((tab) => tab.textContent);
      const routes = container.querySelector<HTMLElement>(`[data-folder-file="${ROUTES_FILE}"]`)!;
      fireEvent.click(within(routes).getByRole("button", { name: "Problem actions" }));
      fireEvent.click(screen.getByRole("menuitem", { name: "Open in file" }));

      expect({ selections: onSelect.mock.calls, tabs, groups, line: onLineChange.mock.calls.at(-1) }).toEqual({
        selections: [[FOLDER], [{ kind: "file", ref: { workDir: WORK_DIR, file: ROUTES_FILE } }]],
        tabs: ["Problems3"],
        groups: [
          { file: GO_FILE, lines: ["3", "5"] },
          { file: ROUTES_FILE, lines: ["2"] },
        ],
        line: [2],
      });
    });

    it("renders the tree row slots in place of each default, which they receive", async () => {
      render(
        <Harness
          loadFile={readFile}
          treeNode={{
            icon: ({ node }) => <span>{node.kind === "folder" ? "[dir]" : "[file]"}</span>,
            name: ({ node, default: name }) => (
              <span data-testid={`name:${node.ref.file}`}>
                {name} ({node.findings.length})
              </span>
            ),
            badges: () => <span>assigned: 0</span>,
          }}
        />,
      );

      const row = (await screen.findByTestId(`name:${GO_FILE}`)).parentElement!;
      expect({
        text: row.textContent,
        icons: screen.getAllByText(/^\[(dir|file)\]$/).map((icon) => icon.textContent),
        counts: screen.queryAllByTitle(/\d+ (error|warning)/),
      }).toEqual({ text: `[file]${GO_FILE} (2)assigned: 0`, icons: ["[file]", "[file]"], counts: [] });
    });

    it("offers file and folder actions on tree rows and in the header without selecting the row", async () => {
      const onSelect = vi.fn();
      const archive = vi.fn();
      render(
        <Harness
          loadFile={readFile}
          findings={WITH_FOLDER}
          initialFile={{ workDir: WORK_DIR, file: GO_FILE }}
          onSelect={onSelect}
          getFileActions={(file) => [{ label: `Archive ${file.file}`, onSelect: () => archive(file) }]}
          getFolderActions={(folder) => [{ label: `Lint ${folder.file}`, onSelect: vi.fn() }]}
        />,
      );
      await screen.findByText("handler.go");

      const menus = screen.getAllByRole("button", { name: /^(File|Folder) actions$/ }).map((button) => button.getAttribute("title"));
      fireEvent.click(screen.getAllByRole("button", { name: "Folder actions" })[0]!);
      const folderItems = screen.getAllByRole("menuitem").map((item) => item.textContent);
      fireEvent.click(screen.getAllByRole("button", { name: "File actions" }).at(-1)!);
      fireEvent.click(screen.getByRole("menuitem", { name: `Archive ${GO_FILE}` }));

      expect({ menus, folderItems, archived: archive.mock.calls, selections: onSelect.mock.calls }).toEqual({
        // Tree: docs/guide.md, pkg/server, handler.go, routes.go; then the open file's header.
        menus: ["File actions", "Folder actions", "File actions", "File actions", "File actions"],
        folderItems: ["Lint pkg/server"],
        archived: [[{ workDir: WORK_DIR, file: GO_FILE }]],
        selections: [],
      });
    });

    it("reveals a file opened from outside the tree even after every folder was collapsed", async () => {
      const loadFile = (file: FileRef) => Promise.resolve(file.file === ROUTES_FILE ? "package server\n\nvar routes = 1\n" : FILES[file.file]!);
      render(<Harness loadFile={loadFile} findings={WITH_FOLDER} initialSelection={FOLDER} />);
      await screen.findByText("handler.go");

      fireEvent.click(screen.getByRole("button", { name: "Collapse all" }));
      const hiddenAfterCollapse = screen.queryByText("routes.go") === null;
      const routes = document.querySelector<HTMLElement>(`[data-folder-file="${ROUTES_FILE}"]`)!;
      fireEvent.click(within(routes).getByRole("button", { name: "Problem actions" }));
      fireEvent.click(screen.getByRole("menuitem", { name: "Open in file" }));

      const row = (await screen.findByText("routes.go", { selector: '[role="tree"] *' })).closest('[role="treeitem"]');
      expect({ hiddenAfterCollapse, selected: row?.getAttribute("aria-selected") }).toEqual({ hiddenAfterCollapse: true, selected: "true" });
    });

    it("leaves the open file's and folder's path out of the header when showPath is off, keeping its counts and actions", async () => {
      const header = () => document.querySelector<HTMLElement>("[data-file-header]")!;
      render(
        <Harness
          loadFile={readFile}
          findings={WITH_FOLDER}
          initialFile={{ workDir: WORK_DIR, file: GO_FILE }}
          showPath={false}
          getFileActions={() => [{ label: "Lint file", onSelect: vi.fn() }]}
          getFolderActions={() => [{ label: "Lint folder", onSelect: vi.fn() }]}
        />,
      );
      await screen.findByText("handler.go");
      const file = { text: header().textContent, actions: within(header()).queryAllByRole("button").map((b) => b.getAttribute("title")) };
      fireEvent.click(screen.getByText("pkg/server"));
      const folder = { text: header().textContent, actions: within(header()).queryAllByRole("button").map((b) => b.getAttribute("title")) };

      expect({ file, folder }).toEqual({
        file: { text: "11", actions: ["File actions"] },
        folder: { text: "21", actions: ["Folder actions"] },
      });
    });

    it("adds host file tabs to the open file, and a folder without that tab shows its Problems", async () => {
      const onViewChange = vi.fn();
      render(
        <Harness
          loadFile={readFile}
          findings={WITH_FOLDER}
          initialFile={{ workDir: WORK_DIR, file: GO_FILE }}
          initialView="owners"
          onViewChange={onViewChange}
          fileTabs={() => [{ id: "owners", label: "Owners", render: ({ path }) => <p>Owners of {path}</p> }]}
          folderTabs={() => [{ id: "summary", label: "Summary", render: ({ findings }) => <p>{findings.length} findings below</p> }]}
        />,
      );

      const owners = (await screen.findByText(/Owners of/)).textContent;
      const fileTabs = screen.getAllByRole("tab").map((tab) => tab.textContent?.replace(/\d+$/, ""));
      fireEvent.click(screen.getByText("pkg/server"));
      const folderTabs = screen.getAllByRole("tab").map((tab) => tab.textContent?.replace(/\d+$/, ""));
      const folderShowsProblems = screen.getByRole("tab", { name: /Problems/ }).getAttribute("aria-selected");
      fireEvent.click(screen.getByRole("tab", { name: "Summary" }));

      expect({ owners, fileTabs, folderTabs, folderShowsProblems, views: onViewChange.mock.calls }).toEqual({
        owners: `Owners of ${GO_FILE}`,
        fileTabs: ["Source", "Problems", "Owners"],
        folderTabs: ["Problems", "Summary"],
        folderShowsProblems: "true",
        views: [["summary"]],
      });
    });
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
          <Harness loadFile={(file) => loads(file)} initialFile={{ workDir: WORK_DIR, file: GO_FILE }} />
        </>
      );
    }
    const { container } = render(<Unstable />);
    await waitFor(() => expect(listedLines(container)).toBe(6));

    fireEvent.click(screen.getByRole("button", { name: "rerender" }));

    expect(loads).toHaveBeenCalledTimes(1);
  });

  describe("with fileUrl", () => {
    const PNG_FILE = "docs/img/a.png";
    const SVG_FILE = "docs/logo.svg";
    const SVG = '<svg xmlns="http://www.w3.org/2000/svg"></svg>';
    const IMAGE_FILES: Record<string, string> = {
      ...FILES,
      [MD_FILE]: "# Guide\n\n![Local](img/a.png)\n\n![Remote](https://example.test/r.png)\n",
      [SVG_FILE]: SVG,
    };
    const imageFindings = [finding(PNG_FILE, 1, "warning", "Image too large"), finding(SVG_FILE, 1, "warning", "Unoptimized svg"), ...FINDINGS];
    const fileUrl = (file: FileRef) => `/raw?dir=${encodeURIComponent(file.workDir ?? "")}&path=${encodeURIComponent(file.file)}`;
    const readImageFile = (file: FileRef) => Promise.resolve(IMAGE_FILES[file.file]!);

    it("shows a raster image file as an image from fileUrl and never loads it as text", async () => {
      const loadFile = vi.fn(readImageFile);
      const ref = { workDir: WORK_DIR, file: PNG_FILE };
      render(<Harness loadFile={loadFile} fileUrl={fileUrl} findings={imageFindings} initialFile={ref} initialView="source" />);

      const image = await screen.findByRole("img", { name: PNG_FILE });
      expect({
        src: image.getAttribute("src"),
        tabs: screen.getAllByRole("tab").map((tab) => tab.textContent),
        loads: loadFile.mock.calls.length,
      }).toEqual({ src: fileUrl(ref), tabs: ["Preview"], loads: 0 });
    });

    it("shows an svg as an image under Preview and as text under Source", async () => {
      const ref = { workDir: WORK_DIR, file: SVG_FILE };
      const onViewChange = vi.fn();
      render(<Harness loadFile={readImageFile} fileUrl={fileUrl} findings={imageFindings} initialFile={ref} onViewChange={onViewChange} />);

      const image = await screen.findByRole("img", { name: SVG_FILE });
      expect(image).toHaveAttribute("src", fileUrl(ref));
      fireEvent.click(screen.getByRole("tab", { name: "Source" }));
      await waitFor(() => expect(document.querySelector("[data-source-line]")?.textContent).toContain("<svg"));
      expect(onViewChange).toHaveBeenCalledWith("source");
    });

    it("resolves a relative markdown image through fileUrl and leaves an absolute one alone", async () => {
      const { container } = render(<Harness loadFile={readImageFile} fileUrl={fileUrl} initialFile={{ workDir: WORK_DIR, file: MD_FILE }} />);

      await waitFor(() => expect(container.querySelectorAll("[data-annotated-markdown] img")).toHaveLength(2));
      const sources = [...container.querySelectorAll("[data-annotated-markdown] img")].map((img) => img.getAttribute("src"));
      expect(sources).toEqual([fileUrl({ workDir: WORK_DIR, file: "docs/img/a.png" }), "https://example.test/r.png"]);
    });

    it("does not rewrite markdown images without fileUrl", async () => {
      const { container } = render(<Harness loadFile={readImageFile} initialFile={{ workDir: WORK_DIR, file: MD_FILE }} />);

      await waitFor(() => expect(container.querySelector("[data-annotated-markdown] img")).not.toBeNull());
      const sources = [...container.querySelectorAll("[data-annotated-markdown] img")].map((img) => img.getAttribute("src"));
      expect(sources).toEqual(["https://example.test/r.png"]);
    });
  });
});
