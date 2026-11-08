import { describe, expect, it } from "vitest";
import { validateFrameMessage, validateHostMessage } from "./validation.ts";

const rect = { left: 10, top: 20, width: 100, height: 30 };
const selection = { anchor: "#save", label: "Save", element: { source: "report.tsx:8:3", componentName: "Button", html: "<button>Save</button>", locators: [{ kind: "role", tag: "button", role: "button", name: "Save" }] }, rect };

describe("agent message validation", () => {
  it.each([
    { type: "selection", selection },
    { type: "anchors", anchors: [{ anchor: "#save", state: "moved", label: "Save", rect }] },
    { type: "anchors", anchors: [{ anchor: "#gone", state: "orphaned", label: "#gone", rect: null }] },
    { type: "focus", anchor: "#save" },
    { type: "keys", key: "Escape", ctrlKey: false, metaKey: false, shiftKey: false, altKey: false },
    { type: "geometry", scrollX: 0, scrollY: 5, width: 800, height: 600 },
  ])("accepts frame $type", (message) => expect(validateFrameMessage(message)).toEqual(message));

  it.each([
    { type: "mode", mode: "comment" }, { type: "mode", mode: "design" }, { type: "mode", mode: "off" }, { type: "pick" }, { type: "page" },
    { type: "pins", anchors: [{ anchor: "#save", count: 2, locators: [] }], focus: "#save" },
    { type: "highlight", anchor: null }, { type: "scroll", anchor: "#save", offset: 24, behavior: "auto", block: "start" },
  ])("accepts host $type", (message) => expect(validateHostMessage(message)).toEqual(message));

  it.each([
    { type: "selection", selection: { ...selection, rect: { ...rect, width: -1 } } },
    { type: "selection", selection: { ...selection, element: { ...selection.element, screenshot: "forged" } } },
    { type: "selection", selection: { ...selection, element: { ...selection.element, source: "entry/generated.tsx:1:1" } } },
    { type: "selection", selection: { ...selection, element: { ...selection.element, source: "https://runtime.example/npm/@acme/library@1.0.0/Card.js:2:3" } } },
    { type: "anchors", anchors: [{ anchor: "#gone", state: "orphaned", label: "gone", rect }] },
    { type: "geometry", scrollX: 0, scrollY: NaN, width: 800, height: 600 },
    { type: "keys", key: "Delete", ctrlKey: false, metaKey: false, shiftKey: false, altKey: false },
    { type: "focus", anchor: "#save", identity: "forged" },
  ])("rejects forged frame $type", (message) => expect(() => validateFrameMessage(message)).toThrow());

  it.each([
    { type: "mode", mode: "unknown" }, { type: "pick", screenshot: true },
    { type: "pins", anchors: [{ anchor: "#save", count: 0, locators: [] }] },
    { type: "pins", anchors: [{ anchor: "#save", count: 1, locators: [{ kind: "markdown", path: [3], tag: "p", text: "text" }] }] },
    { type: "highlight", anchor: 3 }, { type: "scroll", anchor: "#save", offset: Infinity },
  ])("rejects invalid host $type", (message) => expect(() => validateHostMessage(message)).toThrow());
});
