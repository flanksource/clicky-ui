import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { mountHost } from "./host-dom";

beforeEach(() =>
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  ),
);
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it("minimizes without replacing the iframe and restores floating drafts through the FAB", () => {
  const presentation = vi.fn();
  const ui = mountHost("about:blank", vi.fn(), vi.fn(), presentation);
  const frame = ui.frame;
  const fab = ui.root.shadowRoot!.querySelector<HTMLButtonElement>(".fab")!;
  ui.minimize();
  expect([frame.hidden, fab.hidden]).toEqual([true, false]);
  fab.click();
  expect([frame.hidden, fab.hidden]).toEqual([false, true]);
  ui.draft(true, "button");
  ui.minimize();
  fab.click();
  expect(ui.root.getAttribute("data-mode")).toBe("draft");
  expect(ui.frame).toBe(frame);
  expect(presentation).toHaveBeenLastCalledWith(true);
  ui.draft(false, undefined, true);
  expect(ui.root.getAttribute("data-mode")).toBe("rail");
  expect(frame.hidden).toBe(false);
  ui.close();
  expect(document.getElementById("playground-grabber")).toBeNull();
});

it.each([
  { name: "a minimized rail", setup: (ui: ReturnType<typeof mountHost>) => ui.minimize(), hidden: true },
  { name: "a draft opened while minimized", setup: (ui: ReturnType<typeof mountHost>) => { ui.minimize(); ui.draft(true, "button"); }, hidden: true },
  { name: "a rail hidden while picking", setup: (ui: ReturnType<typeof mountHost>) => { ui.frame.hidden = true; }, hidden: false },
])("keeps the sidebar's own visibility when the page changes from $name", ({ setup, hidden }) => {
  const ui = mountHost("about:blank", vi.fn(), vi.fn(), vi.fn());
  setup(ui);
  ui.pageChanged();
  const fab = ui.root.shadowRoot!.querySelector<HTMLButtonElement>(".fab")!;
  expect({ draft: ui.root.getAttribute("data-mode") === "draft", frameHidden: ui.frame.hidden, fabHidden: fab.hidden }).toEqual({ draft: false, frameHidden: hidden, fabHidden: !hidden });
  ui.close();
});

it("leaves Command+K available to the host document", () => {
  const ui = mountHost("about:blank", vi.fn(), vi.fn(), vi.fn());
  const event = new KeyboardEvent("keydown", {
    key: "k",
    metaKey: true,
    cancelable: true,
    bubbles: true,
  });
  document.dispatchEvent(event);
  expect(event.defaultPrevented).toBe(false);
  ui.close();
});
