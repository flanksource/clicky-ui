import { describe, expect, it } from "vitest";
import { validateFrameMessage, validateHostMessage } from "./validation.ts";

const source = "diagram.tsx:2:3#0@012345abcdef";
const selection = { anchor: "#node", label: "Node", element: { source, componentName: "BoxNode", html: "<div>Node</div>", locators: [] }, rect: { left: 0, top: 0, width: 10, height: 10 } };
const request = { page: "diagram", source, edit: { kind: "style", prop: "variant", value: "primary" } };
const result = { status: "applied", file: "diagram.tsx", path: "/pages/diagram.tsx", line: 2, hash: "012345abcdef" };
describe("Design bridge", () => {
  it.each([
    { type: "design-override", requestId: "preview", source, props: { variant: "primary", fill: null } },
    { type: "design-write", requestId: "write", page: "diagram", source, edit: request.edit },
    { type: "design-write-result", requestId: "write", result },
  ])("validates host $type", (message) => expect(validateHostMessage(message)).toEqual(message));
  it.each([
    { type: "design-selection", selection, source, props: { variant: "primary" } },
    { type: "design-override-result", requestId: "preview", source, ok: true },
    { type: "design-override-result", requestId: "preview", source, ok: false, error: "renderer missing" },
    { type: "design-write-request", requestId: "write", request },
    { type: "design-write-result", requestId: "write", result },
  ])("validates frame $type", (message) => expect(validateFrameMessage(message)).toEqual(message));
  it.each([
    { type: "design-override", requestId: "preview", source: "diagram.tsx:2:3", props: {} },
    { type: "design-override", requestId: "preview", source, props: { fill: NaN } },
    { type: "design-override", requestId: "preview", source, props: { "data-source": "forged" } },
    { type: "design-write", requestId: "write", page: "diagram", source, edit: { kind: "style", prop: "onclick", value: "forged" } },
    { type: "design-write-result", requestId: "write", result: { status: "applied" } },
  ])("rejects invalid host $type", (message) => expect(() => validateHostMessage(message)).toThrow());
  it("rejects a Design selection whose edit source differs from its element context", () => {
    expect(() => validateFrameMessage({ type: "design-selection", selection, source: "other.tsx:2:3#0@012345abcdef", props: {} })).toThrow();
  });
  it("does not accept external URLs without an explicit context", () => {
    const url = "https://example.com/report";
    const external = { ...selection, element: { ...selection.element, source: url, sourceContext: { mode: "external-document", url } } };
    expect(validateFrameMessage({ type: "selection", selection: external })).toEqual({ type: "selection", selection: external });
    expect(() => validateFrameMessage({ type: "selection", selection: { ...selection, element: { ...selection.element, source: url } } })).toThrow();
    expect(() => validateFrameMessage({ type: "selection", selection: { ...external, element: { ...external.element, source: "https://other.example/" } } })).toThrow();
  });
});
