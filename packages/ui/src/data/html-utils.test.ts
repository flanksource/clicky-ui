import { describe, expect, it } from "vitest";
import { isBlockHtml, sanitizeHtml } from "./html-utils";

describe("sanitizeHtml", () => {
  it("returns empty string for empty input", () => {
    expect(sanitizeHtml("")).toBe("");
  });

  it.each([
    ["standard close tag", "<p>ok</p><script>alert(1)</script>"],
    ["trailing-space close tag", "<p>ok</p><script>alert(1)</script >"],
    ["uppercase tag", "<p>ok</p><SCRIPT>alert(1)</SCRIPT>"],
  ])("strips <script> with %s", (_name, input) => {
    const out = sanitizeHtml(input);
    expect(out).not.toMatch(/<script/i);
    expect(out).toContain("<p>ok</p>");
  });

  it.each([
    ["double-quoted handler", '<div onclick="steal()">x</div>'],
    ["single-quoted handler", "<div onclick='steal()'>x</div>"],
    ["onerror handler", '<img src="x" onerror="steal()">'],
  ])("removes event-handler attribute (%s)", (_name, input) => {
    expect(sanitizeHtml(input)).not.toMatch(/onclick|onerror/i);
  });

  it.each([
    ["javascript:", '<a href="javascript:alert(1)">x</a>'],
    ["vbscript:", '<a href="vbscript:msgbox(1)">x</a>'],
    ["data: in href", '<a href="data:text/html,<script>alert(1)</script>">x</a>'],
  ])("strips dangerous URL scheme %s", (_name, input) => {
    const out = sanitizeHtml(input).toLowerCase();
    expect(out).not.toContain("javascript:");
    expect(out).not.toContain("vbscript:");
    expect(out).not.toMatch(/data:text\/html/);
  });

  it("preserves benign block and inline markup", () => {
    const input = '<div class="x"><p>hello <strong>world</strong></p></div>';
    expect(sanitizeHtml(input)).toBe(input);
  });
});

describe("isBlockHtml", () => {
  it.each(["<div>x</div>", "<p>x</p>", "<table></table>", "<h2>x</h2>"])(
    "detects block element in %s",
    (input) => {
      expect(isBlockHtml(input)).toBe(true);
    },
  );

  it.each(["<span>x</span>", "plain text", "<strong>x</strong>"])(
    "returns false for inline/non-block content %s",
    (input) => {
      expect(isBlockHtml(input)).toBe(false);
    },
  );
});
