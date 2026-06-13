import { render, renderHook, act } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { ReactNode } from "react";
import { ChatWindowManagerProvider } from "./ChatWindowManager";
import { useChatWindowManager } from "./chat-window-context";

function wrapper(storageId: string) {
  return ({ children }: { children: ReactNode }) => (
    <ChatWindowManagerProvider storageId={storageId}>{children}</ChatWindowManagerProvider>
  );
}

afterEach(() => localStorage.clear());

describe("ChatWindowManager", () => {
  it("opens up to MAX_PANELS windows and no more", () => {
    const { result } = renderHook(() => useChatWindowManager(), { wrapper: wrapper("max") });
    act(() => {
      for (let i = 0; i < 8; i++) result.current.openPanel();
    });
    expect(result.current.panels).toHaveLength(6);
  });

  it("brings a window to the front by giving it the highest z-index", () => {
    const { result } = renderHook(() => useChatWindowManager(), { wrapper: wrapper("z") });
    let first = "";
    act(() => {
      first = result.current.openPanel();
      result.current.openPanel();
    });
    act(() => result.current.bringToFront(first));
    const front = result.current.panels.find((p) => p.id === first)!;
    const other = result.current.panels.find((p) => p.id !== first)!;
    expect(front.zIndex).toBeGreaterThan(other.zIndex);
  });

  it("toggles maximize and demotes any previously maximized window", () => {
    const { result } = renderHook(() => useChatWindowManager(), { wrapper: wrapper("max2") });
    let a = "";
    let b = "";
    act(() => {
      a = result.current.openPanel();
      b = result.current.openPanel();
    });
    act(() => result.current.maximizePanel(a));
    act(() => result.current.maximizePanel(b));
    expect(result.current.panels.find((p) => p.id === a)!.maximized).toBe(false);
    expect(result.current.panels.find((p) => p.id === b)!.maximized).toBe(true);
  });

  it("closes a window", () => {
    const { result } = renderHook(() => useChatWindowManager(), { wrapper: wrapper("close") });
    let id = "";
    act(() => {
      id = result.current.openPanel();
    });
    act(() => result.current.closePanel(id));
    expect(result.current.panels).toHaveLength(0);
  });

  it("persists position/size to localStorage and rehydrates a fresh provider", async () => {
    const { result } = renderHook(() => useChatWindowManager(), { wrapper: wrapper("persist") });
    let id = "";
    act(() => {
      id = result.current.openPanel();
    });
    act(() => result.current.updatePanel(id, { x: 111, y: 222, width: 400, height: 500 }));

    // The debounced save fires after 1s; flush real time, then mount anew.
    await new Promise((r) => setTimeout(r, 1100));
    expect(localStorage.getItem("chat-panels:persist")).toContain("111");

    const second = renderHook(() => useChatWindowManager(), { wrapper: wrapper("persist") });
    const restored = second.result.current.panels[0]!;
    expect(restored.x).toBe(111);
    expect(restored.width).toBe(400);
  });

  it("throws when the hook is used outside the provider", () => {
    expect(() => render(<Bare />)).toThrow(/ChatWindowManagerProvider/);
  });
});

function Bare() {
  useChatWindowManager();
  return null;
}
