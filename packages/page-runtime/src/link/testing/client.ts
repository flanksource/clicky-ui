import { createLinkHost, connectLinkRuntime } from "../../host/link/index.ts";
import type { PageLock, RuntimeProfile } from "../../schema.ts";
import type { LinkBuild } from "../types.ts";
import { copyLinkToOpfs } from "./folder.ts";

type Configuration = { runtimeOrigin: string; sourceOrigin: string; profile: RuntimeProfile; lock: PageLock; build: LinkBuild };
const config = JSON.parse(document.getElementById("config")!.textContent!) as Configuration;
const setup = document.querySelector<HTMLIFrameElement>("#setup")!;
const linked = document.querySelector<HTMLIFrameElement>("#linked")!;
let controlLoads = 0;
let start = 0;
let restored = false;
let deniedWithoutOverrides = false;
let phase = 0;
let folderTransport = false;
let folderRequested = false;
let completeReload: (() => void) | undefined;
let opening!: () => void;
const activated = new Promise<void>((resolve) => { opening = resolve; });
const failure = (error: unknown) => { document.getElementById("status")!.textContent = String(error); void fetch("/record", { method: "POST", body: JSON.stringify({ error: String(error) }) }); };

async function runtimeRequest(value: unknown): Promise<{ compiled?: string[] }> {
  return new Promise((resolve, reject) => {
    const channel = new MessageChannel();
    const timer = setTimeout(() => { channel.port1.close(); reject(new Error("test runtime request timeout")); }, 15000);
    channel.port1.onmessage = (event) => { clearTimeout(timer); channel.port1.close(); if (event.data.error) reject(new Error(event.data.error)); else resolve(event.data); };
    setup.contentWindow!.postMessage(value, config.runtimeOrigin, [channel.port2]);
  });
}

window.addEventListener("message", (event) => {
  if (event.source === setup.contentWindow && event.origin === config.runtimeOrigin && event.data === "runtime-ready") opening();
  if (event.source === setup.contentWindow && event.origin === config.runtimeOrigin && event.data?.error) failure(event.data.error);
  if (event.source === document.querySelector<HTMLIFrameElement>("#control")!.contentWindow && event.origin === config.runtimeOrigin && event.data === "control-ready") controlLoads++;
});

async function run() {
  await activated;
  const connection = await connectLinkRuntime({ runtimeOrigin: config.runtimeOrigin, profile: config.profile, developerOverrides: true });
  const host = createLinkHost({ profile: config.profile, developerOverrides: true, transport: connection.request });
  try { createLinkHost({ profile: config.profile, developerOverrides: false, transport: connection.request }); }
  catch { deniedWithoutOverrides = true; }
  if (!(await host.restore()).length) await host.server({ id: "checkout", url: config.sourceOrigin });
  await host.close();
  const restoredHost = createLinkHost({ profile: config.profile, developerOverrides: true, transport: connection.request });
  restored = (await restoredHost.restore()).length === 1;
  const lock = restoredHost.override({ lock: config.lock, ids: ["checkout"] });
  await runtimeRequest({ message: { type: "open", page: "page.tsx", manifest: { dependencies: {} }, lock, files: { "page.tsx": `import React from "react"; import {createRoot} from "react-dom/client"; import {Version,DataTable,linkedVersionReact,linkedTableReact} from "@flanksource/clicky-ui/data"; globalThis.reactInstances = new Set([React, linkedVersionReact, linkedTableReact]).size; createRoot(document.getElementById("root")).render(React.createElement("main",null,React.createElement(Version),React.createElement("div",{style:{height:320}},React.createElement(DataTable,{data:[{name:"alpha",status:"ready"},{name:"beta",status:"ready"}],columns:[{key:"name",label:"Name"},{key:"status",label:"Status"}]}))));` } } });
  let watcher = restoredHost.watch("checkout");
  document.querySelector<HTMLButtonElement>("#folder")!.onclick = () => {
    void (async () => {
      await restoredHost.pickFolder({ id: "checkout" });
      await watcher.stop(); watcher = restoredHost.watch("checkout");
      start = performance.timeOrigin + performance.now(); linked.src = `${config.runtimeOrigin}/test-frame?page=page.tsx&manual-folder=${++phase}`;
      await watcher.start({ onError: failure });
      document.getElementById("status")!.textContent = "Folder linked. Edit src/data/Version.tsx in the selected checkout.";
    })().catch((error: unknown) => { document.getElementById("status")!.textContent = String(error); });
  };
  restoredHost.registerFrame({ id: "linked", links: ["checkout"], reload() {
    if (completeReload) throw new Error("Linked frame reload is already pending");
    return new Promise<void>((resolve) => { completeReload = resolve; start = performance.timeOrigin + performance.now(); linked.src = `${config.runtimeOrigin}/test-frame?page=page.tsx&revision=${++phase}`; });
  } });
  restoredHost.registerFrame({ id: "control", links: [], reload() { throw new Error("Unlinked frame must never reload"); } });
  window.addEventListener("message", (event) => {
    if (event.source !== linked.contentWindow || event.origin !== config.runtimeOrigin) return;
    void (async () => {
      if (event.data.error) throw new Error(event.data.error);
      if (!event.data.marker) return;
      completeReload?.(); completeReload = undefined;
      if (phase === 1) await watcher.start({ onError: failure });
      const stats = await runtimeRequest({ stats: true });
      await fetch("/record", { method: "POST", body: JSON.stringify({ ...event.data, elapsed: event.data.at - start, compiled: stats.compiled, controlLoads, restored, deniedWithoutOverrides, folderTransport }) });
      if (phase === 0) { phase = 1; start = performance.timeOrigin + performance.now(); linked.src = `${config.runtimeOrigin}/test-frame?page=page.tsx&warm`; }
      else if (phase === 1) phase = 2;
      if (event.data.marker === "revision-12" && !folderRequested) {
        folderRequested = true;
        const files = await connection.request({ type: "files", id: "checkout" });
        if (!files.files) throw new Error("Worker did not report source files");
        const link = restoredHost.list()[0]; if (!link) throw new Error("Missing server link");
        const directory = await copyLinkToOpfs({ link, files: Object.keys(files.files), build: config.build });
        await watcher.stop();
        await restoredHost.folder({ id: "checkout", directory });
        await restoredHost.close();
        const folderHost = createLinkHost({ profile: config.profile, developerOverrides: true, transport: connection.request });
        const restoredLinks = await folderHost.restore();
        if (restoredLinks[0]?.source.kind !== "folder" || !restoredLinks[0].directory) throw new Error("Directory handle did not survive IndexedDB storage");
        folderTransport = true;
        start = performance.timeOrigin + performance.now(); linked.src = `${config.runtimeOrigin}/test-frame?page=page.tsx&folder`;
      }
    })().catch(failure);
  });
  start = performance.timeOrigin + performance.now(); linked.src = `${config.runtimeOrigin}/test-frame?page=page.tsx`;
}
setup.src = `${config.runtimeOrigin}/setup`;
document.querySelector<HTMLIFrameElement>("#control")!.src = `${config.runtimeOrigin}/control`;
void run().catch(failure);
