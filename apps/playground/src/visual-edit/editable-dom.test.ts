import { BOX_STYLES, CONTAINER_STYLES, DIAGRAM_ROLES } from "@flanksource/facet";
import { afterEach, expect, it } from "vitest";
import { describeEditable, findEditableRoots, instancesOf, styleOptions } from "./editable-dom";

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
    <div data-editable-container="variant" data-container-style="zone" data-editable-source="${ZONE}">
      <span data-editable-text="tag">Edge</span>
      <div data-editable-box="variant" data-box-style="outlined" data-editable-source="${SHARED}">
        <div data-editable-text="title">Run API</div>
        <div data-editable-text="description">Serves <b>REST</b></div>
      </div>
      <div data-editable-box="variant" data-box-style="card" data-editable-source="${SHARED}">
        <div data-editable-text="title">Run UI</div>
      </div>
      <div data-editable-box="role" data-role="new" data-editable-source="${ZONE}"></div>
      <div data-editable-box="variant" data-box-style="ghost"><div data-editable-text="title">Library</div></div>
    </div>`);

  const summary = findEditableRoots(root).map((node) => ({
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
  expect(instancesOf(root, SHARED).map((node) => node.value)).toEqual(["outlined", "card"]);
});

it("explains why a node without a call-site marker is not editable", () => {
  const root = mount(`<div data-editable-box="variant" data-box-style="ghost"></div>`);
  expect(findEditableRoots(root)[0]?.unavailable).toMatch(/no data-editable-source/);
});

it("fails loudly when an editable root has no current style value", () => {
  const root = mount(`<div data-editable-box="variant" data-editable-source="${SHARED}"></div>`);
  expect(() => describeEditable(root.firstElementChild as HTMLElement)).toThrow(/missing data-box-style/);
});

it("returns the facet style vocabularies per kind and prop", () => {
  expect([styleOptions("box", "variant"), styleOptions("container", "variant"), styleOptions("box", "role")]).toEqual([
    BOX_STYLES,
    CONTAINER_STYLES,
    DIAGRAM_ROLES,
  ]);
  expect(styleOptions("container", "role")).toBe(DIAGRAM_ROLES);
  expect(() => styleOptions("box", "color" as "variant")).toThrow(/no style options/);
});
