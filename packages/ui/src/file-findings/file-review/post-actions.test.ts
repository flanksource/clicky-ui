import { beforeEach, describe, expect, it, vi } from "vitest";

const capture = vi.hoisted(() => ({ supported: true, captureScreenshot: vi.fn() }));
vi.mock("../../comments/annotation-screenshot", () => ({
  screenshotCaptureSupported: () => capture.supported,
  captureScreenshot: capture.captureScreenshot,
}));

import type { CommentCreateAction } from "../../comments/comment-types";
import { POST_ACTION, SCREENSHOT_ACTION, composerActions, createComment } from "./post-actions";

const HOST: CommentCreateAction[] = [
  { id: "agent", label: "Post & run agent" },
  { id: "plain", label: "Post" },
];
const CAPTURED = { status: "captured", dataUrl: "data:image/png;base64,AAAA" } as const;

beforeEach(() => {
  capture.supported = true;
  capture.captureScreenshot.mockReset().mockResolvedValue(CAPTURED);
});

describe("composerActions", () => {
  it("leaves the host's variants alone, or none, unless screenshots are on", () => {
    expect([composerActions({ host: HOST, screenshot: false }), composerActions({ host: undefined, screenshot: false })]).toEqual([HOST, undefined]);
  });

  it("appends Post with screenshot to the host's variants, or to a plain Post when it has none", () => {
    const screenshot = { id: SCREENSHOT_ACTION, label: "Post with screenshot" };
    expect([composerActions({ host: HOST, screenshot: true }), composerActions({ host: undefined, screenshot: true })]).toEqual([
      [...HOST, screenshot],
      [{ id: POST_ACTION, label: "Post comment" }, screenshot],
    ]);
  });

  it("offers no screenshot variant where the browser cannot capture a tab", () => {
    capture.supported = false;
    expect(composerActions({ host: undefined, screenshot: true })).toBeUndefined();
  });

  it("rejects a host variant that uses the built-in screenshot id", () => {
    expect(() => composerActions({ host: [{ id: SCREENSHOT_ACTION, label: "Mine" }], screenshot: true })).toThrow(/reserved/);
  });
});

describe("createComment", () => {
  const input = { body: "Check this", anchor: "r:{}" };
  const region = () => document.body;

  it("passes the screenshot of the region with the input, and no action id", async () => {
    const onCreate = vi.fn();
    await createComment({ onCreate, input, action: SCREENSHOT_ACTION, hostActions: HOST, region });
    expect({ calls: onCreate.mock.calls, target: capture.captureScreenshot.mock.calls[0]![0] }).toEqual({
      calls: [[{ ...input, screenshot: CAPTURED }]],
      target: document.body,
    });
  });

  it("forwards an unavailable capture as it is, so the host can record why", async () => {
    capture.captureScreenshot.mockResolvedValue({ status: "unavailable", reason: "cancelled" });
    const onCreate = vi.fn();
    await createComment({ onCreate, input, action: SCREENSHOT_ACTION, hostActions: undefined, region });
    expect(onCreate).toHaveBeenCalledWith({ ...input, screenshot: { status: "unavailable", reason: "cancelled" } });
  });

  it("forwards a host variant's id and posts the built-in Post as a plain comment", async () => {
    const onCreate = vi.fn();
    await createComment({ onCreate, input, action: "agent", hostActions: HOST, region });
    await createComment({ onCreate, input, action: POST_ACTION, hostActions: undefined, region });
    await createComment({ onCreate, input, action: undefined, hostActions: undefined, region });
    expect(onCreate.mock.calls).toEqual([[input, "agent"], [input], [input]]);
    expect(capture.captureScreenshot).not.toHaveBeenCalled();
  });
});
