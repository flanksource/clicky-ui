import type { BridgeEnvelope, FrameMessage, HostMessage } from "../schema.ts";
import { validateEnvelope } from "./validation.ts";

export type BridgeOptions = {
  target: Window; origin: string; session: string; direction: "host" | "frame";
  onMessage: (envelope: BridgeEnvelope) => void;
  onError: (error: Error) => void;
  window?: Window; timeoutMs?: number;
};

export function createBridge(options: BridgeOptions) {
  if (new URL(options.origin).origin !== options.origin || !options.session) throw new Error("bridge requires an exact origin and session");
  const local = options.window ?? window;
  const pending = new Map<string, { resolve: (m: BridgeEnvelope) => void; reject: (e: Error) => void; timer: ReturnType<typeof setTimeout> }>();
  const inbound = options.direction === "host" ? "frame" : "host";
  const receive = (event: MessageEvent<unknown>) => {
    if (event.origin !== options.origin || event.source !== options.target) return;
    try {
      const message = validateEnvelope(event.data, inbound);
      if (message.session !== options.session) return;
      const request = message.re ? pending.get(message.re) : undefined;
      if (request && message.re) {
        clearTimeout(request.timer); pending.delete(message.re);
        if (message.message.type === "error") request.reject(new Error(`${message.message.error.phase}: ${message.message.error.message}`)); else request.resolve(message);
      } else options.onMessage(message);
    } catch (error) { options.onError(error instanceof Error ? error : new Error(String(error))); }
  };
  local.addEventListener("message", receive);
  let disposed = false;
  function send(message: HostMessage | FrameMessage, reference?: { id?: string; re?: string }) {
    if (disposed) throw new Error("bridge is disposed");
    const envelope: BridgeEnvelope = { bridge: "page-runtime-v1", session: options.session, ...reference, message };
    validateEnvelope(envelope, options.direction);
    options.target.postMessage(envelope, options.origin);
  }
  return {
    send,
    request(message: HostMessage | FrameMessage, requestOptions: { timeoutMs?: number } = {}): Promise<BridgeEnvelope> {
      const id = crypto.randomUUID();
      return new Promise((resolve, reject) => {
        const timeoutMs = requestOptions.timeoutMs ?? options.timeoutMs ?? 15000;
        if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) throw new Error("bridge request timeout must be a positive finite number");
        const timer = setTimeout(() => { pending.delete(id); reject(new Error(`bridge request ${id} timed out`)); }, timeoutMs);
        pending.set(id, { resolve, reject, timer });
        try { send(message, { id }); } catch (error) { clearTimeout(timer); pending.delete(id); reject(error); }
      });
    },
    dispose() {
      disposed = true; local.removeEventListener("message", receive);
      for (const request of pending.values()) { clearTimeout(request.timer); request.reject(new Error("bridge disposed")); }
      pending.clear();
    },
  };
}
export type PageBridge = ReturnType<typeof createBridge>;
