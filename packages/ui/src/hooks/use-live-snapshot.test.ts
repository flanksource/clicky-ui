import { act, renderHook } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { useLiveSnapshot } from "./use-live-snapshot";

afterEach(() => vi.unstubAllGlobals());

it("keeps the snapshot on pause and replaces it after resuming", () => {
  const opened: FakeSource[] = [];
  class FakeSource extends EventTarget {
    close = vi.fn();
    constructor() { super(); opened.push(this); }
  }
  vi.stubGlobal("EventSource", FakeSource);
  const { result, rerender } = renderHook(({ url }: { url: string | null }) => useLiveSnapshot<number>(url), {
    initialProps: { url: "/api/top?follow=1" },
  });
  act(() => opened[0].dispatchEvent(new MessageEvent("message", { data: "7" })));
  rerender({ url: null });
  expect(result.current.data).toBe(7);
  expect(opened[0].close).toHaveBeenCalledOnce();
  rerender({ url: "/api/top?follow=1" });
  act(() => opened[1].dispatchEvent(new MessageEvent("message", { data: "9" })));
  expect(result.current.data).toBe(9);
});

it("keeps the last valid snapshot and reports a rejected update on the stream", () => {
  const source = Object.assign(new EventTarget(), { close: vi.fn() });
  vi.stubGlobal("EventSource", class { constructor() { return source; } });
  const invalid = new Error("Invalid sample update");
  const { result } = renderHook(() => useLiveSnapshot<number, { value?: number }>("/api/top?follow=1", (previous, update) => {
    if (update.value === undefined) throw invalid;
    return (previous ?? 0) + update.value;
  }));
  act(() => {
    for (const data of ['{"value":3}', '{"value":4}', '{}']) {
      source.dispatchEvent(new MessageEvent("message", { data }));
    }
  });
  expect(result.current).toMatchObject({ data: 7, error: invalid, ended: true });
  expect(source.close).toHaveBeenCalledOnce();
});
