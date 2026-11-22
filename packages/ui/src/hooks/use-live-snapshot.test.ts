import { act, render, renderHook, screen } from "@testing-library/react";
import { createElement, startTransition, Suspense } from "react";
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

it("uses only committed reducers and keeps the subscription open when the reducer changes", () => {
  const source = Object.assign(new EventTarget(), { close: vi.fn() });
  const open = vi.fn(() => source);
  vi.stubGlobal("EventSource", class { constructor() { return open(); } });
  const activeUrl = "/stream/current";
  const pendingUrl = "/stream/pending";
  const attempted = vi.fn();
  const pending = new Promise<never>(() => {});
  const add = (previous: number | undefined, change: number) => (previous ?? 0) + change;
  const subtract = (previous: number | undefined, change: number) => (previous ?? 0) - change;
  type Props = { url: string; merge: typeof add };
  function Viewer({ url, merge }: Props) {
    const { data } = useLiveSnapshot(url, merge);
    attempted(url);
    if (url === pendingUrl) throw pending;
    return createElement("output", null, data);
  }
  const viewer = (props: Props) => createElement(Suspense, { fallback: "Loading stream" }, createElement(Viewer, props));
  const { rerender } = render(viewer({ url: activeUrl, merge: add }));
  const send = (data: number) => act(() => { source.dispatchEvent(new MessageEvent("message", { data: String(data) })); });
  send(7);
  act(() => startTransition(() => rerender(viewer({ url: pendingUrl, merge: subtract }))));
  expect(attempted).toHaveBeenCalledWith(pendingUrl);
  expect(screen.getByRole("status")).toHaveTextContent("7");

  send(2);
  expect(screen.getByRole("status")).toHaveTextContent("9");

  rerender(viewer({ url: activeUrl, merge: subtract }));
  send(3);
  expect(screen.getByRole("status")).toHaveTextContent("6");
  expect(open).toHaveBeenCalledOnce();
  expect(source.close).not.toHaveBeenCalled();
});
