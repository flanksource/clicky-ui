import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { VisualEditResponse } from "../../plugins/visual-edits-contract";
import { overrideCallSite } from "./react-override";
import { VisualEditOverlay } from "./VisualEditOverlay";
import { useCallback } from "react";
import { useEditableSelection } from "./useEditableSelection";

vi.mock("./react-override", () => ({
  liveOverrideSupport: () => ({ supported: true }),
  overrideCallSite: vi.fn(),
}));

const PAGE = "flanksource/facet-diagrams";
const SHARED = "flanksource/_facet-diagrams/cells.tsx:12:7#0@aaaaaaaaaaaa";
const ZONE = "flanksource/_facet-diagrams/cells.tsx:30:3#1@aaaaaaaaaaaa";

const jsonResponse = (status: number, body: VisualEditResponse) =>
  ({ status, ok: status < 400, headers: { get: () => "application/json" }, json: async () => body }) as unknown as Response;

const fetchMock = vi.fn<(url: string, init: RequestInit) => Promise<Response>>();
const overrides = vi.mocked(overrideCallSite);
const posted = () => fetchMock.mock.calls.map(([, init]) => JSON.parse(init.body as string));

function mountDiagram() {
  document.body.innerHTML = `
    <div id="root" data-facet-diagram>
      <div id="zone" data-editable-container="variant" data-container-style="zone" data-editable-source="${ZONE}">
        <div id="api" data-editable-box="variant" data-box-style="outlined" data-editable-source="${SHARED}">
          <div id="api-title" data-editable-text="title">Run API</div>
        </div>
        <div id="ui" data-editable-box="variant" data-box-style="outlined" data-editable-source="${SHARED}">
          <div data-editable-text="title">Run UI</div>
        </div>
        <div id="plain" data-editable-box="variant" data-box-style="ghost">Plain</div>
      </div>
    </div>`;
  const byId = (id: string) => document.getElementById(id)!;
  return { root: byId("root"), api: byId("api"), ui: byId("ui"), title: byId("api-title"), plain: byId("plain") };
}

function mountOverlay(root: HTMLElement) {
  const onOpenSource = vi.fn();
  const onPendingChange = vi.fn();
  const onSelect = vi.fn();
  function Surface() {
    const selection = useEditableSelection({ page: PAGE, enabled: true });
    const pending = useCallback((value: boolean) => { selection.onFacetPendingChange(value); onPendingChange(value); }, [selection.onFacetPendingChange]);
    return <VisualEditOverlay root={root} page={PAGE} onOpenSource={onOpenSource} onPendingChange={pending}
      selected={selection.selected?.node.element ?? null} pending={selection.pending} selectionNotice={selection.notice}
      onSelect={node => { onSelect(node); selection.select(node); }} />;
  }
  render(<Surface />);
  return { onOpenSource, onPendingChange, onSelect };
}

async function pickVariant(box: HTMLElement, label: string, option: string) {
  fireEvent.pointerMove(box);
  fireEvent.click(await screen.findByRole("button", { name: label }));
  fireEvent.click(await screen.findByRole("menuitem", { name: option }));
}

