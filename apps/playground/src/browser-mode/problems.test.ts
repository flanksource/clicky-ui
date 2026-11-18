import { expect, it } from "vitest";
import { groupRuntimeProblems, policyIssues, runtimeIssue } from "./problems";

it("groups package subpaths while preserving every affected source location", () => {
  const locations = ["@acme/icons/check", "@acme/icons/error"].map((specifier, index) => ({ class: "external-package", specifier, file: `card-${index}.tsx`, line: index + 1, blocking: true, reason: "Missing import", fix: "Add package" }));
  expect(groupRuntimeProblems(locations)).toEqual([{ id: "external-package:@acme/icons", kind: "external-package", package: "@acme/icons", message: "Missing runtime import: @acme/icons", locations, fix: "Add package" }]);
});

it("retains structured runtime failure phases and locations", () => {
  expect(runtimeIssue({ pageRuntime: { phase: "compile", message: "Invalid syntax", file: "report.tsx", line: 12, column: 3 } }, "page")).toMatchObject({ class: "compile", reason: "Invalid syntax", file: "report.tsx", line: 12, column: 3 });
});

it("groups each package the dependency policy rejects as a fixable policy problem naming its declaring scope", () => {
  const [problem] = groupRuntimeProblems(policyIssues({ pending: [{ name: "entities", scope: "browser-workspace" }], policy: "strict", file: "widths.tsx" }));
  expect({ id: problem?.id, kind: problem?.kind, package: problem?.package, message: problem?.message }).toEqual({ id: "policy:entities", kind: "policy", package: "entities", message: "entities, declared in the browser workspace override, is not allowed by dependency policy strict" });
});

it("directs missing singleton exports to configuration instead of offering a forbidden dependency fix", () => {
  const [problem] = groupRuntimeProblems([{ class: "external-package", specifier: "react-dom/server", file: "math.tsx", line: 2, blocking: true, reason: "Missing import", fix: "Add package" }]);
  expect(problem).toMatchObject({ package: null, fix: expect.stringContaining("singleton") });
});
