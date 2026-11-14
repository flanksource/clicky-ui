// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { PageForm, type PageFormProps } from "./PageForm.tsx";
import type { BridgeOptions } from "./bridge.ts";
import type { FormDataProps } from "@flanksource/clicky-ui/components";
import type { FrameMessage } from "../schema.ts";

const runtime = vi.hoisted(() => ({ options: undefined as BridgeOptions | undefined, send: vi.fn(), request: vi.fn(), dispose: vi.fn() }));
vi.mock("./bridge.ts", () => ({ createBridge: (options: BridgeOptions) => { runtime.options = options; return { send: runtime.send, request: runtime.request, dispose: runtime.dispose }; } }));

const schema = { type: "object", properties: { name: { type: "string" } } };
const manifest = { dependencies: { "@flanksource/clicky-ui": "^0.3.57" } };
let element: HTMLElement;
let root: Root;
let props: PageFormProps;

const frameMessage = (message: FrameMessage) => act(() => runtime.options!.onMessage({ bridge: "page-runtime-v1", session: runtime.options!.session, message }));
const render = async (next: Partial<PageFormProps> = {}) => { props = { ...props, ...next }; await act(async () => root.render(createElement(PageForm, props))); };
const iframe = () => element.querySelector("iframe")!;

beforeEach(async () => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  vi.clearAllMocks(); runtime.request.mockResolvedValue({});
  element = document.createElement("div"); document.body.append(element);
  root = createRoot(element);
  props = { runtimeOrigin: "https://runtime.example", theme: { theme: "light", density: "compact" }, schema, value: { name: "api" }, formProps: { layout: { mode: "cards" } } as FormDataProps, extensions: [{ tsx: "export default { name: 'one' }", name: "one" }], manifest, onChange: vi.fn(), onError: vi.fn() };
  await render();
});
afterEach(async () => { await act(() => root.unmount()); element.remove(); });

it("opens the generated form page and delivers schema, value and form props as the page data when the frame boots", () => {
  const status = { type: "status" as const, state: "booting" as const };
  frameMessage(status); frameMessage(status);
  expect(runtime.send).toHaveBeenCalledWith(expect.objectContaining({ type: "open", page: "__form/entry.tsx", manifest, files: expect.objectContaining({ "__form/ext-0.tsx": "export default { name: 'one' }" }) }));
  expect(runtime.send).toHaveBeenCalledWith({ type: "data", data: { schema, value: { name: "api" }, props: { layout: { mode: "cards" } } } });
  expect(new URL(iframe().src).pathname).toBe("/frame/__form/entry.tsx");
});

it("maps a change emit to onChange and forwards other messages without leaking size", () => {
  const onMessage = vi.fn();
  return render({ onMessage }).then(() => {
    frameMessage({ type: "emit", event: "change", payload: { name: "web" } });
    frameMessage({ type: "emit", event: "submit", payload: null });
    frameMessage({ type: "size", height: 300 });
    frameMessage({ type: "status", state: "ready" });
    expect(props.onChange).toHaveBeenCalledExactlyOnceWith({ name: "web" });
    expect(onMessage.mock.calls).toEqual([[{ type: "emit", event: "submit", payload: null }], [{ type: "status", state: "ready" }]]);
  });
});

it("sets the iframe height from size messages and keeps the caller's style", async () => {
  await render({ style: { border: "1px solid red" } });
  frameMessage({ type: "size", height: 412 });
  expect([iframe().style.height, iframe().style.border]).toEqual(["412px", "1px solid red"]);
  frameMessage({ type: "size", height: 120 });
  expect(iframe().style.height).toBe("120px");
});

it("sends the changed extension source as a sources message once the frame is ready, without remounting the iframe", async () => {
  const frame = iframe();
  await render({ extensions: [{ tsx: "export default { name: 'two' }", name: "one" }] });
  expect(runtime.request).not.toHaveBeenCalled();
  frameMessage({ type: "status", state: "ready" });
  await vi.waitFor(() => expect(runtime.request).toHaveBeenCalledTimes(1));
  expect(runtime.request).toHaveBeenCalledWith({ type: "sources", files: { "__form/ext-0.tsx": "export default { name: 'two' }" }, data: { schema, value: { name: "api" }, props: { layout: { mode: "cards" } } } });
  expect(iframe()).toBe(frame);
});

