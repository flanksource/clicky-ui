import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { VisualEditResponse } from "../../plugins/visual-edits-contract";
import { overrideCallSite } from "./react-override";
import { SvgStylePanel, type StyleChangeRequest } from "./SvgStylePanel";

vi.mock("./react-override", () => ({
  liveOverrideSupport: () => ({ supported: true }),
  overrideCallSite: vi.fn(),
}));

const PAGE = "flanksource/facet-diagrams";
const MARKER = "flanksource/_facet-diagrams/call-path.tsx:42:9#3@aaaaaaaaaaaa";

const jsonResponse = (status: number, body: VisualEditResponse) =>
  ({ status, ok: status < 400, headers: { get: () => "application/json" }, json: async () => body }) as unknown as Response;

const fetchMock = vi.fn<(url: string, init: RequestInit) => Promise<Response>>();
const overrides = vi.mocked(overrideCallSite);
const posted = () => fetchMock.mock.calls.map(([, init]) => JSON.parse(init.body as string));

function mountPanel() {
  document.body.innerHTML = `
    <div id="root">
      <svg>
        <rect id="rect" data-editable-source="${MARKER}" x="10" y="10" width="80" height="40" fill="#eeeeee" stroke="#333333" stroke-width="2"/>
        <text id="label" data-editable-source="flanksource/_facet-diagrams/call-path.tsx:50:9#4@aaaaaaaaaaaa" x="20" y="35">Hello</text>
      </svg>
    </div>`;
  const root = document.getElementById("root")!;
  const rect = document.getElementById("rect") as unknown as SVGRectElement;
  const props = {
    onOpenSource: vi.fn(),
    requestStyleChange: vi.fn<(edit: unknown) => Promise<StyleChangeRequest>>(),
    onClose: vi.fn(),
    onPendingChange: vi.fn(),
  };
  render(<SvgStylePanel element={rect} root={root} page={PAGE} {...props} />);
  return { rect, ...props };
}

const field = (name: string) => screen.getByLabelText(name) as HTMLInputElement;

beforeEach(() => {
  fetchMock.mockReset();
  overrides.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  vi.stubGlobal("ResizeObserver", class { observe() {} unobserve() {} disconnect() {} });
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  document.body.innerHTML = "";
});

it("shows the tag, the source location and one field per schema attribute, filled from the element", () => {
  mountPanel();
  const dialog = screen.getByRole("dialog");
  expect(within(dialog).getByText("<rect>")).toBeTruthy();
  expect(within(dialog).getByText("flanksource/_facet-diagrams/call-path.tsx:42")).toBeTruthy();
  expect({
    x: field("x").value,
    width: field("width").value,
    fill: field("fill").value,
    stroke: field("stroke").value,
    strokeWidth: field("strokeWidth").value,
  }).toEqual({ x: "10", width: "80", fill: "#eeeeee", stroke: "#333333", strokeWidth: "2" });
});

it("previews a valid edit on the call site and waits out a number that is mid-typing", () => {
  const { rect } = mountPanel();

  fireEvent.change(field("fill"), { target: { value: "#ff0000" } });
  fireEvent.change(field("width"), { target: { value: "33." } });

  expect(overrides.mock.calls).toEqual([[[rect], MARKER, { fill: "#ff0000" }]]);
});

it("saves only the changed attributes and keeps them as the new baseline", async () => {
  const { rect } = mountPanel();
  fetchMock.mockResolvedValue(jsonResponse(200, { status: "applied", file: "flanksource/_facet-diagrams/call-path.tsx", path: "src/pages/x.tsx", line: 42, hash: "bbbbbbbbbbbb" }));

  fireEvent.change(field("fill"), { target: { value: "#ff0000" } });
  fireEvent.change(field("width"), { target: { value: "120" } });
  fireEvent.click(screen.getByRole("button", { name: "Save" }));

  await waitFor(() => expect(screen.getByRole("status", { name: "" }).textContent).toMatch(/Saved flanksource\/_facet-diagrams\/call-path\.tsx:42/));
  expect(posted()).toEqual([{ page: PAGE, source: MARKER, edit: { kind: "attributes", values: { fill: "#ff0000", width: 120 } } }]);
  expect((screen.getByRole("button", { name: "Save" }) as HTMLButtonElement).disabled).toBe(true);
  expect(overrides.mock.calls.at(-1)?.[0]).toEqual([rect]);
});

