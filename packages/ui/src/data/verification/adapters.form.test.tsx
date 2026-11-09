import { describe, expect, it } from "vitest";
import { render, within } from "@testing-library/react";
import { TestDetailPanel, TestRunnerProvider, TestTreeNode, emptyTestFilters, type Test, type TestRunnerContext } from "../test-runner";
import { verificationAdapters } from "./adapters";
import { readStepDetail } from "./stepKind";

const REVIEWED = 4;
const ANSWERER = "ops@example.com";

// The form record gavel's form kind publishes as `detail.form`.
const form = {
  title: "Purge staged activities?",
  description: "Review the staged GUIDs first.",
  schema: {
    type: "object",
    required: ["expectedActivities"],
    properties: {
      expectedActivities: { type: "integer", title: "Reviewed staged count" },
      reload: { type: "boolean", title: "Reload mode" },
    },
  },
  values: { expectedActivities: REVIEWED, reload: false },
  state: "answered",
  answeredBy: ANSWERER,
  answeredAt: "2026-11-08T09:00:00Z",
};

const formStep = (record: unknown): Test => ({
  name: "approval",
  framework: "fixture",
  passed: true,
  detail: { step: { id: "approval", kind: "form" }, outputs: { approved: true }, form: record },
});

function runnerContext(node: Test): TestRunnerContext {
  return {
    tests: [node], selected: node, done: true, filters: emptyTestFilters(),
    expandAll: null, busy: {}, adapters: verificationAdapters(),
    onSelect: () => {}, onFiltersChange: () => {}, onExpandAllChange: () => {},
  };
}

function renderDetail(node: Test) {
  return render(<TestRunnerProvider value={runnerContext(node)}><TestDetailPanel /></TestRunnerProvider>);
}

/** The tree row's step badge text, or null when the row carries none. */
function rowBadge(node: Test): string | null {
  const { container } = render(<TestRunnerProvider value={runnerContext(node)}><TestTreeNode node={node} selected={false} /></TestRunnerProvider>);
  return container.querySelector("[data-step-badge]")?.textContent ?? null;
}

describe("a form step's form", () => {
  it("renders the schema read-only with the answer, its state and who answered", () => {
    renderDetail(formStep(form));
    const section = document.querySelector<HTMLElement>("[data-step-section='form']")!;
    expect(section).not.toBeNull();
    const view = within(section);
    expect(view.getByText("Answered")).toBeInTheDocument();
    expect(view.getByText(form.title)).toBeInTheDocument();
    expect(view.getByText(`by ${ANSWERER} at 09:00:00`)).toBeInTheDocument();
    expect(view.getByText("Reviewed staged count")).toBeInTheDocument();
    const inputs = [...section.querySelectorAll<HTMLInputElement>("input, textarea, select")];
    expect(inputs.map((input) => input.type === "checkbox" ? input.checked : input.value)).toContain(String(REVIEWED));
    expect(inputs.filter((input) => !input.readOnly && !input.disabled)).toEqual([]);
  });

  it("labels a rejected form", () => {
    renderDetail(formStep({ ...form, state: "rejected", values: {} }));
    expect(within(document.querySelector<HTMLElement>("[data-step-section='form']")!).getByText("Rejected")).toBeInTheDocument();
  });

  it.each([
    ["answered", "Answered"],
    ["supplied", "Supplied"],
    ["rejected", "Rejected"],
    ["unanswered", "Not answered"],
  ])("badges a %s form step's tree row %s", (state, label) => {
    expect(rowBadge(formStep({ ...form, state }))).toBe(label);
  });

  it("badges a step waiting on its form as awaiting an answer, and a plain running step not at all", () => {
    expect(rowBadge({ name: "approval", framework: "fixture", running: true, waiting: true })).toBe("Awaiting answer");
    expect(rowBadge({ name: "inspect", framework: "fixture", running: true })).toBeNull();
  });

  it("keeps the form out of the raw detail and reports a malformed one by path", () => {
    const parsed = readStepDetail(formStep(form).detail);
    expect(parsed.kind === "step" && "form" in parsed.step.rest).toBe(false);
    expect(readStepDetail(formStep({ ...form, state: "pending" }).detail)).toEqual({
      kind: "invalid",
      error: 'detail.form.state must be one of answered, rejected, supplied, unanswered (got "pending")',
    });
  });
});
