// @vitest-environment jsdom
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import type { FrameMessage } from "@flanksource/page-runtime/schema";
import type { PageBridge } from "@flanksource/page-runtime/host";
import { STARTER } from "./starter";
import { Preview } from "./Preview";

const fixture = vi.hoisted(() => ({ receive: undefined as ((message: FrameMessage) => void) | undefined, bridge: undefined as ((value: PageBridge | null) => void) | undefined, activity: vi.fn(() => null) }));
vi.mock("@flanksource/page-runtime/host", async (original) => ({
  ...await original<typeof import("@flanksource/page-runtime/host")>(),
  PageFrame: (props: { onMessage: (message: FrameMessage) => void; onBridge: (value: PageBridge | null) => void }) => { fixture.receive = props.onMessage; fixture.bridge = props.onBridge; return null; },
  RuntimeActivity: fixture.activity,
}));
vi.mock("./LibraryLinks", () => ({ LibraryLinks: () => null }));
afterEach(() => { cleanup(); vi.useRealTimers(); vi.clearAllMocks(); });

it.each(["updating", "booting", "fonts", "quiescence"] as const)("pushes a newer buffer while the previous source reload is %s instead of waiting for its error or readiness", (state) => {
  const send = vi.fn();
  const bridge: PageBridge = { send, request: vi.fn(), dispose: vi.fn() };
  const props = { project: STARTER, runtimeOrigin: "http://runtime.example", theme: { theme: "light", density: "comfortable" } as const, onLock: vi.fn(), onError: vi.fn() };
  const view = render(<Preview {...props} />);
  act(() => { fixture.bridge!(bridge); fixture.receive!({ type: "status", state: "ready" }); });
  const empty = { ...STARTER, files: { ...STARTER.files, [STARTER.entry]: "" } };
  view.rerender(<Preview {...props} project={empty} />);
  if (state !== "updating") act(() => fixture.receive!({ type: "status", state }));
  const replacement = STARTER.files[STARTER.entry]!.replace("Deployment path", "New deployment");
  view.rerender(<Preview {...props} project={{ ...empty, files: { ...empty.files, [STARTER.entry]: replacement } }} />);
  expect(send.mock.calls).toEqual([[{ type: "sources", files: { [STARTER.entry]: "" } }], [{ type: "sources", files: { [STARTER.entry]: replacement } }]]);
});

it("keeps a collapsed activity panel unmounted and batches messages before rendering its complete timeline", () => {
  vi.useFakeTimers();
  const view = render(<Preview project={STARTER} runtimeOrigin="http://runtime.example" theme={{ theme: "light", density: "comfortable" }} onLock={vi.fn()} onError={vi.fn()} />);
  const message = { type: "activity", load: "load", navigationStart: 100, records: [], timeline: [{ phase: "boot", atMs: 0 }], tailwind: [] } as const;
  act(() => {
    fixture.receive!({ ...message, records: [], timeline: [...message.timeline], tailwind: [] });
    fixture.receive!({ ...message, records: [], timeline: [{ phase: "ready", atMs: 200 }], tailwind: [] });
    vi.advanceTimersByTime(40);
  });
  expect(fixture.activity).not.toHaveBeenCalled();
  const details = view.getByTestId("runtime-activity");
  details.setAttribute("open", ""); fireEvent(details, new Event("toggle"));
  expect(fixture.activity).toHaveBeenCalledWith(expect.objectContaining({ activity: expect.objectContaining({ current: expect.objectContaining({ timeline: [{ phase: "ready", atMs: 200 }] }) }) }), expect.anything());
  fixture.activity.mockClear();
  act(() => { for (let i = 0; i < 4; i++) fixture.receive!({ ...message, records: [], timeline: [], tailwind: [] }); });
  expect(fixture.activity).not.toHaveBeenCalled();
  act(() => vi.advanceTimersByTime(40));
  expect(fixture.activity).toHaveBeenCalledTimes(1);
});
