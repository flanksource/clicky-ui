import { createContext, useContext } from "react";
import type { PageBridge, RuntimeActivityState } from "@flanksource/page-runtime/host";
import type { AgentSelection, FrameMessage, PageLock, RuntimeProfile } from "@flanksource/page-runtime/schema";
import type { CommentElementCaptureContext } from "../../plugins/comments-model";
import { captureScreenshot } from "../comments/screenshot";
import { hostRect } from "./project";
import type { PageReload } from "../page-reload";

/** What the open frame runs: published by BrowserPage, read by the shell's status menu. */
export type RuntimeStatus = { page: string; state: string; build: import("@flanksource/page-runtime/host").BuildStep[]; profile: RuntimeProfile | null; lock: PageLock | null; activity: RuntimeActivityState; links: number; dependencies: Record<string, string>; issues: import("./project").CompatibilityIssue[]; usedPackages: string[]; configuration: import("./project").BrowserProject["configuration"] | null; dependencySources: Record<import("./dependency-defaults").DependencyScope, Record<string, string>> | null; policy: import("./runtime-profile").EffectivePolicy | null };

export function createBrowserSession() {
  let runtime: RuntimeStatus | null = null;
  const runtimeListeners = new Set<() => void>();
  let bridge: PageBridge | null = null;
  let frame: HTMLIFrameElement | null = null;
  let reload: PageReload | null = null;
  let generation = 0;
  let snapshot: { bridge: PageBridge | null; frame: HTMLIFrameElement | null; ready: boolean } = { bridge, frame, ready: false };
  const listeners = new Set<() => void>();
  const receivers = new Set<(message: FrameMessage) => void>();
  const selections = new Map<string, AgentSelection>();
  let pending: { resolve: (selection: AgentSelection) => void; reject: (error: Error) => void } | null = null;
  return {
    attach(options: { bridge: PageBridge | null; frame: HTMLIFrameElement | null; reload: PageReload | null }) {
      reload = options.reload;
      if (bridge === options.bridge && frame === options.frame) return;
      generation++; selections.clear();
      pending?.reject(new Error("Page changed during capture")); pending = null;
      bridge = options.bridge; frame = options.frame; reload = options.reload;
      snapshot = { bridge, frame, ready: false };
      listeners.forEach(listener => listener());
    },
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    getSnapshot: () => snapshot,
    subscribeRuntime(listener: () => void) { runtimeListeners.add(listener); return () => { runtimeListeners.delete(listener); }; },
    getRuntime: () => runtime,
    publishRuntime(next: RuntimeStatus | null) { runtime = next; runtimeListeners.forEach(listener => listener()); },
    onMessage(receiver: (message: FrameMessage) => void) { receivers.add(receiver); return () => { receivers.delete(receiver); }; },
    receive(message: FrameMessage) {
      if (message.type === "status") { snapshot = { ...snapshot, ready: message.state === "ready" }; listeners.forEach(listener => listener()); }
      receivers.forEach(receiver => receiver(message));
    },
    accept(selection: AgentSelection) {
      selections.set(selection.anchor, selection);
      if (!pending) return false;
      pending.resolve(selection); pending = null; return true;
    },
    async capture(anchor: string, actionId: string): Promise<CommentElementCaptureContext> {
      if (!bridge || !frame?.isConnected) throw new Error("Page frame is unavailable for capture");
      let selection = selections.get(anchor);
      if (!selection && anchor === "__document__") {
        if (pending) throw new Error("Another frame capture is pending");
        selection = await new Promise<AgentSelection>((resolve, reject) => {
          const timer = setTimeout(() => { pending = null; reject(new Error("Page capture timed out")); }, 15000);
          pending = { resolve: value => { clearTimeout(timer); resolve(value); }, reject: error => { clearTimeout(timer); reject(error); } };
          bridge!.send({ type: "page" });
        });
      }
      if (!selection) throw new Error(`Select ${anchor} again before capturing its context`);
      const current = generation;
      const target = frame;
      const screenshot = actionId === "screenshot" ? await captureScreenshot({ rect: hostRect({ frame: target.getBoundingClientRect(), rect: selection.rect }), isLive: () => target.isConnected && generation === current && selections.get(anchor) === selection }) : undefined;
      return { ...selection.element, ...(screenshot ? { screenshot } : {}) };
    },
    async reload(request: Parameters<PageReload>[0]) { if (!reload) throw new Error("No active frame to reload"); await reload(request); },
    send(message: Parameters<PageBridge["send"]>[0]) { if (!bridge) throw new Error("Page frame bridge is unavailable"); bridge.send(message); },
  };
}

export type BrowserSession = ReturnType<typeof createBrowserSession>;
export const BrowserSessionContext = createContext<BrowserSession | null>(null);
export const useBrowserSession = () => useContext(BrowserSessionContext);
