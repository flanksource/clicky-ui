import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { ReloadControl } from "./ReloadControl";

let changes: EventSource;
beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  vi.stubGlobal("__PLAYGROUND_REVISION__", "initial");
  vi.stubGlobal("EventSource", class {
    onmessage: ((event: MessageEvent) => void) | null = null;
    close = vi.fn();
    constructor() { changes = this as unknown as EventSource; }
  });
});
afterEach(() => { cleanup(); vi.useRealTimers(); vi.unstubAllGlobals(); });

function mount(sourceDirty = false) {
  const reload = vi.fn();
  render(<ReloadControl sourceDirty={sourceDirty} onReload={reload}>{(controls) => controls}</ReloadControl>);
  act(() => changes.onmessage?.(new MessageEvent("message", { data: JSON.stringify("updated") })));
  return reload;
}

it("reloads through the frame callback manually and consumes the pending revision", async () => {
  const reload = mount();
  expect(reload).not.toHaveBeenCalled();
  await act(async () => fireEvent.click(screen.getByRole("button", { name: /Updates available/ })));
  expect(reload).toHaveBeenCalledWith({ reason: "changes", revision: "updated" });
  expect(screen.queryByRole("button", { name: /Updates available/ })).toBeNull();
  act(() => changes.onmessage?.(new MessageEvent("message", { data: JSON.stringify("updated") })));
  expect(screen.queryByRole("button", { name: /Updates available/ })).toBeNull();
});

it.each(["source", "draft", "busy", "storage"])("protects %s edits during automatic reload", async (protection) => {
  vi.useFakeTimers();
  localStorage.setItem("playground.page-reloads", "automatic");
  if (protection === "draft") sessionStorage.setItem("clicky.comment.draft:page", JSON.stringify("Unsaved feedback"));
  const marker = document.createElement("div");
  if (protection === "busy") marker.setAttribute("aria-busy", "true");
  if (protection === "storage") marker.setAttribute("data-comment-storage-error", "true");
  document.body.append(marker);
  const reload = mount(protection === "source");
  await act(async () => vi.advanceTimersByTime(2000));
  expect(reload).not.toHaveBeenCalled();
  marker.remove();
});

it("automatically reloads an idle frame only once", async () => {
  vi.useFakeTimers();
  localStorage.setItem("playground.page-reloads", "automatic");
  const reload = mount();
  await act(async () => vi.advanceTimersByTime(1000));
  await act(async () => vi.advanceTimersByTime(2000));
  expect(reload).toHaveBeenCalledExactlyOnceWith({ reason: "changes", revision: "updated" });
});

it("keeps the pending update and reports a failed frame reload", async () => {
  render(<ReloadControl sourceDirty={false} onReload={async () => { throw new Error("Frame update failed"); }}>{(controls) => controls}</ReloadControl>);
  act(() => changes.onmessage?.(new MessageEvent("message", { data: JSON.stringify("updated") })));
  await act(async () => fireEvent.click(screen.getByRole("button", { name: /Updates available/ })));
  expect(screen.getByRole("alert").textContent).toContain("Frame update failed");
  expect(screen.getByRole("button", { name: /Updates available/ })).toBeTruthy();
});
