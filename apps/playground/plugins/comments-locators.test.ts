// @vitest-environment node
import { describe, expect, it } from "vitest";

import { assertElementContext } from "./comments-store";

const base = { source: "src/pages/sample.tsx:12", html: "<p>Primary</p>" };
const valid = [
  { kind: "css", selector: "#lockups p" },
  { kind: "role", tag: "button", role: "button", name: "Save draft" },
  { kind: "text", tag: "p", text: "Primary", heading: { selector: "h3", text: "Serve" } },
  { kind: "text", tag: "p", text: "Primary", scope: "#lockups" },
  { kind: "markdown", path: ["Guide", "Install"], tag: "p", text: "Run the installer.", line: 12 },
  { kind: "markdown", path: [], tag: "p", text: "Preamble." },
];

describe("assertElementContext locators", () => {
  it("accepts every locator kind and contexts stored before locators existed", () => {
    expect([
      assertElementContext({ ...base, locators: valid }),
      assertElementContext(base),
    ]).toEqual([{ ...base, locators: valid }, base]);
  });

  it.each([
    ["an empty list", []],
    ["an unknown kind", [{ kind: "xpath", selector: "//p" }]],
    ["a css locator without a selector", [{ kind: "css" }]],
    ["a role locator without a name", [{ kind: "role", tag: "button", role: "button" }]],
    ["a text locator with empty text", [{ kind: "text", tag: "p", text: "" }]],
    ["a heading without text", [{ kind: "text", tag: "p", text: "Primary", heading: { selector: "h3" } }]],
    ["an unexpected locator field", [{ kind: "css", selector: "p", within: "#x" }]],
    ["a markdown locator without a path", [{ kind: "markdown", tag: "p", text: "Run" }]],
    ["a markdown path with an empty heading", [{ kind: "markdown", path: [""], tag: "p", text: "Run" }]],
    ["a markdown locator with a fractional line", [{ kind: "markdown", path: [], tag: "p", text: "Run", line: 1.5 }]],
    ["a non-array value", { kind: "css", selector: "p" }],
  ])("rejects %s", (_label, locators) => {
    expect(() => assertElementContext({ ...base, locators })).toThrow(/locator/);
  });
});
