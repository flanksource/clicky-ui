import { expect, it } from "vitest";
import { validateDocumentSource, isPageSource } from "../agent-source.ts";
import { validateAgentSelection } from "../message-values.ts";

it("accepts a canonical file document only with explicit external-document context", () => {
  const url = "file:///Users/example/Reports/revenue%20report.html#summary";
  expect(() => validateDocumentSource(url)).not.toThrow();
  const selection = { anchor: "#summary", label: "Summary", rect: { left: 0, top: 0, width: 100, height: 30 }, element: { source: url, sourceContext: { mode: "external-document", url }, componentName: "h1", html: "<h1>Summary</h1>", locators: [] } };
  expect(() => validateAgentSelection(selection)).not.toThrow();
  const { sourceContext: _context, ...element } = selection.element;
  expect(() => validateAgentSelection({ ...selection, element })).toThrow(/page source/);
  expect(isPageSource(`${url}:1:1`)).toBe(false);
});

it.each(["file:///Users/example/report.html?view=summary#summary", "file://server/share/report.html"])("accepts canonical credential-free file URL %s", (url) => expect(() => validateDocumentSource(url)).not.toThrow());

it.each(["file:/Users/example/report.html", "file:///Users/example/a/../report.html", "file://user:password@server/share/report.html", "https://user:password@example.com/report", "data:text/html,report", "blob:https://example.com/id"])("rejects noncanonical or credential-bearing document %s", (url) => {
  expect(() => validateDocumentSource(url)).toThrow();
});
