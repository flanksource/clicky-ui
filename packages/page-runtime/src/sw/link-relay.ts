// This function is serialized into the runtime-origin relay document. Keep it self-contained.
function relay(settings: { embedders: string[]; allowed: boolean }) {
  const params = new URLSearchParams(location.hash.slice(1));
  const host = params.get("host"); const session = params.get("session");
  if (!host || !session || !settings.embedders.includes(host) || parent === window) throw new Error("Invalid library link host/session");
  const readers = new Map<string, MessagePort>();
  const channel = new BroadcastChannel(`page-runtime-link-${session}`);
  channel.onmessage = (event: MessageEvent<{ type: string; id: string; request: string; path: string }>) => {
    if (event.data.type !== "read") return;
    const reader = readers.get(event.data.id);
    if (!reader) return;
    reader.postMessage(event.data);
  };
  window.addEventListener("message", (event: MessageEvent) => {
    if (event.source !== parent || event.origin !== host || event.data?.channel !== "page-runtime-link-v1" || event.data.session !== session) return;
    const port = event.ports[0]; if (!port) throw new Error("Link command needs a reply port");
    void (async () => {
      try {
        if (!settings.allowed || event.data.developerOverrides !== true) throw new Error("Library links require links: allow and host developer overrides");
        const command = event.data.command;
        if (command.type === "install" && command.link.source.kind === "folder") {
          const reader = event.ports[1];
          if (!reader || command.link.source.session !== session) throw new Error("Folder link requires a host source channel");
          readers.get(command.link.id)?.close(); readers.set(command.link.id, reader);
          reader.onmessage = (reply: MessageEvent) => channel.postMessage({ type: "reply", ...reply.data });
        }
        if (command.type === "remove") { readers.get(command.id)?.close(); readers.delete(command.id); }
        const response = await fetch("/link/_control", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...event.data, command: command.type === "install" ? { ...command, link: { ...command.link, directory: undefined } } : command }) });
        if (!response.ok) throw new Error(await response.text());
        port.postMessage({ result: await response.json() });
      } catch (error) { port.postMessage({ error: String(error) }); }
      finally { port.close(); }
    })();
  });
  parent.postMessage({ channel: "page-runtime-link-v1", session, ...(settings.allowed ? {} : { error: "Library links are denied by the runtime profile" }) }, host);
}

export function linkRelayDocument(settings: { embedders: string[]; allowed: boolean }): string {
  return `<!doctype html><meta charset="utf-8"><title>Library link connection</title><script>(${relay.toString()})(${JSON.stringify(settings).replaceAll("<", "\\u003c")})</script>`;
}
