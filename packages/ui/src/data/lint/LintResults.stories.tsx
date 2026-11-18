import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { Button } from "../../components/button";
import { LintResults, type LintResultsProps } from "./LintResults";
import { buildLintTree } from "./grouping";
import { emptyLintFilters, type LintAction, type LintFilters, type LintGrouping, type LinterResult } from "./types";
import {
  allLintResults,
  betterleaks,
  dataLint,
  eslint,
  golangci,
  markdownlintClean,
  promptPending,
  promptRunning,
  promptRunWithNestedLinters,
  pyrightFailed,
  reviewRunning,
  valeSkipped,
} from "./LintResults.fixtures";

const meta: Meta<typeof LintResults> = {
  title: "Data/LintResults",
  component: LintResults,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Lint results use compact rows with inline source expansion. View Options contains grouping and tri-state filters; ellipsis and context menus offer scoped actions. The grouped tree retains its detail pane. Controlled: the host owns grouping, tri-state severity and linter filters, selection (a stable route path) and expand state, so all of it can live in the URL. A linter that failed to run is listed under its name with its error, never dropped. Ignore actions are descriptions handed to `onIgnore`; nothing is written by the component.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof LintResults>;

function Harness({
  results = allLintResults,
  grouping: initialGrouping = "linter-rule-file",
  filters: initialFilters = emptyLintFilters(),
  selected: initialSelected = null,
  withIgnore = false,
  renderRun,
  entityHref,
}: {
  results?: LinterResult[];
  grouping?: LintGrouping;
  filters?: LintFilters;
  selected?: string | null;
  withIgnore?: boolean;
  renderRun?: LintResultsProps["renderRun"];
  entityHref?: LintResultsProps["entityHref"];
}) {
  const [grouping, setGrouping] = useState<LintGrouping>(initialGrouping);
  const [filters, setFilters] = useState<LintFilters>(initialFilters);
  const [selected, setSelected] = useState<string | null>(initialSelected);
  const [expandAll, setExpandAll] = useState<boolean | null>(null);
  const [applied, setApplied] = useState<LintAction | null>(null);
  const [busy, setBusy] = useState(false);

  const onIgnore = async (action: LintAction) => {
    setBusy(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    setApplied(action);
    setBusy(false);
  };

  return (
    <div className="flex h-screen flex-col">
      <LintResults
        results={results}
        grouping={grouping}
        onGroupingChange={setGrouping}
        filters={filters}
        onFiltersChange={setFilters}
        selected={selected}
        onSelect={setSelected}
        expandAll={expandAll}
        onExpandAllChange={setExpandAll}
        headerSlot={
          <Button type="button" size="sm" variant="outline">
            Re-run
          </Button>
        }
        {...(withIgnore ? { onIgnore, ignoreBusy: busy } : {})}
        {...(renderRun ? { renderRun } : {})}
        {...(entityHref ? { entityHref } : {})}
      />
      {applied && (
        <pre data-testid="applied-ignore" className="border-t border-border bg-muted p-2 font-mono text-xs">
          onIgnore({JSON.stringify(applied.req)})
        </pre>
      )}
    </div>
  );
}

export const LinterRuleFile: Story = {
  name: "Grouping: Linter · Rule · File",
  render: () => <Harness grouping="linter-rule-file" />,
};

export const LinterFile: Story = {
  name: "Grouping: Linter · File",
  render: () => <Harness results={[golangci]} grouping="linter-file" selected="golangci-lint/pkg" />,
};

export const FileLinterRule: Story = {
  name: "Grouping: File · Linter · Rule",
  render: () => (
    <Harness
      grouping="file-linter-rule"
      results={[
        golangci,
        {
          linter: "betterleaks",
          work_dir: golangci.work_dir!,
          success: false,
          violations: [
            {
              file: `${golangci.work_dir}/pkg/server/handler.go`,
              line: 12,
              severity: "error",
              rule: { method: "generic-api-key" },
              message: "Potential API key in source",
              code: 'const token = "AKIA..."',
            },
            ...(betterleaks.violations ?? []),
          ],
        },
        pyrightFailed,
      ]}
    />
  ),
};

/**
 * Findings that point at entities, pages and screenshots rather than files are
 * grouped beside the files by entity kind, URL host, or "Other". The host links
 * Policy entities through `entityHref`.
 */
export const FindingsWithoutFiles: Story = {
  name: "Findings at entities, pages and images",
  render: () => (
    <Harness
      results={[dataLint]}
      grouping="linter-file"
      selected="data-lint/policy"
      entityHref={(entity) => (entity.kind === "Policy" ? `#/entity/policy/${entity.id}` : undefined)}
    />
  ),
  play: async ({ canvasElement }) => {
    const tree = within(within(canvasElement).getByRole("tree"));
    await expect(tree.getByText("Policy")).toBeInTheDocument();
    await expect(tree.getByText("oipa.example.com")).toBeInTheDocument();
    await expect(tree.getByText("Other")).toBeInTheDocument();
  },
};

export const Summary: Story = {
  name: "Grouping: Summary",
  render: () => <Harness grouping="summary" />,
};

/** Warnings only, with the secrets scanner excluded. */
export const Filtered: Story = {
  render: () => {
    const filters = emptyLintFilters();
    filters.severity.set("warning", "include");
    filters.linter.set("betterleaks", "exclude");
    return <Harness filters={filters} />;
  },
};

/** The filters leave nothing: the controls stay so they can be cleared. */
export const FiltersExcludeEverything: Story = {
  render: () => {
    const filters = emptyLintFilters();
    filters.severity.set("error", "exclude");
    filters.severity.set("warning", "exclude");
    filters.severity.set("info", "exclude");
    return <Harness results={[golangci, eslint]} filters={filters} />;
  },
};

/** pyright could not start: no violations, only its error, shown beside the linters that ran. */
export const LinterFailedToRun: Story = {
  render: () => (
    <Harness
      results={[golangci, pyrightFailed, valeSkipped]}
      selected="pyright/pyright-configuration-file-pyrightconfig-json-is-invalid"
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("1 linter failed to run")).toBeInTheDocument();
    await expect(canvas.getByText("Raw output")).toBeInTheDocument();
  },
};

export const AllClean: Story = {
  render: () => <Harness results={[markdownlintClean]} />,
};

export const NoResults: Story = {
  render: () => <Harness results={[]} />,
};

/** With `onIgnore` the detail pane offers the ignore scopes that fit the selected node. */
export const IgnoreActions: Story = {
  render: () => <Harness withIgnore selected="golangci-lint/errcheck" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(within(canvasElement.querySelector<HTMLElement>("[data-lint-node-actions]")!).getByRole("button", { name: "Actions" }));
    await userEvent.click(within(document.body).getByRole("menuitem", { name: "Ignore rule errcheck everywhere" }));
    await expect(await canvas.findByTestId("applied-ignore")).toHaveTextContent(
      '{"source":"golangci-lint","rule":"errcheck","work_dir":"/repo/gavel"}',
    );
  },
};

