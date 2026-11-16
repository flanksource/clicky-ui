import { afterEach, expect, it } from "vitest";
import { describeEditable, editableTargetOf, findEditableRoots, instancesOf, isEditableVisible } from "./editable-dom";

const SHARED = "flanksource/_facet-diagrams/cells.tsx:12:7#0@aaaaaaaaaaaa";
const ZONE = "flanksource/_facet-diagrams/cells.tsx:30:3#1@aaaaaaaaaaaa";

function mount(html: string): HTMLElement {
  document.body.innerHTML = `<div id="root" data-facet-diagram>${html}</div>`;
  return document.getElementById("root")!;
}

afterEach(() => {
  document.body.innerHTML = "";
});

it("parses editable roots, their markers, text parts and call-site instances", () => {
  const root = mount(`
    <div data-editable-container="variant" data-container-style="zone" data-source="${ZONE}">
      <span data-editable-text="tag">Edge</span>
      <div data-editable-box="variant" data-box-style="outlined" data-source="${SHARED}">
        <div data-editable-text="title">Run API</div>
        <div data-editable-text="description">Serves <b>REST</b></div>
      </div>
      <div data-editable-box="variant" data-box-style="card" data-source="${SHARED}">
        <div data-editable-text="title">Run UI</div>
      </div>
      <div data-editable-box="role" data-role="new" data-source="${ZONE}"></div>
      <div data-editable-box="variant" data-box-style="ghost"><div data-editable-text="title">Library</div></div>
    </div>`);

  const summary = findEditableRoots(root).map((node) => node.kind === "svg" ? { kind: node.kind, tag: node.tag } : ({
    kind: node.kind,
    styleProp: node.styleProp,
    value: node.value,
    marker: node.marker && `${node.marker.file}:${node.marker.line}:${node.marker.column}#${node.marker.ordinal}`,
    parts: node.textParts.map((part) => [part.prop, part.text]),
    unavailable: node.unavailable !== null,
  }));

  expect(summary).toEqual([
    {
      kind: "container",
      styleProp: "variant",
      value: "zone",
      marker: "flanksource/_facet-diagrams/cells.tsx:30:3#1",
      parts: [["tag", "Edge"]],
      unavailable: false,
    },
    {
      kind: "box",
      styleProp: "variant",
      value: "outlined",
      marker: "flanksource/_facet-diagrams/cells.tsx:12:7#0",
      parts: [
        ["title", "Run API"],
        ["description", "Serves REST"],
      ],
      unavailable: false,
    },
    {
      kind: "box",
      styleProp: "variant",
      value: "card",
      marker: "flanksource/_facet-diagrams/cells.tsx:12:7#0",
      parts: [["title", "Run UI"]],
      unavailable: false,
    },
    {
      kind: "box",
      styleProp: "role",
      value: "new",
      marker: "flanksource/_facet-diagrams/cells.tsx:30:3#1",
      parts: [],
      unavailable: false,
    },
    { kind: "box", styleProp: "variant", value: "ghost", marker: null, parts: [["title", "Library"]], unavailable: true },
  ]);
  expect(instancesOf(root, SHARED).map((node) => node.kind === "svg" ? node.tag : node.value)).toEqual(["outlined", "card"]);
});

it("explains why a node without a call-site marker is not editable", () => {
  const root = mount(`<div data-editable-box="variant" data-box-style="ghost"></div>`);
  expect(findEditableRoots(root)[0]?.unavailable).toMatch(/no data-source/);
});

it("fails loudly when an editable root has no current style value", () => {
  const root = mount(`<div data-editable-box="variant" data-source="${SHARED}"></div>`);
  expect(() => describeEditable(root.firstElementChild as HTMLElement)).toThrow(/missing data-box-style/);
});

it("discovers SVG and Facet targets in source order while excluding SVG resources and unmarked shapes", () => {
  const root = mount(`<div data-editable-box="variant" data-box-style="card" data-source="${SHARED}">
    <svg><defs><marker><path data-source="${ZONE}" /></marker></defs>
      <g id="group" data-source="${ZONE}"><rect id="rect" data-source="${SHARED}" />
      <text id="text" data-source="${ZONE}"><tspan id="span">Cache</tspan></text><path id="icon" /></g>
      <path id="unmarked" /></svg></div>`);
  expect(findEditableRoots(root).map(node => [node.kind, node.element.id])).toEqual([
    ["box", ""], ["svg", "group"], ["svg", "rect"], ["svg", "text"],
  ]);
  expect(["rect", "span", "icon", "unmarked"].map(id => editableTargetOf(document.getElementById(id)!, root)?.element.id)).toEqual([
    "rect", "text", "group", "",
  ]);
  expect(editableTargetOf(root.querySelector("defs path")!, root)).toBeNull();
  expect(editableTargetOf(document.body, root)).toBeNull();
});

it("keeps identical SVG shapes with independent source markers independently editable", () => {
  const root = mount(`<svg><rect data-source="${SHARED}" x="10"/><rect data-source="${ZONE}" x="10"/></svg>`);
  expect(instancesOf(root, SHARED).map(node => [node.kind, node.markerValue])).toEqual([["svg", SHARED]]);
});

it("fails on a malformed SVG source marker", () => {
  const root = mount('<svg><rect data-source="broken#marker" /></svg>');
  expect(() => findEditableRoots(root)).toThrow(/malformed data-source/);
});

it("leaves SVG shapes carrying only a positional source marker uneditable", () => {
  const POSITIONAL = "flanksource/_facet-diagrams/cells.tsx:12:7";
  const root = mount(`<svg><rect id="positional" data-source="${POSITIONAL}" /><rect id="editable" data-source="${SHARED}" /></svg>`);
  expect({
    roots: findEditableRoots(root).map(node => node.element.id),
    target: editableTargetOf(document.getElementById("positional")!, root),
  }).toEqual({ roots: ["editable"], target: null });
});

it("excludes hidden and zero-size targets from visible discovery", () => {
  const root = mount(`<svg><g style="visibility:hidden"><rect id="hidden" data-source="${SHARED}" /></g>
    <rect id="zero" data-source="${ZONE}" /><rect id="visible" data-source="${ZONE}" /></svg>`);
  for (const node of root.querySelectorAll("rect")) {
    Object.defineProperty(node, "getClientRects", { value: () => [new DOMRect(0, 0, node.id === "zero" ? 0 : 10, 10)] });
  }
  expect(findEditableRoots(root).filter(node => isEditableVisible(node.element)).map(node => node.element.id)).toEqual(["visible"]);
});
