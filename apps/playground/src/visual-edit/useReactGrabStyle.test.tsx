import { cleanup, render } from "@testing-library/react";
import { useRef } from "react";
import type { ContextMenuActionContext, Plugin, ReactGrabAPI } from "@flanksource/react-grab";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { useReactGrabStyle } from "./useReactGrabStyle";

const MARKER = "flanksource/_facet-diagrams/call-path.tsx:42:9#3@aaaaaaaaaaaa";

let registered: Plugin[];
const unregisterPlugin = vi.fn<(name: string) => void>();

function installReactGrab(plugins: string[]) {
  window.__REACT_GRAB__ = {
    getPlugins: () => plugins,
    registerPlugin: (plugin: Plugin) => registered.push(plugin),
    unregisterPlugin,
  } as unknown as ReactGrabAPI;
}

function mount() {
  const onSelectTarget = vi.fn();
  const onBeforeCssEdit = vi.fn(() => true);
  function Surface() {
    const contentRef = useRef<HTMLDivElement>(null);
    useReactGrabStyle({ contentRef, onSelectTarget, onBeforeCssEdit });
    return (
      <div ref={contentRef}>
        <button id="html">Plain</button>
        <div id="facet" data-editable-box="variant" data-box-style="card" data-editable-source={MARKER}>Facet</div>
        <svg>
          <rect id="marked" data-editable-source={MARKER} />
          <rect id="unmarked" />
          <text id="text" data-editable-source={MARKER}><tspan id="tspan">Hello</tspan></text>
          <foreignObject id="box" data-editable-source={MARKER} />
        </svg>
      </div>
    );
  }
  const view = render(<Surface />);
  return { onSelectTarget, onBeforeCssEdit, view };
}

function runStyle(id: string) {
  const element = document.getElementById(id)!;
  const enterEditMode = vi.fn();
  const hideContextMenu = vi.fn();
  const cleanup = vi.fn();
  const action = registered.find((plugin) => plugin.name === "playground-style")?.actions?.[0];
  action?.onAction({ element, elements: [element], enterEditMode, hideContextMenu, cleanup } as unknown as ContextMenuActionContext);
  return { enterEditMode, hideContextMenu, cleanup };
}

beforeEach(() => {
  registered = [];
  unregisterPlugin.mockReset();
});

afterEach(() => {
  cleanup();
  delete window.__REACT_GRAB__;
});

it("swaps React Grab's edit plugin for one Style action bound to S", () => {
  installReactGrab(["copy", "edit", "open"]);
  mount();

  expect(unregisterPlugin.mock.calls).toEqual([["edit"]]);
  expect(registered.map(({ name, actions }) => [name, actions?.map(({ id, label, shortcut, shortcutModifier }) => [id, label, shortcut, shortcutModifier])])).toEqual([
    ["playground-style", [["edit", "Style", "S", false]]],
  ]);
});

it("opens the style panel for an SVG element written in a page module, closing React Grab's menu", () => {
  installReactGrab(["edit"]);
  const { onSelectTarget } = mount();

  const { enterEditMode, hideContextMenu, cleanup } = runStyle("marked");

  expect(onSelectTarget.mock.calls[0]?.[0]).toMatchObject({ kind: "svg", element: document.getElementById("marked") });
  expect([enterEditMode.mock.calls.length, hideContextMenu.mock.calls.length, cleanup.mock.calls.length]).toEqual([0, 1, 1]);
});

it("styles the editable element that contains the grabbed one", () => {
  installReactGrab(["edit"]);
  const { onSelectTarget } = mount();

  runStyle("tspan");

  expect(onSelectTarget.mock.calls[0]?.[0]).toMatchObject({ kind: "svg", element: document.getElementById("text") });
});

it.each([
  ["an HTML element", "html"],
  ["an SVG element without a source marker", "unmarked"],
  ["a marked element the SVG schemas do not cover", "box"],
])("opens React Grab's own CSS panel for %s", (_name, id) => {
  installReactGrab(["edit"]);
  const { onSelectTarget } = mount();

  const { enterEditMode, hideContextMenu } = runStyle(id);

  expect([onSelectTarget.mock.calls.length, enterEditMode.mock.calls.length, hideContextMenu.mock.calls.length]).toEqual([0, 1, 0]);
});

it("routes Facet elements to the same editor owner as SVG shapes", () => {
  installReactGrab(["edit"]);
  const { onSelectTarget } = mount();

  const { enterEditMode } = runStyle("facet");

  expect(onSelectTarget.mock.calls[0]?.[0]).toMatchObject({ kind: "box", element: document.getElementById("facet") });
  expect(enterEditMode).not.toHaveBeenCalled();
});

it("does not open the generic CSS editor while the shared owner refuses a switch", () => {
  installReactGrab(["edit"]);
  const { onBeforeCssEdit } = mount();
  onBeforeCssEdit.mockReturnValue(false);
  const { enterEditMode, hideContextMenu, cleanup } = runStyle("html");
  expect([onBeforeCssEdit.mock.calls.length, enterEditMode.mock.calls.length, hideContextMenu.mock.calls.length, cleanup.mock.calls.length]).toEqual([1, 0, 1, 1]);
});

it("fails loudly when React Grab provides no CSS panel to fall back to", () => {
  installReactGrab(["edit"]);
  mount();
  const element = document.getElementById("html")!;
  const action = registered[0]?.actions?.[0];

  expect(() => action?.onAction({ element, elements: [element] } as unknown as ContextMenuActionContext)).toThrow(/no enterEditMode/);
});

it("hands React Grab its edit plugin back when the hook goes away", () => {
  installReactGrab(["edit"]);
  const { view } = mount();

  view.unmount();

  expect(unregisterPlugin.mock.calls).toEqual([["edit"], ["playground-style"]]);
  expect(registered.map((plugin) => plugin.name)).toEqual(["playground-style", "edit"]);
});

it("registers once React Grab announces itself", () => {
  const { view } = mount();
  expect(registered).toEqual([]);

  installReactGrab(["edit"]);
  window.dispatchEvent(new Event("react-grab:init"));

  expect(registered.map((plugin) => plugin.name)).toEqual(["playground-style"]);
  view.unmount();
});
