// The fixture step header, failure callout and wait conditions, rendered through
// the detail panel the way a host shows a gavel fixture node.

import { describe, expect, it } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import {
  emptyTestFilters,
  TestDetailPanel,
  TestRunnerProvider,
  type Test,
  type TestRunnerContext,
} from "../test-runner";
import { verificationAdapters } from "./adapters";

function renderDetail(selected: Test) {
  const context: TestRunnerContext = {
    tests: [selected],
    selected,
    done: true,
    filters: emptyTestFilters(),
    expandAll: null,
    busy: {},
    adapters: verificationAdapters(),
    onSelect: () => {},
    onFiltersChange: () => {},
    onExpandAllChange: () => {},
  };
  return render(
    <TestRunnerProvider value={context}>
      <TestDetailPanel />
    </TestRunnerProvider>,
  );
}

const query = <T extends Element>(selector: string) => document.querySelector<T>(selector);

const ORIGIN = {
  file: "pr/ui/testdata/todo-lifecycle/codex.fixture.yaml",
  section_path: "todo lifecycle (codex cli, aimock)",
  kind: "step",
  row_index: 8,
};

const INTERNAL_KEY = "fixtures/todo-lifecycle||file|table:0|row:0|ordinal:7";

const watchNode: Test = {
  name: "watch",
  framework: "fixture",
  passed: true,
  detail: {
    key: INTERNAL_KEY,
    name: "watch",
    kind: "command",
    state: "passed",
    origin: ORIGIN,
    started_at: "2026-10-18T09:00:04Z",
    finished_at: "2026-10-18T09:00:08Z",
    duration: 4_583_837_958,
  },
};

describe("fixture execution header", () => {
  it("renders file, step number, section, kind, state and timing for a progress-only node", () => {
    renderDetail(watchNode);
    const header = within(query("[data-execution-header]")!);
    const file = header.getByText("codex.fixture.yaml");
    expect(file).toHaveAttribute("title", ORIGIN.file);
    expect(header.getByText("step #9 · todo lifecycle (codex cli, aimock)")).toBeInTheDocument();
    expect(header.getByText("command")).toBeInTheDocument();
    expect(header.getByText("passed")).toBeInTheDocument();
    expect(header.getByText("09:00:04 → 09:00:08")).toBeInTheDocument();
    expect(header.getByText("4.6s")).toBeInTheDocument();
  });

  it("does not show the internal key or fall back to the raw tree when every field is consumed", () => {
    renderDetail(watchNode);
    expect(document.body).not.toHaveTextContent(INTERNAL_KEY);
    expect(document.body).not.toHaveTextContent("8 keys");
    expect(query("[data-raw-detail]")).toBeNull();
  });

  it("keeps fields the header does not consume under a collapsed Raw detail", () => {
    renderDetail({ ...watchNode, detail: { ...(watchNode.detail as object), recordings: ["trace.zip"] } });
    const raw = query<HTMLDetailsElement>("[data-raw-detail]")!;
    expect(raw.open).toBe(false);
    expect(within(raw).getByText("recordings")).toBeInTheDocument();
    expect(raw).not.toHaveTextContent(INTERNAL_KEY);
  });

  it("uses the source line when there is no row index", () => {
    renderDetail({ ...watchNode, detail: { kind: "command", origin: { file: "a/b.fixture.yaml", line: 42 } } });
    expect(within(query("[data-execution-header]")!).getByText("line 42")).toBeInTheDocument();
  });

  it("leaves a fixture parent with children on the default body", () => {
    renderDetail({ name: "table", framework: "fixture", passed: true, children: [watchNode], detail: { name: "table" } });
    expect(query("[data-execution-header]")).toBeNull();
  });
});

const FAIL_WHEN = "run.state in ['failed', 'cancelled']";
const CAUSE = "aimock: no scenario rule matched this request\n  model: gpt-5";
const CONDITION = "wait failWhen run.state in ['failed', 'cancelled'] is true";

