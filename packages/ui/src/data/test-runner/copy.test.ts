import { describe, expect, it } from "vitest";
import { buildNodeBrief, buildNodeJson, genericCopySections, mergeCopySections } from "./copy";
import type { Test } from "./types";

const ms = (n: number) => n * 1e6;

const gomegaFailure: Test = {
  name: "persists the selected revision",
  framework: "ginkgo",
  failed: true,
  duration: ms(18),
  file: "store/plan_store_test.go",
  line: 58,
  failure_detail: {
    kind: "gomega",
    summary: "Expected the stored revision to match the selected one",
    matcher: "Equal",
    expected: "<int>: 3",
    actual: "<int>: 0",
    location: "store/plan_store_test.go:58",
  },
};

describe("buildNodeBrief: generic sections", () => {
  it("renders a gomega failure as facts, the error, and the matcher/expected/actual/at", () => {
    expect(buildNodeBrief(gomegaFailure, {})).toEqual(
      [
        "# persists the selected revision",
        "",
        "- **Result:** failed",
        "- **Tool:** ginkgo",
        "- **Location:** store/plan_store_test.go:58",
        "- **Duration:** 18ms",
        "",
        "## Error",
        "",
        "```",
        "Expected the stored revision to match the selected one",
        "```",
        "",
        "## Expectation",
        "",
        "```",
        "matcher: Equal",
        "expected: <int>: 3",
        "actual: <int>: 0",
        "at: store/plan_store_test.go:58",
        "```",
      ].join("\n"),
    );
  });

  it("places adapter sections after the error and before stdout/stderr, and fences a stack", () => {
    const panic: Test = {
      name: "TestRevision/nil store",
      framework: "go test",
      failed: true,
      message: "panic: nil pointer",
      failure_detail: { kind: "panic", stack: "goroutine 41 [running]:\nmain.f()" },
      stdout: "=== RUN   TestRevision",
      stderr: "[signal SIGSEGV]",
    };
    const adapter = { brief: [{ title: "Goroutines", body: "goroutine 41 [running] main.f" }] };

    expect(buildNodeBrief(panic, adapter)).toEqual(
      [
        "# TestRevision/nil store",
        "",
        "- **Result:** failed",
        "- **Tool:** go test",
        "",
        "## Error",
        "",
        "```",
        "panic: nil pointer",
        "```",
        "",
        "## Stack",
        "",
        "```",
        "goroutine 41 [running]:\nmain.f()",
        "```",
        "",
        "## Goroutines",
        "",
        "```",
        "goroutine 41 [running] main.f",
        "```",
        "",
        "## stdout",
        "",
        "```",
        "=== RUN   TestRevision",
        "```",
        "",
        "## stderr",
        "",
        "```",
        "[signal SIGSEGV]",
        "```",
      ].join("\n"),
    );
  });

  it("lengthens the fence past any backtick run in the body so output cannot close it early", () => {
    const node: Test = { name: "prints markdown", stdout: "```go\nfmt.Println()\n```" };
    expect(buildNodeBrief(node, {})).toEqual(
      ["# prints markdown", "", "## stdout", "", "````", "```go\nfmt.Println()\n```", "````"].join(
        "\n",
      ),
    );
  });

  it("inserts a markdown section unfenced so its links stay live", () => {
    const link = "- Run: [run-7](https://example.test/run/7)";
    const adapter = { brief: [{ title: "Links", markdown: true, body: link }] };
    expect(buildNodeBrief({ name: "x" }, adapter)).toEqual(
      ["# x", "", "## Links", "", link].join("\n"),
    );
  });

  it("keeps the generic Error section when an adapter contributes one with the same title", () => {
    const node: Test = { name: "x", message: "generic" };
    const adapter = { brief: [{ title: "Error", body: "adapter" }] };
    expect(buildNodeBrief(node, adapter)).toEqual(
      ["# x", "", "## Error", "", "```", "generic", "```"].join("\n"),
    );
  });

  it("omits the Result fact for a node with no status and no children", () => {
    expect(
      genericCopySections({ name: "TestExport/writes csv", framework: "go test" }).facts,
    ).toEqual([{ label: "Tool", value: "go test" }]);
  });
});

describe("mergeCopySections", () => {
  it("concatenates in order and keeps the first fact, section and item per label/title", () => {
    const merged = mergeCopySections([
      {
        facts: [{ label: "Env", value: "lab" }],
        brief: [{ title: "Command", lang: "sh", body: "$ a" }],
        items: [{ label: "Copy command", value: "a" }],
      },
      {
        facts: [
          { label: "Env", value: "prod" },
          { label: "Plan", value: "GL" },
        ],
        brief: [
          { title: "Command", body: "$ b" },
          { title: "Criteria", body: "- [x] done" },
        ],
        items: [
          { label: "Copy command", value: "b" },
          { label: "Copy recording path", reason: "no file" },
        ],
      },
    ]);
    expect(merged).toEqual({
      facts: [
        { label: "Env", value: "lab" },
        { label: "Plan", value: "GL" },
      ],
      brief: [
        { title: "Command", lang: "sh", body: "$ a" },
        { title: "Criteria", body: "- [x] done" },
      ],
      items: [
        { label: "Copy command", value: "a" },
        { label: "Copy recording path", reason: "no file" },
      ],
    });
  });
});

describe("buildNodeJson", () => {
  it("serializes the node without its children subtree, 2-space indented", () => {
    const node: Test = { name: "table", failed: true, children: [{ name: "row", passed: true }] };
    expect(buildNodeJson(node)).toEqual('{\n  "name": "table",\n  "failed": true\n}');
  });
});
