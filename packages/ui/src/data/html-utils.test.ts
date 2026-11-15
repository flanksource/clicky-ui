import DOMPurify from "dompurify";
import { afterEach, describe, expect, it, vi } from "vitest";
import { isBlockHtml, SANITIZE_CACHE_ENTRIES, sanitizeHtml } from "./html-utils";

describe("sanitizeHtml cache", () => {
  afterEach(() => vi.restoreAllMocks());

  it("sanitizes a repeated input once and returns the same output", () => {
    const input = `<span class="k">SELECT</span><script>x()</script> ${Math.random()}`;
    const spy = vi.spyOn(DOMPurify, "sanitize");
    const first = sanitizeHtml(input);
    const second = sanitizeHtml(input);
    expect({ calls: spy.mock.calls.length, same: first === second, script: /<script/i.test(second) }).toEqual({
      calls: 1,
      same: true,
      script: false,
    });
  });

  it("re-sanitizes the least recently used input once the cache is full", () => {
    const prefix = `lru-${Math.random()}-`;
    const oldest = `<b>${prefix}oldest</b>`;
    sanitizeHtml(oldest);
    for (let i = 0; i < SANITIZE_CACHE_ENTRIES; i++) sanitizeHtml(`<i>${prefix}${i}</i>`);
    const spy = vi.spyOn(DOMPurify, "sanitize");
    sanitizeHtml(oldest);
    expect(spy).toHaveBeenCalledTimes(1);
  });
});

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
