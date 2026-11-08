// The Source section of a queued or failed fixture step: the YAML or markdown lines the
// step was written as, which gavel attaches as `detail.source`.

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
import { readStepSource, sourceTabLabel } from "./stepSource";

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

const FILE = "pkg/provider/demo/testdata/template-render.fixture.yaml";
const STEP_TEXT = "  - id: us-f5472\n    kind: exec\n    exec: ./xero-cli";

const SOURCE = { file: FILE, line: 123, end_line: 125, language: "yaml", text: STEP_TEXT };

function failedStep(source: unknown): Test {
  return {
    name: "us-f5472",
    framework: "fixture",
    failed: true,
    message: "expected exit code 0, got 1",
    context: { command: "./xero-cli templates render us-f5472", exit_code: 1 },
    detail: { step: { id: "us-f5472", kind: "exec" }, source },
  };
}

describe("readStepSource", () => {
  it("reads gavel's source snippet", () => {
    expect(readStepSource({ source: { ...SOURCE, more_lines: 3 } })).toEqual({
      kind: "source",
      source: { file: FILE, line: 123, endLine: 125, language: "yaml", text: STEP_TEXT, moreLines: 3 },
    });
  });

  it("is none without a source", () => {
    expect(readStepSource({ step: { id: "a", kind: "exec" } })).toEqual({ kind: "none" });
  });

  it("names the field a malformed source got wrong", () => {
    expect(readStepSource({ source: { ...SOURCE, line: "123" } })).toEqual({
      kind: "invalid",
      error: "detail.source.line must be a number",
    });
  });
});

describe("fixture step source", () => {
  it("shows the step's lines under its file and line range", () => {
    renderDetail(failedStep(SOURCE));
    const section = within(query("[data-step-source]")!);
    const location = section.getByText("template-render.fixture.yaml:123-125");
    expect(location).toHaveAttribute("title", FILE);
    expect(query("[data-step-source]")).toHaveTextContent("- id: us-f5472");
    expect(query("[data-step-source]")).toHaveTextContent("exec: ./xero-cli");
  });

  it("notes how many lines a long step leaves out", () => {
    renderDetail(failedStep({ ...SOURCE, more_lines: 12 }));
    expect(within(query("[data-step-source]")!).getByText("… 12 more lines")).toBeInTheDocument();
  });

  it("says why the source could not be read", () => {
    renderDetail(failedStep({ file: FILE, line: 123, end_line: 125, error: "open template-render.fixture.yaml: no such file" }));
    expect(query("[data-step-source]")).toHaveTextContent("Source unavailable: open template-render.fixture.yaml: no such file");
  });

  it("keeps the source out of the raw detail", () => {
    renderDetail(failedStep(SOURCE));
    expect(query("[data-raw-detail]")).toBeNull();
  });

  it("reports a malformed source instead of guessing", () => {
    renderDetail(failedStep({ ...SOURCE, end_line: null }));
    expect(query("[data-step-source]")).toHaveTextContent("detail.source.end_line must be a number");
  });

  it("shows a passing step's source on a tab named for its language, not inline", () => {
    renderDetail({ ...failedStep(SOURCE), failed: false, passed: true });
    expect(query("[data-step-source]")).toBeNull();
    fireEvent.click(screen.getByRole("tab", { name: "YAML" }));
    expect(query("[data-step-source]")).toHaveTextContent("exec: ./xero-cli");
  });

  it("previews a queued step's authored source and keeps its YAML tab before a result arrives", () => {
    renderDetail({
      name: "us-f5472",
      framework: "fixture",
      pending: true,
      detail: { name: "us-f5472", kind: "command", state: "queued", source: SOURCE },
    });
    expect(query("[data-step-source]")).toHaveTextContent("- id: us-f5472 kind: exec exec: ./xero-cli");
    expect(query("[data-raw-detail]")).toBeNull();
    fireEvent.click(screen.getByRole("tab", { name: "YAML" }));
    expect(query("[data-step-source]")).toHaveTextContent("exec: ./xero-cli");
  });

  it.each([
    ["markdown", "Markdown"],
    ["json", "JSON"],
    [undefined, "Source"],
  ])("labels a %s source tab %s", (language, label) => {
    const { language: _drop, ...rest } = SOURCE;
    expect(sourceTabLabel(readStepSource({ source: language ? { ...rest, language } : rest }))).toBe(label);
  });
});
