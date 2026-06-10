import { describe, expect, it } from "vitest";
import {
  collapseSingleChildChains,
  collectFrameworks,
  filterTests,
  formatCount,
  formatTestDuration,
  hasFailed,
  hasPending,
  humanizeName,
  statusIconFor,
  statusToneFor,
  sum,
  sumNonTaskTests,
  testStatus,
  totalDuration,
} from "./status";
import type { Test } from "./types";
import { decodeFilterState } from "./filterState";
import { UiError, UiHourglass, UiLoader, UiPass } from "../../icons";

const leaf = (name: string, flag: Partial<Test>): Test => ({ name, ...flag });

// A suite: one passing + one failing leaf under group A, one running leaf under
// group B, plus a timed-out leaf. Independent expected counts below.
const suite: Test[] = [
  {
    name: "A",
    children: [
      leaf("a-pass", { passed: true, framework: "go test", duration: 5e6 }),
      leaf("a-fail", { failed: true, framework: "ginkgo", duration: 12e6 }),
    ],
  },
  {
    name: "B",
    children: [
      leaf("b-run", { running: true, framework: "fixture" }),
      leaf("b-timeout", { timed_out: true, framework: "fixture" }),
    ],
  },
];

describe("sum", () => {
  it("rolls up leaf verdicts across the whole forest", () => {
    const total = suite.reduce(
      (acc, t) => {
        const s = sum(t);
        acc.total += s.total;
        acc.passed += s.passed;
        acc.failed += s.failed;
        acc.running += s.running;
        acc.timedout += s.timedout;
        return acc;
      },
      { total: 0, passed: 0, failed: 0, running: 0, timedout: 0 },
    );
    expect(total).toEqual({ total: 4, passed: 1, failed: 1, running: 1, timedout: 1 });
  });

  it("prefers an explicit summary over walking children", () => {
    const node: Test = {
      name: "pkg",
      summary: { Total: 9, Passed: 7, Failed: 2, Skipped: 0, Pending: 0, Duration: 0 },
      children: [leaf("ignored", { passed: true })],
    };
    expect(sum(node)).toMatchObject({ total: 9, passed: 7, failed: 2 });
  });

  it("counts a timed-out leaf only as timedout, never as its underlying verdict", () => {
    expect(sum(leaf("x", { failed: true, timed_out: true }))).toMatchObject({
      total: 1,
      failed: 0,
      timedout: 1,
    });
  });
});

describe("sumNonTaskTests", () => {
  it("excludes task-framework nodes but keeps their non-task descendants", () => {
    const tree: Test = {
      name: "root",
      framework: "task",
      children: [leaf("real", { passed: true, framework: "go test" })],
    };
    expect(sumNonTaskTests(tree)).toMatchObject({ total: 1, passed: 1 });
  });
});

describe("hasFailed / hasPending", () => {
  it("propagate from any descendant", () => {
    expect(hasFailed(suite[0])).toBe(true);
    expect(hasFailed(suite[1])).toBe(false);
    expect(hasPending(suite[0])).toBe(false);
    expect(hasPending({ name: "p", children: [leaf("q", { pending: true })] })).toBe(true);
  });
});

describe("testStatus", () => {
  it("resolves a single verdict with timed_out taking precedence", () => {
    expect(testStatus(leaf("x", { passed: true }))).toBe("passed");
    expect(testStatus(leaf("x", { failed: true, timed_out: true }))).toBe("timedout");
    expect(testStatus(leaf("x", {}))).toBeNull();
  });
});

describe("statusIconFor / statusToneFor", () => {
  it("map leaf verdicts to clicky icons and semantic tones", () => {
    expect(statusIconFor(leaf("x", { passed: true }))).toBe(UiPass);
    expect(statusIconFor(leaf("x", { failed: true }))).toBe(UiError);
    expect(statusIconFor(leaf("x", { running: true }))).toBe(UiLoader);
    expect(statusIconFor(leaf("x", { timed_out: true }))).toBe(UiHourglass);
    expect(statusToneFor(leaf("x", { passed: true }))).toBe("success");
    expect(statusToneFor(leaf("x", { failed: true }))).toBe("danger");
  });

  it("rolls a container with a failing descendant up to danger", () => {
    expect(statusToneFor(suite[0])).toBe("danger");
    expect(statusIconFor(suite[0])).toBe(UiError);
  });
});

describe("formatTestDuration", () => {
  it("renders sub-second as ms and seconds with one decimal", () => {
    expect(formatTestDuration(0)).toBe("");
    expect(formatTestDuration(42e6)).toBe("42ms");
    expect(formatTestDuration(1500e6)).toBe("1.5s");
  });
});

describe("formatCount", () => {
  it("uses raw, k, and M thresholds", () => {
    expect(formatCount(999)).toBe("999");
    expect(formatCount(1500)).toBe("1.5k");
    expect(formatCount(2_000_000)).toBe("2M");
  });
});

describe("humanizeName", () => {
  it("splits Go test names and leaves other frameworks untouched", () => {
    expect(humanizeName("TestParseConfig", "go test")).toBe("Parse Config");
    expect(humanizeName("TestA/handles_empty_input", "go test")).toBe("A / handles empty input");
    expect(humanizeName("should log in", "ginkgo")).toBe("should log in");
  });
});

describe("totalDuration", () => {
  it("uses own duration or sums children", () => {
    expect(totalDuration(suite[0])).toBe(17e6);
    expect(totalDuration(leaf("x", { duration: 3e6 }))).toBe(3e6);
  });
});

describe("collectFrameworks", () => {
  it("returns unique non-task frameworks, sorted", () => {
    expect(collectFrameworks(suite)).toEqual(["fixture", "ginkgo", "go test"]);
  });
});

describe("collapseSingleChildChains", () => {
  it("joins a chain of status-less single-child containers down to the leaf", () => {
    const tree: Test = {
      name: "outer",
      children: [{ name: "inner", children: [leaf("spec", { passed: true })] }],
    };
    const [collapsed] = collapseSingleChildChains([tree]);
    expect(collapsed.name).toBe("outer > inner > spec");
    expect(collapsed.passed).toBe(true);
    expect(collapsed.children).toBeUndefined();
  });

  it("stops collapsing at a container with multiple children", () => {
    const tree: Test = {
      name: "outer",
      children: [
        { name: "group", children: [leaf("p", { passed: true }), leaf("q", { failed: true })] },
      ],
    };
    const [collapsed] = collapseSingleChildChains([tree]);
    expect(collapsed.name).toBe("outer > group");
    expect(collapsed.children?.map((c) => c.name)).toEqual(["p", "q"]);
  });

  it("does not collapse a container that has its own verdict", () => {
    const tree: Test = {
      name: "outer",
      failed: true,
      children: [leaf("only", { failed: true })],
    };
    expect(collapseSingleChildChains([tree])[0].name).toBe("outer");
  });
});

describe("filterTests", () => {
  it("keeps only branches with a matching leaf when status is included", () => {
    const result = filterTests(suite, decodeFilterState(["failed"]), new Map());
    expect(result.map((t) => t.name)).toEqual(["A"]);
    expect(result[0].children?.map((c) => c.name)).toEqual(["a-fail"]);
  });

  it("drops excluded statuses", () => {
    const result = filterTests(suite, decodeFilterState(["!passed"]), new Map());
    const names = result.flatMap((t) => t.children?.map((c) => c.name) ?? []);
    expect(names).not.toContain("a-pass");
    expect(names).toContain("a-fail");
  });

  it("returns the input untouched when no filters are set", () => {
    expect(filterTests(suite, new Map(), new Map())).toBe(suite);
  });
});
