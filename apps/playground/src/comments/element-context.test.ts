// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import type { ReactGrabAPI } from "react-grab";

import {
  COMMENT_ELEMENT_HTML_LIMIT,
  COMMENT_ELEMENT_HTML_TRUNCATION,
} from "../../plugins/comments-model";
import { captureElementContext } from "./element-context";

function installReactGrab(
  overrides: Partial<
    Pick<ReactGrabAPI, "getDisplayName" | "getSource" | "getStackContext">
  > = {},
) {
  window.__REACT_GRAB__ = {
    getDisplayName: vi.fn(() => "ApproveButton"),
    getSource: vi.fn(async () => ({
      filePath: "/workspace/src/ApproveButton.tsx",
      lineNumber: 27,
      columnNumber: 5,
      componentName: "ApproveButton",
    })),
    getStackContext: vi.fn(async () =>
      [
        "ApproveButton at /workspace/src/ApproveButton.tsx:27:5",
        "ReviewPage at /workspace/src/ReviewPage.tsx:14:3",
      ].join("\n"),
    ),
    ...overrides,
  } as ReactGrabAPI;
}

afterEach(() => {
  delete window.__REACT_GRAB__;
  vi.useRealTimers();
});

describe("captureElementContext", () => {
  it("captures the component, React stack, and raw element HTML", async () => {
    installReactGrab();
    const element = document.createElement("button");
    element.className = "btn-primary";
    element.textContent = "Approve";

    await expect(captureElementContext(element)).resolves.toEqual({
      componentName: "ApproveButton",
      source: [
        "ApproveButton at /workspace/src/ApproveButton.tsx:27:5",
        "ReviewPage at /workspace/src/ReviewPage.tsx:14:3",
      ].join("\n"),
      html: '<button class="btn-primary">Approve</button>',
    });
  });

  it("falls back to the direct source location when the stack lookup fails", async () => {
    installReactGrab({
      getStackContext: vi.fn(async () => {
        throw new Error("stack unavailable");
      }),
    });

    await expect(
      captureElementContext(document.createElement("button")),
    ).resolves.toMatchObject({
      source: "/workspace/src/ApproveButton.tsx:27",
    });
  });

  it("uses the direct source location when the stack lookup times out", async () => {
    vi.useFakeTimers();
    installReactGrab({
      getStackContext: vi.fn(() => new Promise<string>(() => undefined)),
    });

    const pending = captureElementContext(document.createElement("button"));
    await vi.advanceTimersByTimeAsync(1500);

    await expect(pending).resolves.toMatchObject({
      source: "/workspace/src/ApproveButton.tsx:27",
    });
  });

  it("truncates raw HTML at the same two-kilobyte boundary as Gavel", async () => {
    installReactGrab();
    const element = document.createElement("div");
    element.textContent = "x".repeat(COMMENT_ELEMENT_HTML_LIMIT * 2);

    const context = await captureElementContext(element);

    expect(context.html).toHaveLength(
      COMMENT_ELEMENT_HTML_LIMIT + COMMENT_ELEMENT_HTML_TRUNCATION.length,
    );
    expect(context.html.endsWith(COMMENT_ELEMENT_HTML_TRUNCATION)).toBe(true);
  });

  it("fails when React Grab is unavailable", async () => {
    await expect(
      captureElementContext(document.createElement("button")),
    ).rejects.toThrow(/React Grab is not ready/);
  });

  it("fails when neither stack nor source location identifies the element", async () => {
    installReactGrab({
      getSource: vi.fn(async () => null),
      getStackContext: vi.fn(async () => ""),
    });

    await expect(
      captureElementContext(document.createElement("button")),
    ).rejects.toThrow(/could not resolve source context/);
  });
});
