import { useLayoutEffect, useRef, type IframeHTMLAttributes } from "react";
import type { FrameMessage, HostMessage, JsonValue, Theme } from "../schema.ts";
import { createBridge, type PageBridge } from "./bridge.ts";
import { validateFrameOrigin, type FrameOrigin } from "./origin.ts";

export type PageFrameProps = Omit<IframeHTMLAttributes<HTMLIFrameElement>, "src" | "sandbox" | "onError"> & {
  runtimeOrigin: string; open: Omit<Extract<HostMessage, { type: "open" }>, "type">; theme: Theme; data: JsonValue;
  onMessage?: (message: FrameMessage) => void; onError: (error: Error) => void;
  onBridge?: (bridge: PageBridge | null) => void;
  /** Local development only: embed on the host origin while P7 isolation is deferred. */
  origin?: FrameOrigin;
};

export function PageFrame({ runtimeOrigin, origin = "cross-origin", open, theme, data, onMessage, onError, onBridge, ...props }: PageFrameProps) {
  const frame = useRef<HTMLIFrameElement>(null);
  const latest = useRef({ open, theme, data, onMessage, onError, onBridge });
  latest.current = { open, theme, data, onMessage, onError, onBridge };
  const bridge = useRef<PageBridge | null>(null);
  useLayoutEffect(() => {
    const target = frame.current?.contentWindow;
    if (!target || !frame.current) throw new Error("PageFrame has no contentWindow");
    validateFrameOrigin({ runtimeOrigin, hostOrigin: location.origin, origin });
    const session = crypto.randomUUID();
    let opened = false;
    bridge.current = createBridge({ target, origin: runtimeOrigin, session, direction: "host", onError: (error) => latest.current.onError(error), onMessage: (envelope) => {
      const message = envelope.message as FrameMessage;
      if (message.type === "lock" && JSON.stringify(message.lock) === JSON.stringify(latest.current.open.lock)) return;
      if (message.type === "status" && (message.state === "connecting" || (message.state === "booting" && !opened))) { opened = true; bridge.current!.send({ type: "open", ...latest.current.open }); return; }
      if (message.type === "status" && message.state === "booting") { bridge.current!.send({ type: "theme", ...latest.current.theme }); bridge.current!.send({ type: "data", data: latest.current.data }); }
      latest.current.onMessage?.(message);
    } });
    latest.current.onBridge?.(bridge.current);
    const params = new URLSearchParams({ session, host: location.origin });
    if (origin === "same-origin-local") params.set("origin", origin);
    frame.current.src = `${runtimeOrigin}/frame/${open.page.split("/").map(encodeURIComponent).join("/")}#${params}`;
    return () => { bridge.current?.dispose(); bridge.current = null; latest.current.onBridge?.(null); };
  }, [runtimeOrigin, origin, open.page]);
  useLayoutEffect(() => { bridge.current?.send({ type: "theme", ...theme }); }, [theme]);
  useLayoutEffect(() => { bridge.current?.send({ type: "data", data }); }, [data]);
  return <iframe {...props} ref={frame} title={props.title ?? open.page} sandbox="allow-scripts allow-same-origin allow-modals" />;
}
