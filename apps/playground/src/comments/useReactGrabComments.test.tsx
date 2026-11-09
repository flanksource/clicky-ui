import { render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import type { ContextMenuActionContext, Plugin, ReactGrabAPI } from "@flanksource/react-grab";
import { useRef } from "react";
import { useReactGrabComments } from "./useReactGrabComments";

vi.mock("@flanksource/react-grab", () => ({ commentPlugin: { name: "comment" } }));
afterEach(() => { delete window.__REACT_GRAB__; });

it("opens a left-click selection directly while preserving the context-menu action", () => {
  let plugin: Plugin | undefined;
  const cleanup = vi.fn();
  const hideContextMenu = vi.fn();
  const setToolbarState = vi.fn();
  window.__REACT_GRAB__ = {
    getPlugins: () => [], getToolbarState: () => ({ defaultAction: "comment" }),
    setToolbarState, registerPlugin: (value: Plugin) => { plugin = value; }, unregisterPlugin: vi.fn(),
  } as unknown as ReactGrabAPI;
  const onSelect = vi.fn();
  function Surface() {
    const contentRef = useRef<HTMLDivElement>(null);
    useReactGrabComments({ contentRef, enabled: true, onSelect, onPrompt: vi.fn() });
    return <div ref={contentRef}><button id="click-target">Review target</button></div>;
  }
  render(<Surface />);
  const element = screen.getByRole("button", { name: "Review target" });
  const action = plugin?.actions?.find(entry => entry.id === "comment");
  expect(action).toBeDefined();
  action?.onAction?.({ element, elements: [element], cleanup, hideContextMenu } as unknown as ContextMenuActionContext);
  expect(onSelect).toHaveBeenCalledWith({ anchor: "#click-target", element });
  expect(cleanup).toHaveBeenCalledTimes(1);
  expect(hideContextMenu).toHaveBeenCalledTimes(1);
  expect(setToolbarState).toHaveBeenCalledWith({ defaultAction: "comment" });
  expect(action?.label).toBe("Comment");
  expect(plugin?.hooks?.onContextMenu).toBeUndefined();
  expect(plugin?.hooks?.onElementSelect).toBeUndefined();
});
