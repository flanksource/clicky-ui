// Derived from react-grab (MIT, Copyright (c) 2025 Aiden Bai): packages/react-grab/tests/notify-toolbar-state-change-subscribers.test.ts
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ToolbarState } from "../src/types.js";
import { notifyToolbarStateChangeSubscribers } from "../src/utils/notify-toolbar-state-change-subscribers.js";

const TOOLBAR_STATE: ToolbarState = {
  edge: "bottom",
  ratio: 0.5,
  collapsed: false,
  enabled: true,
  defaultAction: "copy",
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("notifyToolbarStateChangeSubscribers", () => {
  it("reports a throwing subscriber and continues notifying", () => {
    const subscriberError = new Error("subscriber failed");
    const warning = vi.spyOn(console, "warn").mockImplementation(() => {});
    const nextSubscriber = vi.fn();

    notifyToolbarStateChangeSubscribers(
      new Set([
        () => {
          throw subscriberError;
        },
        nextSubscriber,
      ]),
      TOOLBAR_STATE,
    );

    expect(nextSubscriber).toHaveBeenCalledWith(TOOLBAR_STATE);
    expect(warning).toHaveBeenCalledWith(
      "[react-grab]",
      expect.objectContaining({ cause: subscriberError }),
    );
  });

  it("reports an asynchronously rejected subscriber", async () => {
    const subscriberError = new Error("subscriber rejected");
    const warning = vi.spyOn(console, "warn").mockImplementation(() => {});

    notifyToolbarStateChangeSubscribers(
      new Set([
        async () => {
          throw subscriberError;
        },
      ]),
      TOOLBAR_STATE,
    );
    await Promise.resolve();

    expect(warning).toHaveBeenCalledWith(
      "[react-grab]",
      expect.objectContaining({ cause: subscriberError }),
    );
  });
});
