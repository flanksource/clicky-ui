import { describe, expect, it, vi } from "vitest";
import { fireEvent } from "@testing-library/react";
import { renderHook } from "@testing-library/react";
import { formatHotkey, parseHotkey, useHotkey } from "./use-hotkey";

function press(key: string, modifiers: Partial<KeyboardEventInit> = {}) {
  fireEvent.keyDown(document, { key, ...modifiers });
}

describe("parseHotkey", () => {
  it("reads the key and each modifier out of a combo", () => {
    expect(parseHotkey("mod+shift+p")).toEqual({
      key: "p",
      mod: true,
      shift: true,
      alt: false,
    });
  });

  it("treats a bare key as requiring no modifiers", () => {
    expect(parseHotkey("/")).toEqual({ key: "/", mod: false, shift: false, alt: false });
  });

  it("rejects an empty combo instead of silently binding nothing", () => {
    expect(() => parseHotkey("")).toThrow(/empty combo/);
  });
});

describe("formatHotkey", () => {
  it("renders platform-appropriate labels from the same combo", () => {
    expect(formatHotkey("mod+k", "mac")).toBe("⌘K");
    expect(formatHotkey("mod+k", "other")).toBe("Ctrl+K");
  });

  it("includes modifiers the legacy badge-derived key could not express", () => {
    expect(formatHotkey("mod+shift+p", "mac")).toBe("⌘⇧P");
    expect(formatHotkey("mod+shift+p", "other")).toBe("Ctrl+Shift+P");
  });
});

describe("useHotkey", () => {
  it("invokes the handler on a matching combo", () => {
    const handler = vi.fn();
    renderHook(() => useHotkey("mod+k", handler));

    press("k", { metaKey: true });

    expect(handler).toHaveBeenCalledOnce();
  });

  it("ignores the key without its modifier", () => {
    const handler = vi.fn();
    renderHook(() => useHotkey("mod+k", handler));

    press("k");

    expect(handler).not.toHaveBeenCalled();
  });

  it("distinguishes combos that differ only by shift", () => {
    const plain = vi.fn();
    const shifted = vi.fn();
    renderHook(() => useHotkey("mod+p", plain));
    renderHook(() => useHotkey("mod+shift+p", shifted));

    press("p", { metaKey: true });

    // The pre-extraction implementation derived the key from the display string
    // and only checked meta/ctrl, so ⌘P fired a "⌘⇧P" binding too.
    expect(plain).toHaveBeenCalledOnce();
    expect(shifted).not.toHaveBeenCalled();
  });

  it("fires only the winning binding when several share a combo", () => {
    const first = vi.fn();
    const second = vi.fn();
    renderHook(() => useHotkey("mod+k", first));
    renderHook(() => useHotkey("mod+k", second));

    press("k", { metaKey: true });

    // This is the regression the hook exists for: previously every mounted
    // binding registered its own listener and all of them ran.
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledOnce();
  });

  it("lets a higher priority win regardless of mount order", () => {
    const chrome = vi.fn();
    const overlay = vi.fn();
    renderHook(() => useHotkey("mod+k", overlay, { priority: 10 }));
    renderHook(() => useHotkey("mod+k", chrome));

    press("k", { metaKey: true });

    expect(overlay).toHaveBeenCalledOnce();
    expect(chrome).not.toHaveBeenCalled();
  });

  it("does not fire while disabled", () => {
    const handler = vi.fn();
    renderHook(() => useHotkey("mod+k", handler, { enabled: false }));

    press("k", { metaKey: true });

    expect(handler).not.toHaveBeenCalled();
  });

  it("stops firing once unmounted", () => {
    const handler = vi.fn();
    const { unmount } = renderHook(() => useHotkey("mod+k", handler));
    unmount();

    press("k", { metaKey: true });

    expect(handler).not.toHaveBeenCalled();
  });

  it("binds nothing for a null combo", () => {
    const handler = vi.fn();
    renderHook(() => useHotkey(null, handler));

    press("k", { metaKey: true });

    expect(handler).not.toHaveBeenCalled();
  });

  it("suppresses a bare key while focus is in a text field", () => {
    const handler = vi.fn();
    const input = document.createElement("input");
    document.body.appendChild(input);
    renderHook(() => useHotkey("/", handler));

    fireEvent.keyDown(input, { key: "/" });

    expect(handler).not.toHaveBeenCalled();
    input.remove();
  });

  it("still fires a modifier combo while focus is in a text field", () => {
    const handler = vi.fn();
    const input = document.createElement("input");
    document.body.appendChild(input);
    renderHook(() => useHotkey("mod+k", handler));

    fireEvent.keyDown(input, { key: "k", metaKey: true });

    expect(handler).toHaveBeenCalledOnce();
    input.remove();
  });
});