it("offers Request change after a refused save and hands the agent the requested attributes and the refusal", async () => {
  const { rect, requestStyleChange } = mountPanel();
  const focus = vi.fn();
  requestStyleChange.mockResolvedValue({ agent: "Claude", onFocusThread: focus });
  fetchMock.mockResolvedValue(
    jsonResponse(422, {
      status: "refused",
      error: "fill is computed in code (x={zone.fill})",
      reason: "computed",
      file: "flanksource/_facet-diagrams/call-path.tsx",
      line: 42,
      column: 9,
      attribute: "fill",
    }),
  );

  fireEvent.change(field("fill"), { target: { value: "#ff0000" } });
  fireEvent.change(field("strokeWidth"), { target: { value: "4" } });
  fireEvent.click(screen.getByRole("button", { name: "Save" }));
  fireEvent.click(await screen.findByRole("button", { name: "Request change" }));

  await waitFor(() => expect(requestStyleChange).toHaveBeenCalledTimes(1));
  expect(requestStyleChange.mock.calls[0]).toEqual([
    {
      marker: MARKER,
      tag: "rect",
      changes: [
        { attribute: "fill", from: "#eeeeee", to: "#ff0000" },
        { attribute: "strokeWidth", from: 2, to: 4 },
      ],
      refusal: {
        reason: "computed",
        file: "flanksource/_facet-diagrams/call-path.tsx",
        line: 42,
        column: 9,
        message: "fill is computed in code (x={zone.fill})",
      },
    },
  ]);
  expect(overrides.mock.calls.at(-1)).toEqual([[rect], MARKER, { fill: "#eeeeee", strokeWidth: 2 }]);
  expect((await screen.findByText("Sent to Claude")).textContent).toBe("Sent to Claude");
  fireEvent.click(screen.getByRole("button", { name: "Show thread" }));
  expect(focus).toHaveBeenCalledTimes(1);
});

it("shows a failed request and keeps the refusal so it can be retried", async () => {
  const { requestStyleChange } = mountPanel();
  requestStyleChange.mockRejectedValue(new Error("comments backend is down"));
  fetchMock.mockResolvedValue(
    jsonResponse(422, { status: "refused", error: "fill is computed", reason: "computed", file: "a.tsx", line: 1, column: 1, attribute: "fill" }),
  );

  fireEvent.change(field("fill"), { target: { value: "#ff0000" } });
  fireEvent.click(screen.getByRole("button", { name: "Save" }));
  fireEvent.click(await screen.findByRole("button", { name: "Request change" }));

  expect((await screen.findByText("comments backend is down")).textContent).toBe("comments backend is down");
  expect(screen.getByRole("button", { name: "Request change" })).toBeTruthy();
});

it("opens the source at the marker's line", () => {
  const { onOpenSource } = mountPanel();
  fireEvent.click(screen.getByRole("button", { name: /Open source of/ }));
  expect(onOpenSource).toHaveBeenCalledWith({ file: "flanksource/_facet-diagrams/call-path.tsx", line: 42 });
});

it("reverts an unsaved preview and closes on Escape", () => {
  const { rect, onClose } = mountPanel();
  fireEvent.change(field("fill"), { target: { value: "#ff0000" } });

  fireEvent.keyDown(document, { key: "Escape" });

  expect(overrides.mock.calls).toEqual([
    [[rect], MARKER, { fill: "#ff0000" }],
    [[rect], MARKER, { fill: "#eeeeee" }],
  ]);
  expect(onClose).toHaveBeenCalledTimes(1);
});

it("reverts an unsaved preview that was never present on the element by removing the attribute", () => {
  const { rect } = mountPanel();
  fireEvent.change(field("opacity"), { target: { value: "0.5" } });
  fireEvent.click(screen.getByRole("button", { name: "Revert" }));

  expect(overrides.mock.calls).toEqual([
    [[rect], MARKER, { opacity: 0.5 }],
    [[rect], MARKER, { opacity: undefined }],
  ]);
});

it("keeps an unsaved preview open when another diagram target is clicked", () => {
  const { rect, onClose, onPendingChange } = mountPanel();
  fireEvent.change(field("width"), { target: { value: "120" } });
  fireEvent.pointerDown(document.getElementById("label")!);
  expect(onClose).not.toHaveBeenCalled();
  expect(onPendingChange).toHaveBeenLastCalledWith(true);
  expect(overrides.mock.calls).toEqual([[[rect], MARKER, { width: 120 }]]);
  expect(screen.getByRole("status").textContent).toMatch(/Save or revert/);
});

it("keeps invalid input pending until it is explicitly reverted", () => {
  const { onClose, onPendingChange } = mountPanel();
  fireEvent.change(field("width"), { target: { value: "33." } });
  fireEvent.pointerDown(document.body);
  expect(onClose).not.toHaveBeenCalled();
  expect(onPendingChange).toHaveBeenLastCalledWith(true);
  fireEvent.click(screen.getByRole("button", { name: "Revert" }));
  expect(onPendingChange).toHaveBeenLastCalledWith(false);
});

it("keeps a saving panel mounted when Escape or Open source is requested", async () => {
  const { onClose, onOpenSource } = mountPanel();
  let finish!: (value: Response) => void;
  fetchMock.mockReturnValue(new Promise(resolve => { finish = resolve; }));
  fireEvent.change(field("width"), { target: { value: "120" } });
  fireEvent.click(screen.getByRole("button", { name: "Save" }));
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
  fireEvent.keyDown(document, { key: "Escape" });
  fireEvent.click(screen.getByRole("button", { name: /Open source of/ }));
  expect([onClose.mock.calls, onOpenSource.mock.calls]).toEqual([[], []]);
  finish(jsonResponse(200, { status: "applied", file: "x.tsx", path: "src/pages/x.tsx", line: 42, hash: "bbbbbbbbbbbb" }));
  await screen.findByText(/Saved x.tsx/);
});