beforeEach(() => {
  vi.spyOn(Element.prototype, "getClientRects").mockReturnValue([new DOMRect(0, 0, 10, 10)] as unknown as DOMRectList);
  fetchMock.mockReset();
  overrides.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

it("counts and selects rendered SVG shapes without showing Facet-only controls", async () => {
  document.body.innerHTML = `<div id="root"><svg>
    <defs><marker><path data-editable-source="${ZONE}" /></marker></defs>
    <g data-editable-source="${ZONE}"><rect id="shape" data-editable-source="${SHARED}" /></g>
    <text data-editable-source="${SHARED}"><tspan id="label">Cache</tspan></text>
  </svg></div>`;
  const { onSelect } = mountOverlay(document.getElementById("root")!);
  fireEvent.click(await screen.findByRole("button", { name: "Show editable (3)" }));
  expect(screen.getAllByTestId("visual-edit-editable-outline")).toHaveLength(3);
  fireEvent.click(document.getElementById("label")!);
  expect(onSelect.mock.calls.at(-1)?.[0]).toMatchObject({ kind: "svg", tag: "text" });
  expect(screen.queryByRole("button", { name: /Change variant|Change role/ })).toBeNull();
  expect(await screen.findByText(/Selected Cache/)).toBeTruthy();
});

it("updates editable counts when a section's visibility changes", async () => {
  const { root, api, ui } = mountDiagram();
  mountOverlay(root);
  expect(await screen.findByRole("button", { name: "Show editable (3)" })).toBeTruthy();
  api.style.display = "none";
  await screen.findByRole("button", { name: "Show editable (2)" });
  ui.hidden = true;
  await screen.findByRole("button", { name: "Show editable (1)" });
  api.style.display = "block";
  await screen.findByRole("button", { name: "Show editable (2)" });
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = "";
});

it("posts the picked variant for the whole call site and previews it on every instance", async () => {
  const { root, api, ui } = mountDiagram();
  const { onPendingChange } = mountOverlay(root);
  fetchMock.mockResolvedValue(jsonResponse(200, { status: "applied", file: "x.tsx", path: "src/pages/x.tsx", line: 12, hash: "bbbbbbbbbbbb" }));

  fireEvent.pointerMove(api);
  fireEvent.click(await screen.findByRole("button", { name: "Change variant of “Run API” (outlined)" }));
  expect(await screen.findByText("Applies to 2 nodes")).toBeTruthy();
  fireEvent.click(await screen.findByRole("menuitem", { name: "card" }));

  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
  expect(posted()).toEqual([{ page: PAGE, source: SHARED, edit: { kind: "style", prop: "variant", value: "card" } }]);
  expect(overrides.mock.calls).toEqual([[[api, ui], SHARED, { variant: "card" }]]);
  await waitFor(() => expect(onPendingChange).toHaveBeenLastCalledWith(false));
  expect(onPendingChange).toHaveBeenCalledWith(true);
  expect(await screen.findByText("Arrows re-measure on reload")).toBeTruthy();
});

it("shows a refused edit with an Open source action and restores the previous preview", async () => {
  const { root, api, ui } = mountDiagram();
  const { onOpenSource } = mountOverlay(root);
  fetchMock.mockResolvedValue(
    jsonResponse(422, {
      status: "refused",
      error: "variant is computed",
      reason: "computed-value",
      file: "flanksource/_facet-diagrams/cells.tsx",
      line: 12,
      column: 7,
    }),
  );

  await pickVariant(api, "Change variant of “Run API” (outlined)", "card");

  const alert = await screen.findByRole("alert");
  expect(alert.textContent).toMatch(/Edit refused.*variant is computed \(computed-value\)/);
  expect(overrides.mock.calls).toEqual([
    [[api, ui], SHARED, { variant: "card" }],
    [[api, ui], SHARED, { variant: "outlined" }],
  ]);
  fireEvent.click(within(alert).getByRole("button", { name: /Open source/ }));
  expect(onOpenSource).toHaveBeenCalledWith({ file: "flanksource/_facet-diagrams/cells.tsx", line: 12 });
});

it("lists ambiguous text candidates and re-posts the chosen one", async () => {
  const { root, api, title } = mountDiagram();
  mountOverlay(root);
  const candidates = [
    { id: "c1", file: "flanksource/_facet-diagrams/cells.tsx", line: 4, column: 9, context: 'title: "Run API"' },
    { id: "c2", file: "flanksource/_facet-diagrams/other.tsx", line: 8, column: 3, context: '<Cell title="Run API" />' },
  ];
  fetchMock
    .mockResolvedValueOnce(jsonResponse(422, { status: "ambiguous", error: "2 places", candidates }))
    .mockResolvedValueOnce(jsonResponse(200, { status: "applied", file: "other.tsx", path: "src/pages/other.tsx", line: 8, hash: "cccccccccccc" }));

  fireEvent.click(title);
  const input = await screen.findByRole("textbox", { name: "Edit title of Run API" });
  fireEvent.change(input, { target: { value: "Run Gateway" } });
  fireEvent.keyDown(input, { key: "Enter" });

  const group = await screen.findByRole("group", { name: "Ambiguous text" });
  expect(within(group).getAllByRole("button", { name: /^Choose / }).map((button) => button.textContent)).toEqual([
    "Choose flanksource/_facet-diagrams/cells.tsx:4",
    "Choose flanksource/_facet-diagrams/other.tsx:8",
  ]);
  expect(screen.getByText(/title: "Run API"/)).toBeTruthy();
  expect(overrides.mock.calls).toEqual([[[api], SHARED, { title: "Run Gateway" }]]);

  fireEvent.click(within(group).getByRole("button", { name: "Choose flanksource/_facet-diagrams/other.tsx:8" }));

  await waitFor(() => expect(screen.queryByRole("group", { name: "Ambiguous text" })).toBeNull());
  const edit = { kind: "text", prop: "title", from: "Run API", to: "Run Gateway" };
  expect(posted()).toEqual([
    { page: PAGE, source: SHARED, edit },
    { page: PAGE, source: SHARED, edit, choose: "c2" },
  ]);
});

it("reverts the preview when the ambiguous edit is cancelled", async () => {
  const { root, api, title } = mountDiagram();
  mountOverlay(root);
  fetchMock.mockResolvedValue(
    jsonResponse(422, { status: "ambiguous", error: "2 places", candidates: [{ id: "c1", file: "a.tsx", line: 1, column: 1, context: "x" }] }),
  );

  fireEvent.click(title);
  const input = await screen.findByRole("textbox", { name: "Edit title of Run API" });
  fireEvent.change(input, { target: { value: "Run Gateway" } });
  fireEvent.blur(input);
  fireEvent.click(await screen.findByRole("button", { name: "Cancel" }));

  await waitFor(() => expect(overrides.mock.calls.at(-1)).toEqual([[api], SHARED, { title: "Run API" }]));
  expect(screen.queryByRole("group", { name: "Ambiguous text" })).toBeNull();
});

it("cancels an inline edit on Escape without posting", async () => {
  const { root, title } = mountDiagram();
  const { onPendingChange } = mountOverlay(root);

  fireEvent.click(title);
  const input = await screen.findByRole("textbox", { name: "Edit title of Run API" });
  await waitFor(() => expect(onPendingChange).toHaveBeenLastCalledWith(true));
  fireEvent.change(input, { target: { value: "Discarded" } });
  fireEvent.keyDown(input, { key: "Escape" });

  await waitFor(() => expect(screen.queryByRole("textbox")).toBeNull());
  expect(fetchMock).not.toHaveBeenCalled();
  expect(onPendingChange).toHaveBeenLastCalledWith(false);
});

it("opens the editor from a wrapper holding only that text, as between a wrapped title's lines", async () => {
  document.body.innerHTML = `
    <div id="root" data-facet-diagram>
      <div data-editable-box="variant" data-box-style="header" data-editable-source="${SHARED}">
        <div id="title-wrapper"><span data-editable-text="title">Cloud estate</span></div>
        <div id="body">Hosted in <span data-editable-text="description">three regions</span></div>
      </div>
    </div>`;
  mountOverlay(document.getElementById("root")!);

  fireEvent.click(document.getElementById("body")!);
  expect(screen.queryByRole("textbox")).toBeNull();
  fireEvent.click(document.getElementById("title-wrapper")!);
  expect(await screen.findByRole("textbox", { name: "Edit title of Cloud estate" })).toBeTruthy();
});

it("outlines every visible editable node on demand, skipping hidden ones and nodes without a call-site marker", async () => {
  const { root } = mountDiagram();
  const hidden = Object.assign(document.createElement("div"), { id: "hidden" });
  hidden.setAttribute("data-editable-box", "variant");
  hidden.setAttribute("data-box-style", "outlined");
  hidden.setAttribute("data-editable-source", SHARED);
  root.append(hidden);
  const rendered = [new DOMRect(0, 0, 10, 10)] as unknown as DOMRectList;
  vi.spyOn(Element.prototype, "getClientRects").mockImplementation(function (this: Element) {
    return this === hidden ? ([] as unknown as DOMRectList) : rendered;
  });
  mountOverlay(root);
  const toggle = await screen.findByRole("button", { name: "Show editable (3)" });
  const outlined = () => screen.queryAllByTestId("visual-edit-editable-outline").map((outline) => outline.getAttribute("data-for"));

  fireEvent.click(toggle);
  const shown = { pressed: toggle.getAttribute("aria-pressed"), outlined: outlined() };
  fireEvent.click(toggle);

  expect({ shown, hidden: { pressed: toggle.getAttribute("aria-pressed"), outlined: outlined() } }).toEqual({
    shown: { pressed: "true", outlined: [ZONE, SHARED, SHARED] },
    hidden: { pressed: "false", outlined: [] },
  });
});

it("explains why a node without a call-site marker is not editable and reports an empty diagram", async () => {
  const { root, plain } = mountDiagram();
  mountOverlay(root);
  fireEvent.click(plain);
  expect((await screen.findByText(/has no data-editable-source/)).textContent).toMatch(/not rendered from a page module/);

  cleanup();
  document.body.innerHTML = `<div id="bare" data-facet-diagram></div>`;
  mountOverlay(document.getElementById("bare")!);
  expect(await screen.findByText("No editable nodes on this diagram")).toBeTruthy();
});
