import { describe, expect, it, vi } from "vitest";
import { render, within } from "@testing-library/react";
import { TestDetailPanel, TestRunnerProvider, emptyTestFilters, type Test, type TestRunnerContext } from "../test-runner";
import { verificationAdapters, type VerificationAdapterOptions } from "./adapters";

const STEP = "approval";

const waitingStep: Test = { name: STEP, framework: "fixture", running: true, waiting: true };

function renderDetail(node: Test, options: VerificationAdapterOptions) {
  const context: TestRunnerContext = {
    tests: [node], selected: node, done: false, filters: emptyTestFilters(),
    expandAll: null, busy: {}, adapters: verificationAdapters(options),
    onSelect: () => {}, onFiltersChange: () => {}, onExpandAllChange: () => {},
  };
  return render(<TestRunnerProvider value={context}><TestDetailPanel /></TestRunnerProvider>);
}

const hostForm = (node: Test) => <div data-testid="host-form">answer {node.name}</div>;

describe("a step waiting on its form", () => {
  it("renders the host's pending form for that step as the detail's first section", () => {
    const renderPendingPrompt = vi.fn(hostForm);
    renderDetail(waitingStep, { renderPendingPrompt });

    const section = document.querySelector<HTMLElement>("[data-step-section='pending-form']");
    expect(section).not.toBeNull();
    expect(within(section!).getByTestId("host-form")).toHaveTextContent(`answer ${STEP}`);
    expect(within(section!).getByText("Awaiting answer")).toBeInTheDocument();
    expect(document.querySelector("[data-step-section]")).toBe(section);
    expect(renderPendingPrompt.mock.calls.every(([node]) => node.name === STEP)).toBe(true);
  });

  it("asks the host for no form once the step stops waiting", () => {
    const renderPendingPrompt = vi.fn(hostForm);
    renderDetail({ ...waitingStep, running: false, waiting: false, passed: true }, { renderPendingPrompt });

    expect(renderPendingPrompt).not.toHaveBeenCalled();
    expect(document.querySelector("[data-step-section='pending-form']")).toBeNull();
  });

  it("shows no pending-form section when the host renders none", () => {
    renderDetail(waitingStep, {});
    expect(document.querySelector("[data-step-section='pending-form']")).toBeNull();
  });
});
