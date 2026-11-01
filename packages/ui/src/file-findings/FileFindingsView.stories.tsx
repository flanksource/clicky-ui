import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { allLintResults } from "../data/lint/LintResults.fixtures";
import type { LinterResult } from "../data/lint/types";
import type { Test } from "../data/test-runner/types";
import { lintFindings, testFindings } from "./adapters";
import { FileFindingsView } from "./FileFindingsView";
import type { FileReviewView } from "./file-review/FileReview";
import { emptyProblemFilters, type ProblemFilters } from "./file-review/problem-filters";
import type { FileRef } from "./types";

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

function Harness({ initialFile = null, initialView = "preview" }: { initialFile?: FileRef | null; initialView?: FileReviewView }) {
  const [file, setFile] = useState<FileRef | null>(initialFile);
  const [line, setLine] = useState<number | undefined>(undefined);
  const [view, setView] = useState<FileReviewView>(initialView);
  const [problemFilters, setProblemFilters] = useState<ProblemFilters>(emptyProblemFilters);
  return (
    <div className="h-[640px]">
        <FileFindingsView
          findings={findings}
          selectedFile={file}
          onSelectFile={(next) => {
            setFile(next);
            setLine(undefined);
          }}
          line={line}
          onLineChange={setLine}
          view={view}
          onViewChange={setView}
          problemFilters={problemFilters}
          onProblemFiltersChange={setProblemFilters}
          loadFile={async ({ file: path }) => sourceFor(path)}
        />
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
