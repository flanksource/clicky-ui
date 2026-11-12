import { afterEach, describe, expect, it, vi } from "vitest";
import type { BridgeEnvelope } from "../schema.ts";
import { createBridge } from "./bridge.ts";

const origin = "https://pages.example.com";
const images = [{ id: "badge", image: "data:image/webp;base64,UklGRg==", width: 120, height: 60 }];

function fixture(options: { timeoutMs?: number } = {}) {
  const local = new EventTarget();
  const postMessage = vi.fn();
  const target = { postMessage } as unknown as Window;
  const onMessage = vi.fn();
  const onError = vi.fn();
  const bridge = createBridge({ target, origin, session: "capture-session", direction: "host", window: local as Window, onMessage, onError, ...options });
  function deliver(message: BridgeEnvelope["message"]) {
    const request = postMessage.mock.calls[0]?.[0] as BridgeEnvelope;
    const data = { bridge: "page-runtime-v1", session: "capture-session", re: request.id, message };
    const event = new Event("message");
    Object.assign(event, { origin, source: target, data });
    local.dispatchEvent(event);
    return data;
  }
  return { bridge, deliver, onMessage, onError, postMessage };
}

afterEach(() => { vi.useRealTimers(); });

describe("bridge vocabulary requests", () => {
  it("resolves vocabulary-previews by re without dispatching an unsolicited message", async () => {
    const { bridge, deliver, onMessage, onError } = fixture();
    const response = bridge.request({ type: "capture-vocabulary" });
    const reply = deliver({ type: "vocabulary-previews", images });
    await expect(response).resolves.toEqual(reply);
    expect({ messages: onMessage.mock.calls, errors: onError.mock.calls }).toEqual({ messages: [], errors: [] });
    bridge.dispose();
  });

  it("rejects correlated capture errors", async () => {
    const { bridge, deliver } = fixture();
    const response = bridge.request({ type: "capture-vocabulary" });
    deliver({ type: "error", error: { phase: "render", message: "duplicate vocabulary id badge", file: "vocabulary.tsx" } });
    await expect(response).rejects.toThrow("render: duplicate vocabulary id badge");
    bridge.dispose();
  });

  it("allows a longer timeout for one request and keeps the 15 second default", async () => {
    vi.useFakeTimers();
    const { bridge, deliver } = fixture();
    const extended = bridge.request({ type: "capture-vocabulary" }, { timeoutMs: 60_000 });
    const ordinary = bridge.request({ type: "capture-vocabulary" });
    const expired = expect(ordinary).rejects.toThrow(/timed out/);
    await vi.advanceTimersByTimeAsync(15_000);
    await expired;
    await vi.advanceTimersByTimeAsync(30_000);
    const reply = deliver({ type: "vocabulary-previews", images });
    await expect(extended).resolves.toEqual(reply);
    expect(vi.getTimerCount()).toBe(0);
    bridge.dispose();
  });

  it("expires at the per-request timeout instead of the bridge default", async () => {
    vi.useFakeTimers();
    const { bridge } = fixture({ timeoutMs: 60_000 });
    const response = bridge.request({ type: "capture-vocabulary" }, { timeoutMs: 1000 });
    const expired = expect(response).rejects.toThrow(/timed out/);
    await vi.advanceTimersByTimeAsync(1000);
    await expired;
    expect(vi.getTimerCount()).toBe(0);
    bridge.dispose();
  });

  it("retains a configured bridge timeout when no per-request option is given", async () => {
    vi.useFakeTimers();
    const { bridge } = fixture({ timeoutMs: 500 });
    const expired = expect(bridge.request({ type: "capture-vocabulary" })).rejects.toThrow(/timed out/);
    await vi.advanceTimersByTimeAsync(500);
    await expired;
    bridge.dispose();
  });

  it.each([0, -1, Infinity, NaN])("rejects an invalid request timeout %s before posting", async (timeoutMs) => {
    const { bridge, postMessage } = fixture();
    await expect(bridge.request({ type: "capture-vocabulary" }, { timeoutMs })).rejects.toThrow(/timeout/);
    expect(postMessage).not.toHaveBeenCalled();
    bridge.dispose();
  });
});
