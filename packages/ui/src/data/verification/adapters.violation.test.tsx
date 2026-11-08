import { describe, expect, it } from "vitest";
import { render, within } from "@testing-library/react";
import { TestDetailPanel, TestRunnerProvider, TestTreeNode, emptyTestFilters, type Test, type TestRunnerContext } from "../test-runner";
import { verificationAdapters } from "./adapters";
import { readViolation } from "./stepKind";

const RULE = "looping-generations";
const MESSAGE = "MemberBilling 2026-08-15 respawned 4 times (2026-11-03 → 2026-11-03)";
const WORK_DIR = "/work/purge";
const ACTIVITY = { kind: "Activity", id: "6F1C9A2E-0B44-4E0A-9D2B-7C1E5A3B8D10", name: "Spawned billing #4" };
const POLICY = { kind: "Policy", id: "00059852" };

// The models.Violation gavel's query kind puts on a finding node (fixtures.ViolationMetadataKey).
const violation = {
  severity: "warning",
  message: MESSAGE,
  rule: { method: RULE },
  source: "query",
  locations: [{ entity: ACTIVITY }, { entity: POLICY }, { file: `${WORK_DIR}/purge.fixture.yaml`, line: 42 }],
};

// A finding is a fixture result with no typed step: its detail carries only the violation.
const finding = (record: unknown): Test => ({
  name: `${RULE}: ${MESSAGE}`,
  framework: "fixture",
  warned: true,
  message: MESSAGE,
  work_dir: WORK_DIR,
  context: {},
  detail: { violation: record },
});

function context(node: Test): TestRunnerContext {
  return {
    tests: [node], selected: node, done: true, filters: emptyTestFilters(),
    expandAll: null, busy: {}, adapters: verificationAdapters(),
    onSelect: () => {}, onFiltersChange: () => {}, onExpandAllChange: () => {},
  };
}

describe("a finding's locations", () => {
  it("lists every location in the detail, entity chips and the file relative to the work dir", () => {
    const node = finding(violation);
    render(<TestRunnerProvider value={context(node)}><TestDetailPanel /></TestRunnerProvider>);
    const section = document.querySelector<HTMLElement>("[data-step-section='locations']")!;
    expect(section).not.toBeNull();
    const view = within(section);
    expect(view.getByText("3 locations")).toBeInTheDocument();
    expect(view.getAllByTestId("lint-violation-location").map((row) => row.textContent)).toEqual([
      `Activity · ${ACTIVITY.name}`,
      `Policy · ${POLICY.id}`,
      "purge.fixture.yaml:42",
    ]);
    expect(document.querySelector("[data-raw-detail]")).toBeNull();
  });

  it("keeps the locations out of the tree row, which shows only the rule and message", () => {
    const node = finding(violation);
    const { container } = render(<TestRunnerProvider value={context(node)}><TestTreeNode node={node} selected={false} /></TestRunnerProvider>);
    expect(container.textContent).toContain(`${RULE}: ${MESSAGE}`);
    expect(container.textContent).not.toContain(ACTIVITY.name);
    expect(container.textContent).not.toContain(POLICY.id);
    expect(container.querySelector("[data-lint-violation-locations]")).toBeNull();
  });

  it("reports a malformed violation by path instead of rendering it", () => {
    const node = finding({ ...violation, locations: [{ entity: { kind: "Activity" } }] });
    render(<TestRunnerProvider value={context(node)}><TestDetailPanel /></TestRunnerProvider>);
    expect(document.querySelector("[data-step-section='locations']")).toBeNull();
    expect(document.querySelector("[role='alert']")?.textContent).toContain("detail.violation.locations[0].entity.id must be a string");
  });
});

describe("readViolation", () => {
  it("reads the violation and leaves a detail without one alone", () => {
    expect(readViolation({ violation })).toEqual({ kind: "violation", violation });
    expect(readViolation({ step: { id: "inspect", kind: "query" } })).toEqual({ kind: "none" });
    expect(readViolation(undefined)).toEqual({ kind: "none" });
  });

  it.each([
    [{ ...violation, severity: "fatal" }, 'detail.violation.severity must be one of error, warning, info (got "fatal")'],
    [{ ...violation, rule: { method: 7 } }, "detail.violation.rule.method must be a string"],
    [{ ...violation, locations: {} }, "detail.violation.locations must be an array"],
    [{ ...violation, locations: [{}] }, "detail.violation.locations[0] must be a location naming a file, entity, url, image or message"],
    [{ ...violation, locations: [{ image: { src: "shot.png", x: 0, y: 0, width: "10", height: 4 } }] }, "detail.violation.locations[0].image.width must be a number"],
    [{ ...violation, locations: [{ url: { url: "https://example.com", css: "#a", xpath: "//a" } }] }, "detail.violation.locations[0].url must be a target with at most one selector strategy (got css, xpath)"],
    [{ ...violation, locations: [{ url: { url: "https://example.com", name: "Save" } }] }, "detail.violation.locations[0].url.name must be paired with a role"],
  ])("refuses %j", (record, error) => {
    expect(readViolation({ violation: record })).toEqual({ kind: "invalid", error });
  });
});