function failedWait(overrides: { message?: string; wait?: Record<string, unknown>; step?: Record<string, unknown> } = {}): Test {
  return {
    name: "triaged",
    framework: "fixture",
    failed: true,
    message: overrides.message ?? `${CAUSE}\n(${CONDITION})`,
    context: { cel_expression: FAIL_WHEN },
    detail: {
      key: INTERNAL_KEY,
      step: { id: "triaged", kind: "todo" },
      kind: "todo",
      state: "failed",
      origin: ORIGIN,
      outputs: { run: { state: "failed", error: CAUSE } },
      wait: {
        policy: { until: "run.state == 'completed'", failWhen: FAIL_WHEN, interval: "1s", timeout: "1m30s" },
        outcome: "failed",
        durationMs: 19,
        expression: FAIL_WHEN,
        cause: CAUSE,
        outputs: { run: { state: "failed", error: CAUSE } },
        ...overrides.wait,
      },
      ...overrides.step,
    },
  };
}

describe("fixture failed wait", () => {
  it("labels the CEL check failWhen, not expression, when the failWhen condition decided", () => {
    renderDetail(failedWait());
    const expectation = within(query("[data-expectation]")!);
    expect(expectation.getByText("failWhen")).toBeInTheDocument();
    expect(expectation.queryByText("expression")).not.toBeInTheDocument();
  });

  it("labels the CEL check until when the until condition decided", () => {
    renderDetail(failedWait({ wait: { outcome: "timeout", expression: "run.state == 'completed'" } }));
    expect(within(query("[data-expectation]")!).getByText("until")).toBeInTheDocument();
  });

  it("shows the cause in a red callout, once, with the condition line after it", () => {
    renderDetail(failedWait());
    const callout = query("[data-failure-callout]")!;
    expect(callout).toHaveClass("whitespace-pre-wrap", "border-red-500/60");
    expect(callout.textContent?.match(/aimock: no scenario rule matched/g)).toHaveLength(1);
    expect(callout.textContent?.indexOf("aimock")).toBeLessThan(callout.textContent!.indexOf("wait failWhen"));
  });

  it("leads with the wait cause when the message holds only the condition line", () => {
    renderDetail(failedWait({ message: CONDITION }));
    const callout = query("[data-failure-callout]")!;
    expect(callout.children[0]).toHaveTextContent("aimock: no scenario rule matched");
    expect(callout.children[1]).toHaveTextContent(CONDITION);
  });

  it("marks failWhen as the deciding condition and drops the one-line JSON output", () => {
    renderDetail(failedWait());
    expect(query("[data-wait-output]")).toBeNull();
    expect(query("[data-wait-condition=failWhen]")).toHaveTextContent("Failed");
    expect(query("[data-wait-condition=until]")).not.toHaveTextContent("Failed");
  });

  it("opens the wait details when the outcome is not satisfied", () => {
    renderDetail(failedWait());
    expect(query<HTMLDetailsElement>('[data-step-section="wait"] details')!.open).toBe(true);
  });

  it("switches to the Outputs tab from View outputs", () => {
    renderDetail(failedWait());
    fireEvent.click(screen.getByRole("button", { name: "View outputs" }));
    expect(screen.getByRole("tab", { name: "Outputs" })).toHaveAttribute("aria-selected", "true");
    expect(query('[data-step-section="outputs"]')).not.toBeNull();
  });

  it("renders wait outputs inline, collapsed to depth 1, when there is no Outputs tab", () => {
    const node = failedWait();
    const detail = { ...(node.detail as Record<string, unknown>) };
    delete detail.outputs;
    renderDetail({ ...node, detail });
    expect(screen.queryByRole("button", { name: "View outputs" })).not.toBeInTheDocument();
    const outputs = within(query("[data-wait-outputs]")!);
    expect(outputs.getByText("run")).toBeInTheDocument();
    expect(outputs.queryByText("state")).not.toBeInTheDocument();
  });
});

describe("fixture satisfied wait", () => {
  it("keeps the wait details closed", () => {
    const node = failedWait({ wait: { outcome: "satisfied", expression: "run.state == 'completed'", cause: undefined } });
    renderDetail({ ...node, failed: false, passed: true, message: "" });
    expect(query<HTMLDetailsElement>('[data-step-section="wait"] details')!.open).toBe(false);
    expect(query("[data-wait-condition=until]")).toHaveTextContent("Satisfied");
  });
});
