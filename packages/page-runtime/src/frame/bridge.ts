import { createBridge } from "../host/bridge.ts";
import type { BridgeEnvelope } from "../schema.ts";
import { validateFrameOrigin } from "../host/origin.ts";

export function createFrameBridge(options: { receive: (value: BridgeEnvelope) => void; error: (error: Error) => void }) {
  const params = new URLSearchParams(location.hash.slice(1));
  const origin = params.get("host"); const session = params.get("session");
  if (!origin || !session || parent === window) throw new Error("frame requires a host origin and session");
  const mode = params.get("origin") ?? "cross-origin";
  if (mode !== "cross-origin" && mode !== "same-origin-local") throw new Error("invalid frame origin mode");
  validateFrameOrigin({ runtimeOrigin: location.origin, hostOrigin: origin, origin: mode });
  return createBridge({ target: parent, origin, session, direction: "frame", onMessage: options.receive, onError: options.error });
}

export async function workerRequest(message: unknown, timeoutMs: number): Promise<void> {
  const controller = navigator.serviceWorker.controller;
  if (!controller) throw new Error("service worker does not control frame");
  await new Promise<void>((resolve, reject) => {
    const channel = new MessageChannel();
    const timer = setTimeout(() => { channel.port1.close(); reject(new Error("worker request timed out")); }, timeoutMs);
    channel.port1.onmessage = (event: MessageEvent<{ ok: boolean; error?: unknown }>) => {
      clearTimeout(timer); channel.port1.close();
      if (event.data.ok) resolve(); else reject(Object.assign(new Error("worker rejected request"), { pageRuntime: event.data.error }));
    };
    controller.postMessage(message, [channel.port2]);
  });
}