export const IgnoreOnFolder: Story = {
  render: () => <Harness results={[golangci]} withIgnore grouping="linter-file" selected="golangci-lint/pkg" />,
};

/** Route path of the linter root for `linter`, as the host would keep it in its URL. */
function linterRoute(results: LinterResult[], linter: string): string {
  const root = buildLintTree({ results, grouping: "linter-rule-file", filters: emptyLintFilters() }).find(
    (node) => node.linterName === linter,
  );
  if (!root) throw new Error(`no tree node for linter ${linter}`);
  return root.route_path;
}

const IN_FLIGHT = [golangci, promptPending, promptRunning];

/** A queued run shows a muted clock and a running one a spinner with its violations so far; neither reads as a pass or a failure. */
export const PromptRunsInFlight: Story = {
  render: () => <Harness results={IN_FLIGHT} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("img", { name: "Pending" })).toBeInTheDocument();
    await expect(canvas.getByRole("img", { name: "Running" })).toBeInTheDocument();
  },
};

export const PendingLinterDetail: Story = {
  render: () => <Harness results={IN_FLIGHT} selected={linterRoute(IN_FLIGHT, promptPending.linter)} />,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("pending")).toBeInTheDocument();
  },
};

/**
 * A prompt run whose agent ran linters through its `lint` tool: they are published as
 * `<run>/<linter>` and nest beneath the run, running first, then failed, findings, passed.
 */
export const PromptRunWithNestedLinters: Story = {
  render: () => <Harness results={promptRunWithNestedLinters} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole("img", { name: "Running" })).toHaveLength(2);
    await expect(canvas.getByText("failed to run")).toBeInTheDocument();
    await expect(canvas.getByText("2.3s")).toBeInTheDocument();
  },
};

/** The failed child is selected: its error, run id and the parent run's session are one click away. */
export const NestedLinterFailed: Story = {
  render: () => (
    <Harness
      results={promptRunWithNestedLinters}
      selected={`${linterRoute(promptRunWithNestedLinters, reviewRunning.linter)}/uir`}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByText("uir executable not found on PATH").length).toBeGreaterThan(0);
    await expect(canvas.getByText("run-91ab")).toBeInTheDocument();
  },
};

/** The running prompt run itself: run id and session id are copyable from the first frame the host has them. */
export const PromptRunIdentity: Story = {
  render: () => (
    <Harness
      results={promptRunWithNestedLinters}
      selected={linterRoute(promptRunWithNestedLinters, reviewRunning.linter)}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(reviewRunning.session_id!)).toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: "Copy session id" })).toBeInTheDocument();
  },
};

/** The host decides what `renderRun` shows; here a stand-in for a live session transcript. */
export const RunningLinterWithRunView: Story = {
  render: () => (
    <Harness
      results={IN_FLIGHT}
      selected={linterRoute(IN_FLIGHT, promptRunning.linter)}
      renderRun={(result) => (
        <div className="rounded border border-border bg-muted/40 p-3 font-mono text-xs">
          following run {result.run_id}
        </div>
      )}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("running")).toBeInTheDocument();
    await expect(canvas.getByText("following run run-7f3a")).toBeInTheDocument();
  },
};
