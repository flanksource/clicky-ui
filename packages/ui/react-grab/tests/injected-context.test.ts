// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { formatGrabContext, getGrabContext } from "../src/utils/injected-context.js";
import { getStackContext, formatElementInfo, getElementReferenceContext } from "../src/core/context.js";
beforeEach(() => vi.stubGlobal("CSS", { escape: (value: string) => value }));

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.replaceChildren();
  for (const element of [document.documentElement, document.body]) {
    for (const name of element.getAttributeNames()) if (name.startsWith("data-grab")) element.removeAttribute(name);
  }
});

it("captures page and ancestor context without mixing in siblings", () => {
  document.documentElement.setAttribute("data-grab-project", "acme");
  document.body.setAttribute("data-grab-context", "Orders workspace");
  document.body.innerHTML = '<section id="orders" data-grab-context="Pending orders"><button id="approve" data-grab-order-id="order-7">Approve</button><aside data-grab-secret="sibling" /></section>';
  expect(getGrabContext(document.getElementById("approve")!)).toEqual({
    page: [{ selector: "html", attributes: { project: "acme" } }, { selector: "body", attributes: { context: "Orders workspace" } }],
    elements: [{ selector: "#orders", attributes: { context: "Pending orders" } }, { selector: "#approve", attributes: { "order-id": "order-7" } }],
  });
});

it("formats supplied text literally and retains multiline context", () => {
  expect(formatGrabContext({ page: [{ selector: "html", attributes: { context: "First line\nSecond line", metadata: "{not JSON}" } }], elements: [{ selector: "#approve", attributes: { "order-id": "order-7" } }] })).toBe("## Page context\n\nhtml\n- **context:** First line\nSecond line\n- **metadata:** {not JSON}\n\n## Element context\n\n#approve\n- **order-id:** order-7");
});

it("reads the selected element's current document and current attribute values", () => {
  const other = document.implementation.createHTMLDocument("other");
  other.body.innerHTML = '<button id="target" data-grab-context="before"></button>';
  const target = other.getElementById("target")!;
  expect(getGrabContext(target).elements[0]?.attributes).toEqual({ context: "before" });
  target.setAttribute("data-grab-context", "after");
  expect(getGrabContext(target).elements[0]?.attributes).toEqual({ context: "after" });
});

it("crosses open shadow roots and omits unrelated data attributes", () => {
  document.body.innerHTML = '<main id="host" data-grab-context="Host" data-secret="hidden"></main>';
  const host = document.getElementById("host")!;
  const shadow = host.attachShadow({ mode: "open" });
  shadow.innerHTML = '<button id="target" data-grab-context="Target"></button>';
  expect(getGrabContext(shadow.querySelector("button")!).elements.map(entry => entry.attributes)).toEqual([{ context: "Host" }, { context: "Target" }]);
});

it("returns no context for ordinary unannotated pages", () => {
  expect(getGrabContext(document.body)).toEqual({ page: [], elements: [] });
  expect(formatGrabContext({ page: [], elements: [] })).toBe("");
});

it("retains page and element context through stack, clipboard and reference APIs", async () => {
  document.body.setAttribute("data-grab-context", "Order management");
  document.body.innerHTML = '<button id="target" data-grab-order-id="order-7">Approve</button>';
  const target = document.getElementById("target")!;
  for (const capture of [getStackContext, formatElementInfo, getElementReferenceContext]) {
    const pending = capture(target);
    target.setAttribute("data-grab-order-id", "changed-after-capture");
    const captured = await pending;
    expect(captured).toContain("## Page context\n\nbody\n- **context:** Order management");
    expect(captured).toContain("## Element context\n\n#target\n- **order-id:** order-7");
    target.setAttribute("data-grab-order-id", "order-7");
  }
});