it("sends a source update for a newly declared schema source, appended after the host's, then only the changed file when it changes, without remounting", async () => {
  const declared = (source: string) => ({ ...schema, "x-clicky-extensions": [{ tsx: source, name: "declared" }] });
  const frame = iframe();
  frameMessage({ type: "status", state: "ready" });
  await render({ schema: declared("export default { name: 'declared-one' }") });
  await vi.waitFor(() => expect(runtime.request).toHaveBeenCalledTimes(1));
  expect(runtime.request.mock.calls[0]![0]).toMatchObject({ type: "sources", files: { "__form/ext-1.tsx": "export default { name: 'declared-one' }", "__form/entry.tsx": expect.stringContaining("declared0") } });
  await render({ schema: declared("export default { name: 'declared-two' }") });
  await vi.waitFor(() => expect(runtime.request).toHaveBeenCalledTimes(2));
  expect(runtime.request.mock.calls[1]![0]).toMatchObject({ type: "sources", files: { "__form/ext-1.tsx": "export default { name: 'declared-two' }" } });
  expect(Object.keys((runtime.request.mock.calls[1]![0] as { files: object }).files)).toEqual(["__form/ext-1.tsx"]);
  expect(iframe()).toBe(frame);
});

it("does not send a source update when only the schema's fields change, not its declared sources", async () => {
  frameMessage({ type: "status", state: "ready" });
  await render({ schema: { ...schema, title: "Renamed" } });
  expect(runtime.request).not.toHaveBeenCalled();
});

it("fails during render for a schema-declared ref that nothing can serve", async () => {
  const silence = vi.spyOn(console, "error").mockImplementation(() => {});
  try { await expect(render({ schema: { ...schema, "x-clicky-extensions": [{ ref: "declared.tsx" }] } })).rejects.toThrow(/schema x-clicky-extensions\[0\].*declared\.tsx/); }
  finally { silence.mockRestore(); }
});

it("does not resend identical sources when the caller passes new but equal extension arrays", async () => {
  frameMessage({ type: "status", state: "ready" });
  await render({ extensions: [{ tsx: "export default { name: 'one' }", name: "one" }] });
  expect(runtime.request).not.toHaveBeenCalled();
});

it("reopens the frame when the manifest changes and reports a failed source update through onError", async () => {
  frameMessage({ type: "status", state: "ready" });
  await render({ manifest: { dependencies: { "@flanksource/clicky-ui": "^0.3.58" } } });
  expect(runtime.send).toHaveBeenCalledWith(expect.objectContaining({ type: "open", manifest: { dependencies: { "@flanksource/clicky-ui": "^0.3.58" } } }));
  runtime.request.mockRejectedValueOnce(new Error("compile: boom"));
  frameMessage({ type: "status", state: "ready" });
  await render({ extensions: [{ tsx: "export default { name: 'three' }" }] });
  await vi.waitFor(() => expect(props.onError).toHaveBeenCalledWith(expect.objectContaining({ message: "compile: boom" })));
});

it("fails during render for a ref that nothing can serve", async () => {
  const silence = vi.spyOn(console, "error").mockImplementation(() => {});
  try { await expect(render({ extensions: [{ ref: "missing.tsx" }] })).rejects.toThrow(/missing\.tsx/); }
  finally { silence.mockRestore(); }
});

it("rejects form props that cannot cross the bridge instead of dropping them", async () => {
  const silence = vi.spyOn(console, "error").mockImplementation(() => {});
  try { await expect(render({ formProps: { onSubmit: () => 1 } as unknown as FormDataProps })).rejects.toThrow(/data/); }
  finally { silence.mockRestore(); }
});
