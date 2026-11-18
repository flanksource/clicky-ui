import { expect, it, vi } from "vitest";
import { createBrowserSession } from "./session";
import type { PageBridge } from "@flanksource/page-runtime/host";

it("delivers frame review messages and retains a selection across reload callback updates", async () => {
  const session = createBrowserSession();
  const changed = vi.fn();
  const receive = vi.fn();
  session.subscribe(changed);
  session.onMessage(receive);
  const bridge = { send: vi.fn() } as unknown as PageBridge;
  const frame = document.createElement("iframe");
  document.body.append(frame);
  session.attach({ bridge, frame, reload: vi.fn() });
  session.accept({ anchor: "#action", label: "Action", rect: { left: 0, top: 0, width: 20, height: 20 }, element: { source: "page.tsx:1:1", componentName: "button", html: "<button/>", locators: [] } });
  session.attach({ bridge, frame, reload: vi.fn() });
  expect(changed).toHaveBeenCalledTimes(1);
  expect(await session.capture("#action", "plain")).toMatchObject({ source: "page.tsx:1:1" });
  const message = { type: "review-state" as const, elements: [], selected: null, visible: true, showRejected: false };
  session.receive(message);
  expect(receive).toHaveBeenCalledWith(message);
  frame.remove();
});
