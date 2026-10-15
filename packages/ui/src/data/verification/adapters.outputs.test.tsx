import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { TestDetailPanel, TestRunnerProvider, emptyTestFilters, type Test, type TestRunnerContext } from "../test-runner";
import { verificationAdapters, type VerificationAdapterOptions } from "./adapters";

const withOutputs = (outputs: unknown): Test => ({
  name: "run reaches verified",
  framework: "todo_prompt",
  passed: true,
  detail: { step: { id: "run", kind: "todo_prompt" }, outputs },
});

function context(node: Test, options: VerificationAdapterOptions = {}): TestRunnerContext {
  return {
    tests: [node], selected: node, done: true, filters: emptyTestFilters(),
    expandAll: null, busy: {}, adapters: verificationAdapters(options),
    onSelect: () => {}, onFiltersChange: () => {}, onExpandAllChange: () => {},
  };
}

function Panel({ node, options = {} }: { node: Test; options?: VerificationAdapterOptions }) {
  return <TestRunnerProvider value={context(node, options)}><TestDetailPanel /></TestRunnerProvider>;
}

describe("verification outputs tab", () => {

  it("selects the latest attempt in the header and switches its execution and outputs together", () => {
    const first = { name: "run", framework: "todo_prompt", failed: true, stdout: "launch refused", detail: { step: { id: "run", kind: "todo_prompt" }, outputs: { phase: "refused" } } };
    const last = { name: "run", framework: "todo_prompt", passed: true, stdout: "launch accepted", detail: { step: { id: "run", kind: "todo_prompt" }, outputs: { phase: "verified" }, wait: { policy: { until: "phase == 'verified'" }, outcome: "satisfied", durationMs: 1500, outputs: { phase: "verified" } } } };
    render(<Panel node={{ ...withOutputs({ phase: "verified" }), detail: { ...last.detail, attempts: [{ attempt: 1, status: "failed", result: first }, { attempt: 2, status: "passed", result: last }] } }} />);
    const chooser = screen.getByRole("combobox", { name: "Attempt" });
    expect(chooser.closest("[data-detail-header]")).not.toBeNull();
    expect(chooser).toHaveValue("2");
    expect(screen.getByText("launch accepted")).toBeInTheDocument();
    expect(document.querySelector("[data-wait-summary]")).toHaveTextContent("1.5s");
    fireEvent.change(chooser, { target: { value: "1" } });
    expect(screen.getByText("launch refused")).toBeInTheDocument();
    expect(screen.queryByText("launch accepted")).not.toBeInTheDocument();
    expect(document.querySelector("[data-wait-summary]")).toBeNull();
    fireEvent.click(screen.getByRole("tab", { name: "Outputs" }));
    expect(screen.getByText("refused")).toBeInTheDocument();
    expect(screen.queryByText("verified")).not.toBeInTheDocument();
  });

  it("hides the attempt chooser for a single stored attempt", () => {
    render(<Panel node={{ ...withOutputs({ phase: "verified" }), detail: { step: { id: "run", kind: "todo_prompt" }, attempts: [{ attempt: 1, status: "passed", result: withOutputs({ phase: "verified" }) }] } }} />);
    expect(screen.queryByRole("combobox", { name: "Attempt" })).not.toBeInTheDocument();
    expect(document.querySelector('[data-step-section="attempts"]')).toBeNull();
  });
  it("keeps final outputs out of Detail and renders them when Outputs is selected", () => {
    render(<Panel node={withOutputs({ todo: { status: "verified" } })} />);
    expect(screen.getByRole("tab", { name: "Detail" })).toHaveAttribute("aria-selected", "true");
    expect(screen.queryByText("verified")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: "Outputs" }));
    expect(screen.getByText("verified")).toBeInTheDocument();
    expect(screen.queryByText("todo_prompt · run")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: "Detail" }));
    expect(screen.getByText("todo_prompt · run")).toBeInTheDocument();
    expect(screen.queryByText("verified")).not.toBeInTheDocument();
  });

  it.each([
    { description: "an empty object", outputs: {}, expected: "{}" },
    { description: "null", outputs: null, expected: "null" },
    { description: "false", outputs: false, expected: "false" },
    { description: "zero", outputs: 0, expected: "0" },
  ])("offers Outputs for $description", ({ outputs, expected }) => {
    render(<Panel node={withOutputs(outputs)} />);
    fireEvent.click(screen.getByRole("tab", { name: "Outputs" }));
    expect(screen.getByText(expected)).toBeInTheDocument();
  });

  it("omits Outputs when the step has no outputs", () => {
    render(<Panel node={withOutputs(undefined)} />);
    expect(screen.queryByRole("tab", { name: "Outputs" })).not.toBeInTheDocument();
    expect(screen.getByText("todo_prompt · run")).toBeInTheDocument();
  });

  it("shows the newly selected step's outputs and returns to Detail for a step without outputs", () => {
    const view = render(<Panel node={withOutputs({ status: "failed" })} />);
    fireEvent.click(screen.getByRole("tab", { name: "Outputs" }));
    view.rerender(<Panel node={withOutputs({ status: "verified" })} />);
    expect(screen.queryByText("failed")).not.toBeInTheDocument();
    expect(screen.getByText("verified")).toBeInTheDocument();
    view.rerender(<Panel node={withOutputs(undefined)} />);
    expect(screen.queryByRole("tab", { name: "Outputs" })).not.toBeInTheDocument();
    expect(screen.getByText("todo_prompt · run")).toBeInTheDocument();
  });

  it("keeps invalid step details visible rather than offering a partially parsed Outputs tab", () => {
    render(<Panel node={{ ...withOutputs({ status: "verified" }), detail: { step: { kind: "todo_prompt" }, outputs: { status: "verified" } } }} />);
    expect(screen.getByRole("alert")).toHaveTextContent("detail.step.id");
    expect(screen.queryByRole("tab", { name: "Outputs" })).not.toBeInTheDocument();
  });
});

describe("verification wait renderer", () => {
  const node: Test = {
    ...withOutputs({ todo: { status: "verified" } }),
    detail: {
      step: { id: "run", kind: "todo_prompt" },
      outputs: { todo: { status: "verified" } },
      wait: {
        policy: { until: "todo.status == 'verified'" }, outcome: "satisfied",
        durationMs: 1250, outputs: { status: "verified" },
      },
      attempts: [{ attempt: 1, status: "passed", durationMs: 60 }],
    },
  };

  it("passes the parsed wait to the host renderer and retains the other detail sections", () => {
    render(<Panel node={node} options={{ renderWait: (wait) => <p>Host wait: {wait.outcome}, {wait.durationMs}ms, {wait.policy.until}</p> }} />);
    expect(screen.getByText("Host wait: satisfied, 1250ms, todo.status == 'verified'")).toBeInTheDocument();
    expect(document.querySelector("[data-wait-observation]")).toBeNull();
    expect(screen.queryByRole("combobox", { name: "Attempt" })).not.toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Outputs" })).toBeInTheDocument();
  });

  it("uses the supplied renderer even when it deliberately renders nothing", () => {
    render(<Panel node={node} options={{ renderWait: () => null }} />);
    expect(document.querySelector('[data-step-section="wait"]')).toBeNull();
    expect(screen.queryByRole("combobox", { name: "Attempt" })).not.toBeInTheDocument();
  });
});
