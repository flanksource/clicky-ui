import { createElement } from "react";
import { createRoot } from "react-dom/client";
import { PageFrame } from "../../host/PageFrame.tsx";
import type { PageBridge } from "../../host/bridge.ts";
import type { FrameMessage, HostMessage } from "../../schema.ts";

const config = await (await fetch("/case.json?case=ready")).json() as { origin: string; open: Extract<HostMessage, { type: "open" }> };
const events: FrameMessage[] = [];
let bridge: PageBridge | null = null;
let source = "";
document.body.innerHTML = '<div id="frame"></div><button id="design">Design</button><button id="preview">Preview</button><button id="write">Write</button><button id="inspect">Inspect</button><pre id="events"></pre><pre id="inspection"></pre><pre id="error"></pre>';
function send(message: FrameMessage) {
  events.push(message);
  document.getElementById("events")!.textContent = JSON.stringify(events);
  if (message.type === "status" && message.state === "ready") document.title = "LOCAL-READY";
  if (message.type === "error") document.getElementById("error")!.textContent = JSON.stringify(message.error);
  if (message.type === "design-selection") source = message.source;
  if (message.type === "design-write-request") {
    document.body.dataset.write = JSON.stringify(message.request);
    bridge!.send({ type: "design-write-result", requestId: message.requestId, result: { status: "applied", file: "report.tsx", path: "/pages/report.tsx", line: 1, hash: "012345abcdef" } });
  }
}
createRoot(document.getElementById("frame")!).render(createElement(PageFrame, { id: "runtime-frame", runtimeOrigin: location.origin, origin: "same-origin-local", open: config.open, theme: { theme: "light", density: "compact" }, data: null, style: { width: "100%", height: 300 }, onMessage: send, onBridge(value) { bridge = value; }, onError(error) { document.getElementById("error")!.textContent = error.message; } }));
document.getElementById("design")!.onclick = () => bridge!.send({ type: "mode", mode: "design" });
document.getElementById("preview")!.onclick = () => bridge!.send({ type: "design-override", requestId: "preview", source, props: { fill: "blue", width: 180 } });
document.getElementById("write")!.onclick = () => bridge!.send({ type: "design-write", requestId: "write", page: "report", source, edit: { kind: "attributes", values: { fill: "blue", width: 180 } } });
document.getElementById("inspect")!.onclick = () => { void (async () => {
  const frame = document.querySelector("iframe")!;
  const registrations = await navigator.serviceWorker.getRegistrations();
  const element = frame.contentDocument!.getElementById("target")!;
  const target = element.getBoundingClientRect(); const outer = frame.getBoundingClientRect();
  document.getElementById("inspection")!.textContent = JSON.stringify({ hostControlled: navigator.serviceWorker.controller !== null, scopes: registrations.map((r) => new URL(r.scope).pathname), probe: await (await fetch("/__playground/probe")).text(), hostSource: await (await fetch("/src/host-module.js")).text(), frameControlled: frame.contentWindow!.navigator.serviceWorker.controller !== null, fill: element.getAttribute("fill"), width: element.getAttribute("width"), write: document.body.dataset.write ? JSON.parse(document.body.dataset.write) as unknown : null, target: { x: outer.left + frame.clientLeft + target.left + target.width / 2, y: outer.top + frame.clientTop + target.top + target.height / 2 } });
})().catch((error: unknown) => { document.getElementById("error")!.textContent = String(error); }); };
