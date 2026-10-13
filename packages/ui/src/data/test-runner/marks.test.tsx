import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import {
  LINT_SEVERITIES,
  TEST_OUTCOMES,
  TEST_TOOLS,
  toolMark,
  type TestOutcome,
} from "./marks";
import { OutcomeIcon, ToolIcon } from "./MarkIcons";
import { STATUS_LABELS, outcomeFor } from "./status";
import type { Test } from "./types";

// Identifiers gavel puts on the wire: testrunner/parsers/types.go Framework
// values, the "task" pseudo-framework, and each linters/*/ Name().
const GAVEL_FRAMEWORKS = ["go test", "ginkgo", "jest", "vitest", "playwright", "fixture", "task"];
const GAVEL_LINTERS = [
  "golangci-lint",
  "eslint",
  "oxlint",
  "tsc",
  "markdownlint",
  "vale",
  "pyright",
  "ruff",
  "betterleaks",
  "jscpd",
  "reactdoctor",
];
// Fixture step types (fixtures FixtureResult.Type, e.g. types/exec.go "exec")
// plus the "checklist" node verifyReportTests synthesizes.
const FIXTURE_STEPS = ["exec", "test", "lint", "verify", "query", "criterion", "checklist"];

describe("test outcome marks", () => {
  it("cover every status the filter bar counts, plus errored", () => {
    const counted = STATUS_LABELS.map((s) => s.key).filter((k) => k !== "total");
    expect(Object.keys(TEST_OUTCOMES).sort()).toEqual([...counted, "errored"].sort());
  });

  it("give every outcome its own glyph, so no two read alike without colour", () => {
    const glyphs = Object.values(TEST_OUTCOMES).map((m) => m.icon);
    expect(new Set(glyphs).size).toBe(glyphs.length);
  });

  it("draw lint severities with the outcome they mean for the verdict", () => {
    expect(LINT_SEVERITIES.error.icon).toBe(TEST_OUTCOMES.failed.icon);
    expect(LINT_SEVERITIES.warning.icon).toBe(TEST_OUTCOMES.warned.icon);
    const outcomeGlyphs = new Set(Object.values(TEST_OUTCOMES).map((m) => m.icon));
    expect(outcomeGlyphs.has(LINT_SEVERITIES.info.icon)).toBe(false);
  });

  it("render with the outcome's label as the accessible name", () => {
    const { container } = render(<OutcomeIcon outcome="timedout" />);
    expect(container.querySelector("svg")?.getAttribute("aria-label")).toBe(
      TEST_OUTCOMES.timedout.label,
    );
  });

  it("spin only while running", () => {
    const spinning = (Object.keys(TEST_OUTCOMES) as TestOutcome[]).filter(
      (o) => TEST_OUTCOMES[o].spin,
    );
    expect(spinning).toEqual(["running"]);
  });
});

describe("outcomeFor", () => {
  const leaf = (flags: Partial<Test>): Test => ({ name: "leaf", ...flags });

  it.each<[Partial<Test>, TestOutcome]>([
    [{ passed: true }, "passed"],
    [{ failed: true }, "failed"],
    [{ warned: true }, "warned"],
    [{ skipped: true }, "skipped"],
    [{ pending: true }, "pending"],
    [{ running: true }, "running"],
    [{ timed_out: true, failed: true }, "timedout"],
  ])("resolves leaf flags %o to %s", (flags, outcome) => {
    expect(outcomeFor(leaf(flags))).toBe(outcome);
  });

  it("rolls a container up to its worst child, never letting warned mask failed", () => {
    const parent: Test = {
      name: "pkg",
      children: [leaf({ warned: true }), leaf({ failed: true }), leaf({ passed: true })],
    };
    expect(outcomeFor(parent)).toBe("failed");
  });

  it("rolls a container whose every leaf was skipped up to skipped, not passed", () => {
    const parent: Test = {
      name: "e2e",
      children: [leaf({ skipped: true }), { name: "nested", children: [leaf({ skipped: true })] }],
    };
    expect(outcomeFor(parent)).toBe("skipped");
  });

  it("keeps a container with some passes and some skips as passed", () => {
    const parent: Test = { name: "pkg", children: [leaf({ skipped: true }), leaf({ passed: true })] };
    expect(outcomeFor(parent)).toBe("passed");
  });

  it("returns null for a status-less leaf", () => {
    expect(outcomeFor(leaf({}))).toBeNull();
  });
});

describe("test and lint tool marks", () => {
  it("have a mark for every framework, linter and fixture step gavel reports", () => {
    const missing = [...GAVEL_FRAMEWORKS, ...GAVEL_LINTERS, ...FIXTURE_STEPS].filter(
      (t) => !toolMark(t),
    );
    expect(missing).toEqual([]);
  });

  it("classify each tool as a test framework, a linter, a fixture step or a runner", () => {
    expect(GAVEL_LINTERS.filter((t) => toolMark(t)!.kind !== "lint")).toEqual([]);
    expect(FIXTURE_STEPS.filter((t) => toolMark(t)!.kind !== "fixture")).toEqual([]);
    expect(
      GAVEL_FRAMEWORKS.filter((t) => t !== "task" && toolMark(t)!.kind !== "test"),
    ).toEqual([]);
  });

  it("return null for a tool the catalog does not know", () => {
    expect(toolMark("rspec")).toBeNull();
    expect(toolMark(undefined)).toBeNull();
  });

  it("render a labelled glyph for known tools and nothing for unknown ones", () => {
    const known = render(<ToolIcon tool="eslint" />);
    expect(known.container.querySelector("svg")?.getAttribute("aria-label")).toBe(
      TEST_TOOLS.eslint!.label,
    );
    const unknown = render(<ToolIcon tool="rspec" />);
    expect(unknown.container.innerHTML).toBe("");
  });
});
