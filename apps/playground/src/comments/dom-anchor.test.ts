/** @vitest-environment jsdom */
import { afterEach, describe, expect, it } from "vitest";

import { boxWithin, cssPath, describeElement, resolveAnchor } from "./dom-anchor";

function mount(html: string): HTMLElement {
  const root = document.createElement("div");
  root.innerHTML = html;
  document.body.append(root);
  return root;
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("cssPath", () => {
  it("returns :scope for the root itself", () => {
    const root = mount("<p>hi</p>");

    expect(cssPath(root, root)).toBe(":scope");
  });

  it("round-trips a nested element back to the same node", () => {
    const root = mount("<section><div><span>a</span><span>b</span></div></section>");
    const target = root.querySelectorAll("span")[1] as Element;

    expect(root.querySelector(cssPath(target, root))).toBe(target);
  });

  it("disambiguates same-tag siblings by position", () => {
    const root = mount("<div><p>one</p><p>two</p><p>three</p></div>");
    const third = root.querySelectorAll("p")[2] as Element;

    const path = cssPath(third, root);

    expect(path).toBe(":scope > div:nth-child(1) > p:nth-child(3)");
    expect(root.querySelector(path)).toBe(third);
  });

  it("anchors on a unique id instead of a long positional chain", () => {
    const root = mount('<div><section id="pricing"><b>x</b></section></div>');
    const target = root.querySelector("b") as Element;

    expect(cssPath(target, root)).toBe("#pricing > b:nth-child(1)");
    expect(root.querySelector(cssPath(target, root))).toBe(target);
  });

  it("ignores a duplicated id and falls back to positions", () => {
    const root = mount('<div><i id="dup">a</i><i id="dup">b</i></div>');
    const second = root.querySelectorAll("i")[1] as Element;

    const path = cssPath(second, root);

    expect(path).toBe(":scope > div:nth-child(1) > i:nth-child(2)");
    expect(root.querySelector(path)).toBe(second);
  });

  it("ignores an id that is not a safe css identifier", () => {
    const root = mount('<div><em id="2 weird">a</em></div>');
    const target = root.querySelector("em") as Element;

    expect(cssPath(target, root)).toBe(":scope > div:nth-child(1) > em:nth-child(1)");
  });
});

describe("resolveAnchor", () => {
  it("finds the element a stored anchor points at", () => {
    const root = mount("<div><span>a</span></div>");

    expect(resolveAnchor(root, ":scope > div:nth-child(1) > span:nth-child(1)")).toBe(
      root.querySelector("span"),
    );
  });

  it("returns null when the page no longer has that node — an orphan, not a crash", () => {
    const root = mount("<div><span>a</span></div>");

    expect(resolveAnchor(root, ":scope > div:nth-child(9) > span:nth-child(1)")).toBeNull();
  });

  it("returns null for a malformed selector rather than throwing", () => {
    const root = mount("<div></div>");

    expect(resolveAnchor(root, ":scope > ((")).toBeNull();
  });
});

describe("describeElement", () => {
  it("combines tag, leading classes and trimmed text", () => {
    const root = mount('<button class="btn primary extra">  Approve  </button>');

    expect(describeElement(root.querySelector("button") as Element)).toBe(
      'button.btn.primary "Approve"',
    );
  });

  it("omits the quoted text for an element with none", () => {
    const root = mount('<hr class="rule" />');

    expect(describeElement(root.querySelector("hr") as Element)).toBe("hr.rule");
  });

  it("truncates long text", () => {
    const root = mount(`<p>${"x".repeat(80)}</p>`);

    expect(describeElement(root.querySelector("p") as Element)).toBe(
      `p "${"x".repeat(60)}…"`,
    );
  });
});

describe("boxWithin", () => {
  it("converts a viewport rect into scroll-aware coordinates inside the root", () => {
    const target = { left: 130, top: 240, width: 80, height: 20 };
    const root = { left: 100, top: 200, width: 500, height: 400 };

    expect(boxWithin(target, root, { left: 0, top: 55 })).toEqual({
      left: 30,
      top: 95,
      width: 80,
      height: 20,
    });
  });
});
