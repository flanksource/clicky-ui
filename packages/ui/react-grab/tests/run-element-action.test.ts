import { expect, it, vi } from "vitest";
import type { ContextMenuActionContext } from "../src/types.js";
import { runElementAction } from "../src/core/run-element-action.js";

const createContext = (): ContextMenuActionContext => ({
  element: Object.create(null),
  elements: [],
  hooks: {
    transformHtmlContent: async html => html,
    onOpenFile: () => false,
    transformOpenFileUrl: url => url,
  },
  performWithFeedback: async () => {},
  hideContextMenu: () => {},
  cleanup: () => {},
});

it.each(["default", "host"] as const)("dispatches the registered %s Style action", kind => {
  const enterEditMode = vi.fn();
  const selectTarget = vi.fn();
  const onAction = vi.fn((context: ContextMenuActionContext) => kind === "default" ? context.enterEditMode?.() : selectTarget(context.element));
  const context = { ...createContext(), enterEditMode };
  expect(runElementAction({ actionId: "edit", actions: [{ id: "edit", label: "Style", onAction }], context })).toBe(true);
  expect([onAction.mock.calls.length, enterEditMode.mock.calls.length, selectTarget.mock.calls.length]).toEqual([
    1, kind === "default" ? 1 : 0, kind === "host" ? 1 : 0,
  ]);
});

it("reports missing and disabled actions without invoking another editor", () => {
  const onAction = vi.fn();
  const context = createContext();
  expect([
    runElementAction({ actionId: "edit", actions: [], context }),
    runElementAction({ actionId: "edit", actions: [{ id: "edit", label: "Style", enabled: false, onAction }], context }),
    onAction.mock.calls.length,
  ]).toEqual([false, false, 0]);
});
