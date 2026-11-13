import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { DEFAULT_COMMENT_STATUSES, type Comment, type CommentAuthor, type CommentConfig } from "../comments/comment-types";
import { Switch } from "../components/Switch";
import { MonacoProvider } from "../monaco/MonacoProvider";
import { allLintResults } from "../data/lint/LintResults.fixtures";
import type { LinterResult } from "../data/lint/types";
import type { Test } from "../data/test-runner/types";
import { UiRobotAi } from "../icons";
import { lintFindings, testFindings } from "./adapters";
import { FileFindingsView, type FileFindingsViewProps } from "./FileFindingsView";
import type { FileReviewComments, FileReviewView } from "./file-review/FileReview";
import { emptyProblemFilters, type ProblemFilters } from "./file-review/problem-filters";
import { fileRefKey, type FileFinding, type FileRef, type FileTreeSelection } from "./types";

const WORK_DIR = "/repo/gavel";

const markdownLint: LinterResult = {
  linter: "markdownlint",
  work_dir: WORK_DIR,
  violations: [
    {
      file: `${WORK_DIR}/docs/guide.md`,
      line: 3,
      severity: "warning",
      rule: { method: "MD013" },
      message: "Line length exceeds 80 characters",
    },
    {
      file: `${WORK_DIR}/docs/guide.md`,
      line: 8,
      severity: "error",
      rule: { method: "MD040" },
      message: "Fenced code blocks should have a language specified",
    },
    {
      file: `${WORK_DIR}/docs/guide.md`,
      line: 14,
      severity: "info",
      rule: { method: "MD032" },
      message: "Lists should be surrounded by blank lines",
    },
  ],
};

const failedTests: Test[] = [
  {
    name: "TestHandlerRejectsBadInput",
    failed: true,
    framework: "go test",
    work_dir: WORK_DIR,
    file: `${WORK_DIR}/pkg/server/handler.go`,
    line: 60,
    end_line: 66,
    failure_detail: { kind: "gomega", summary: "Expected status 400 but got 200" },
  },
];

const GUIDE = [
  "# Guide", // 1
  "", // 2
  "This paragraph is intentionally written as one very long line so that the line length rule has something to flag.", // 3
  "", // 4
  "## Setup", // 5
  "", // 6
  "Run the installer:", // 7
  "```", // 8
  "make install", // 9
  "```", // 10
  "", // 11
  "## Usage", // 12
  "Call the tool with a path:", // 13
  "- gavel test ./...", // 14
  "- gavel lint ./...", // 15
].join("\n");

function sourceFor(file: string): string {
  if (file === "docs/guide.md") return GUIDE;
  return Array.from({ length: 120 }, (_, i) => `// ${file} line ${i + 1}`).join("\n");
}


