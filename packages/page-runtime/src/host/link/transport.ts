import type { RuntimeProfile } from "../../schema.ts";
import type { LinkCommand, LinkReply } from "../../link/types.ts";
import { assertLinksAllowed } from "../../link/validation.ts";
import { readLinkFile } from "../../link/source.ts";

export function linkRelayPath(options: { relayPath?: string }): string {
  const path = options.relayPath ?? "/frame/__runtime-link-relay";
  if (path !== "/frame/__runtime-link-relay" && path !== "/frame/_link-relay") throw new Error("Link relay must use a supported /frame/ relay path");
  return path;
}

export async function connectLinkRuntime(options: { runtimeOrigin: string; profile: Pick<RuntimeProfile, "links">; developerOverrides: boolean; timeoutMs?: number; relayPath?: string }) {
  assertLinksAllowed(options);
  if (new URL(options.runtimeOrigin).origin !== options.runtimeOrigin) throw new Error("Link runtime must be an origin");
  const session = crypto.randomUUID();
  const frame = document.createElement("iframe");
  frame.hidden = true;
  frame.title = "Library link connection";
  frame.src = `${options.runtimeOrigin}${linkRelayPath(options)}#${new URLSearchParams({ host: location.origin, session })}`;
  const timeoutMs = options.timeoutMs ?? 15000;
  const readers = new Map<string, MessagePort>();
  try {
    await new Promise<void>((resolve, reject) => {
      const finish = (error?: Error) => { clearTimeout(timer); window.removeEventListener("message", receive); if (error) reject(error); else resolve(); };
      const receive = (event: MessageEvent) => {
        if (event.origin !== options.runtimeOrigin || event.source !== frame.contentWindow || event.data?.session !== session || event.data?.channel !== "page-runtime-link-v1") return;
        finish(event.data.error ? new Error(String(event.data.error)) : undefined);
      };
      const timer = setTimeout(() => finish(new Error("Link runtime relay timed out; open a runtime frame to activate its service worker first")), timeoutMs);
      window.addEventListener("message", receive);
      document.body.append(frame);
    });
  } catch (error) { frame.remove(); throw error; }
  return {
    async request(command: LinkCommand): Promise<LinkReply> {
      const target = frame.contentWindow;
      if (!target || !frame.isConnected) throw new Error("Link connection is closed");
      return new Promise<LinkReply>((resolve, reject) => {
        const channel = new MessageChannel();
        const ports = [channel.port2];
        let payload = command;
        if (command.type === "install" && command.link.source.kind === "folder") {
          const link = command.link;
          if (!link.directory) { reject(new Error("Folder link requires a host directory handle")); return; }
          const reader = new MessageChannel();
          readers.get(link.id)?.close(); readers.set(link.id, reader.port1); ports.push(reader.port2);
          reader.port1.onmessage = (event: MessageEvent<{ request: string; path: string }>) => {
            void readLinkFile({ link, path: event.data.path }).then((bytes) => {
              const data = new Uint8Array(bytes).buffer;
              reader.port1.postMessage({ request: event.data.request, data }, [data]);
            }, (error: unknown) => reader.port1.postMessage({ request: event.data.request, error: String(error) }));
          };
          payload = { ...command, link: { id: link.id, build: link.build, source: { kind: "folder", session } } };
        }
        const timer = setTimeout(() => { channel.port1.close(); reject(new Error("Link runtime command timed out")); }, timeoutMs);
        channel.port1.onmessage = (event: MessageEvent<{ error?: string; result?: LinkReply }>) => {
          clearTimeout(timer); channel.port1.close();
          if (event.data.error) reject(new Error(event.data.error));
          else if (event.data.result?.ok === true) resolve(event.data.result);
          else reject(new Error("Invalid link runtime reply"));
        };
        target.postMessage({ channel: "page-runtime-link-v1", session, developerOverrides: true, command: payload }, options.runtimeOrigin, ports);
      });
    },
    close() { for (const port of readers.values()) port.close(); readers.clear(); frame.remove(); },
  };
}
