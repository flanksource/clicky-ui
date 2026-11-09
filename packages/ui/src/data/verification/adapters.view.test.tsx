import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { TestDetailPanel, TestRunnerProvider, emptyTestFilters, type Test, type TestRunnerContext } from "../test-runner";
import { verificationAdapters } from "./adapters";
import { readStepDetail } from "./stepKind";

const guid = "a3";
const size = "30";

// The clicky document gavel's query kind publishes (formatters.NewClickyDocument
// over commons-db's Result.Table): one table with the profile's columns.
const view = {
  version: 1,
  node: {
    kind: "table",
    columns: [{ name: "guid", label: "guid" }, { name: "size", label: "size" }],
    rows: [{ cells: { guid: { kind: "text", text: guid, plain: guid }, size: { kind: "text", text: size, plain: size } } }],
  },
};

const queryStep = (detailView: unknown): Test => ({
  name: "inspect",
  framework: "fixture",
  warned: true,
  detail: { step: { id: "inspect", kind: "query" }, outputs: { rowCount: 1 }, view: detailView },
});

function context(node: Test): TestRunnerContext {
  return {
    tests: [node], selected: node, done: true, filters: emptyTestFilters(),
    expandAll: null, busy: {}, adapters: verificationAdapters(),
    onSelect: () => {}, onFiltersChange: () => {}, onExpandAllChange: () => {},
  };
}

describe("a step's view", () => {
  it("renders the step's clicky document as its Response on the detail tab", () => {
    const node = queryStep(view);
    render(<TestRunnerProvider value={context(node)}><TestDetailPanel /></TestRunnerProvider>);
    const response = document.querySelector("[data-step-section='view']");
    expect(response).not.toBeNull();
    expect(screen.getByText(guid)).toBeInTheDocument();
    expect(screen.getByText(size)).toBeInTheDocument();
  });

  it("keeps view out of the raw detail and reports a malformed one by path", () => {
    const parsed = readStepDetail(queryStep(view).detail);
    expect(parsed.kind === "step" && parsed.step.view).toEqual(view);
    expect(parsed.kind === "step" && "view" in parsed.step.rest).toBe(false);
    expect(readStepDetail(queryStep({ node: {} }).detail)).toEqual({ kind: "invalid", error: "detail.view.version must be a number" });
  });
});