const meta: Meta<typeof FileFindingsView> = {
  title: "Git/FileFindingsView",
  component: FileFindingsView,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Every file with lint violations or failed tests as a tree beside a `FileReview` of the open file: syntax-highlighted source with each finding under its line, a rendered Preview for markdown with findings as read-only threads, and a Problems list. Controlled: the open file, line and view are props so a host can keep them in its URL, and file text comes from `loadFile`.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof FileFindingsView>;

const findings = [...lintFindings([...allLintResults, markdownLint]), ...testFindings(failedTests)];

function Harness({
  initialFile = null,
  initialView = "preview",
  ...seams
}: { initialFile?: FileRef | null; initialView?: FileReviewView } & Partial<FileFindingsViewProps>) {
  const [selected, setSelected] = useState<FileTreeSelection | null>(initialFile && { kind: "file", ref: initialFile });
  const [line, setLine] = useState<number | undefined>(undefined);
  const [view, setView] = useState<FileReviewView>(initialView);
  const [problemFilters, setProblemFilters] = useState<ProblemFilters>(emptyProblemFilters);
  return (
    <div className="h-[640px]">
      <FileFindingsView
        findings={findings}
        selected={selected}
        onSelect={(next) => {
          setSelected(next);
          setLine(undefined);
        }}
        line={line}
        onLineChange={setLine}
        view={view}
        onViewChange={setView}
        problemFilters={problemFilters}
        onProblemFiltersChange={setProblemFilters}
        loadFile={async ({ file: path }) => sourceFor(path)}
        {...seams}
      />
    </div>
  );
}

const CLAUDE: CommentAuthor = { id: "claude", name: "Claude", kind: "agent" };
const CONFIG: CommentConfig = { statuses: DEFAULT_COMMENT_STATUSES, assignees: [{ id: "dana", name: "Dana", kind: "user" }, CLAUDE] };

/**
 * A host using every seam: per-file comments with Assign… on findings, an
 * auto-assign switch (host policy in `onCreate`, as the playground's auto-run),
 * an assigned-count badge slot, file/folder actions and host tabs.
 */
function HostedHarness() {
  const [threads, setThreads] = useState<Record<string, Comment[]>>({});
  const [autoAssign, setAutoAssign] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const note = (entry: string) => setLog((current) => [...current, entry]);
  const assigned = (below: readonly FileFinding[]) =>
    [...new Set(below.map(fileRefKey))].reduce((sum, key) => sum + (threads[key]?.filter((c) => c.assignee).length ?? 0), 0);
  const comments = (file: FileRef): FileReviewComments => ({
    items: threads[fileRefKey(file)] ?? [],
    config: CONFIG,
    callbacks: {
      onCreate: async (input) => {
        const assignee = input.assignee ?? (autoAssign ? CLAUDE : undefined);
        const comment: Comment = {
          id: `c${Date.now()}`,
          body: input.body,
          anchor: input.anchor ?? null,
          status: "open",
          createdAt: new Date().toISOString(),
          author: { id: "you", name: "You", kind: "user" },
          ...(assignee ? { assignee } : {}),
        };
        setThreads((current) => ({ ...current, [fileRefKey(file)]: [...(current[fileRefKey(file)] ?? []), comment] }));
      },
    },
    extraAssignItems: (comment) => [{ label: "Run agent", icon: UiRobotAi, onSelect: () => note(`run agent on ${comment.id}`) }],
  });
  return (
    <div className="flex flex-col gap-2">
      <Harness
        initialFile={{ workDir: WORK_DIR, file: "pkg/server/handler.go" }}
        comments={comments}
        selectToComment
        treeActions={<Switch label="Auto-assign" checked={autoAssign} onChange={setAutoAssign} />}
        treeNode={{
          badges: ({ node, default: counts }) => {
            const count = assigned(node.findings);
            return (
              <span className="flex items-center gap-2">
                {count > 0 && <span className="text-xs text-primary">{count} assigned</span>}
                {counts}
              </span>
            );
          },
        }}
        getFileActions={(file) => [{ label: "Copy path", onSelect: () => note(`copied ${file.file}`) }]}
        getFolderActions={(folder) => [{ label: "Lint folder", onSelect: () => note(`lint ${folder.file}`) }]}
        fileTabs={() => [{ id: "owners", label: "Owners", render: ({ path }) => <p className="p-4 text-sm">CODEOWNERS for {path}: @platform</p> }]}
        folderTabs={() => [{ id: "summary", label: "Summary", render: ({ findings: below }) => <p className="p-4 text-sm">{below.length} findings below</p> }]}
      />
      <ol aria-label="Host log" className="px-4 text-xs text-muted-foreground">
        {log.map((entry, index) => (
          <li key={index}>{entry}</li>
        ))}
      </ol>
    </div>
  );
}

export const Default: Story = { render: () => <Harness /> };

export const MarkdownPreview: Story = {
  render: () => <Harness initialFile={{ workDir: WORK_DIR, file: "docs/guide.md" }} />,
};

export const MarkdownSource: Story = {
  render: () => <Harness initialFile={{ workDir: WORK_DIR, file: "docs/guide.md" }} initialView="source" />,
};

export const GoWithLintAndTestFailures: Story = {
  render: () => <Harness initialFile={{ workDir: WORK_DIR, file: "pkg/server/handler.go" }} />,
};

const DIAGRAM_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="160"><rect x="10" y="20" width="120" height="120" rx="12" fill="#2563eb" fill-opacity=".8"/><rect x="190" y="20" width="120" height="120" rx="12" fill="#16a34a" fill-opacity=".8"/><path d="M130 80h60" stroke="#475569" stroke-width="4"/></svg>';
const imageFindings: FileFinding[] = [
  { file: "docs/img/diagram.png", workDir: WORK_DIR, line: 1, severity: "warning", message: "Image is larger than 1MB", source: "image-size", kind: "lint" },
  { file: "docs/logo.svg", workDir: WORK_DIR, line: 1, severity: "info", message: "Unoptimized svg", source: "svgo", kind: "lint" },
  { file: "docs/guide.md", workDir: WORK_DIR, line: 3, severity: "warning", message: "Line too long", source: "markdownlint", kind: "lint" },
];
const imageSources: Record<string, string> = {
  "docs/guide.md": "# Guide\n\n![Architecture](img/diagram.png)\n\nThe diagram above resolves through `fileUrl`.\n",
  "docs/logo.svg": DIAGRAM_SVG,
};
// A host serves bytes from a route; the story serves the same picture from a data URI.
const imageDataUrl = () => `data:image/svg+xml;utf8,${encodeURIComponent(DIAGRAM_SVG)}`;

export const ImageFile: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "With `fileUrl`, `diagram.png` opens as an image (Preview only, never passed to `loadFile`), `logo.svg` as an image under Preview and as text under Source, and `guide.md` resolves its relative image through `fileUrl`.",
      },
    },
  },
  render: () => (
    <Harness
      findings={imageFindings}
      fileUrl={imageDataUrl}
      loadFile={async ({ file }) => imageSources[file] ?? sourceFor(file)}
      initialFile={{ workDir: WORK_DIR, file: "docs/img/diagram.png" }}
    />
  ),
  play: async ({ canvasElement }) => {
    await expect(await within(canvasElement).findByRole("img", { name: "docs/img/diagram.png" })).toBeVisible();
  },
};

// Vite bundles a worker named by `new Worker(new URL(...))`; the editor worker is enough (no language services).
function getEditorWorker(): Worker {
  return new Worker(new URL("monaco-editor/esm/vs/editor/editor.worker.js", import.meta.url), { type: "module" });
}

const EDITABLE_FILES: FileRef[] = [
  { workDir: WORK_DIR, file: "docs/guide.md" },
  { workDir: WORK_DIR, file: "docs/notes.md" },
  { workDir: WORK_DIR, file: "config.yaml" },
];
const EDITABLE_SOURCES: Record<string, string> = {
  "docs/guide.md": GUIDE,
  "docs/notes.md": "# Notes\n\nThis file has no findings; it is listed through `files`.\n",
  "config.yaml": "name: web\nreplicas: 2\n",
};

function EditableHarness() {
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [log, setLog] = useState<string[]>([]);
  return (
    <MonacoProvider getWorker={getEditorWorker}>
      <Harness
        initialFile={{ workDir: WORK_DIR, file: "docs/notes.md" }}
        initialView="source"
        findings={lintFindings([markdownLint])}
        files={EDITABLE_FILES}
        loadFile={async ({ file }) => drafts[file] ?? EDITABLE_SOURCES[file]!}
        onSourceChange={(file, source) => {
          setDrafts((current) => ({ ...current, [file.file]: source }));
          setLog((current) => [...current, `${file.file}: ${source.length} chars`]);
        }}
      />
      <ol aria-label="Edit log" className="px-4 text-xs text-muted-foreground">
        {log.map((entry, index) => (
          <li key={index}>{entry}</li>
        ))}
      </ol>
    </MonacoProvider>
  );
}

export const EditableFiles: Story = {
  tags: ["browser"],
  parameters: {
    docs: {
      description: {
        story:
          "With `files`, `notes.md` and `config.yaml` are listed although they have no findings. With `onSourceChange`, Source is an editor: each edit replaces the loaded text, so Preview and host tabs show the draft, and is reported to the host, which returns its draft from `loadFile` when the file is reopened.",
      },
    },
  },
  render: () => <EditableHarness />,
};

export const Hosted: Story = {
  render: () => <HostedHarness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(await canvas.findByRole("tab", { name: /Problems/ }));
    await userEvent.click((await canvas.findAllByRole("button", { name: "Problem actions" }))[0]!);
    await userEvent.click(await body.findByRole("menuitem", { name: "Assign…" }));
    await userEvent.click(await body.findByRole("menuitem", { name: "Claude" }));
    // The file's row and every folder above it count the new assigned thread.
    await expect((await canvas.findAllByText("1 assigned")).length).toBeGreaterThan(0);

    await userEvent.click(canvas.getByRole("tab", { name: "Owners" }));
    await expect(canvas.getByText(/CODEOWNERS for pkg\/server\/handler.go/)).toBeInTheDocument();
  },
};
