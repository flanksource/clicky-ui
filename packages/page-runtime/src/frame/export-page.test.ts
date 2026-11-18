// @vitest-environment jsdom
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { expect, it, vi } from "vitest";
import { withExportRender } from "./export-page.ts";
import { exampleLock } from "../link/testing-fixtures.ts";
import type { FrameConfig } from "../schema.ts";

vi.mock("/__runtime/export-compiler.js", () => ({ compileExportMdx: async () => "compiled" }));
vi.mock("./readiness.ts", () => ({ waitForReadiness: async ({ mounted }: { mounted: Promise<void> }) => mounted }));

it("keeps the live page visible while export markup prepares and restores it after snapshot", async () => {
  const root = document.createElement("main"); root.textContent = "Live page"; document.body.append(root);
  const entry = pathToFileURL(resolve("src/frame/testing/boot-page.ts")).href;
  const plugin = pathToFileURL(resolve("src/frame/testing/boot-layout.ts")).href;
  const config: FrameConfig = { page: "report.md", entry, runtimeVersion: "test", lock: { ...exampleLock(), compiler: { report: { remark: [{ module: plugin }] } } }, profile: { runtimeDomain: "runtime.example", embedders: [], packageOrigin: "https://packages.example", registry: "https://registry.example", managed: {}, policy: { dependencies: "strict" }, minReleaseAgeDays: 0, network: { allow: [] }, csp: { add: {} }, links: "deny", sources: ["host"], readinessTimeoutMs: 1000 } };
  let release!: () => void;
  const mounted = new Promise<void>(resolveMounted => { release = resolveMounted; });
  const mount = vi.fn((_module, container: HTMLElement) => { container.textContent = "Export page"; return { mounted, unmount: vi.fn() }; });
  const run = vi.fn(async () => ({ liveHidden: root.hidden, exportVisible: document.querySelector<HTMLElement>("[data-page-runtime-export]")!.style.position === "" }));
  try {
    const exporting = withExportRender({ config, root, request: async () => {}, mount, run });
    await vi.waitFor(() => expect(mount).toHaveBeenCalledOnce());
    expect({ hidden: root.hidden, text: root.textContent, staging: document.querySelector<HTMLElement>("[data-page-runtime-export]")!.style.position }).toEqual({ hidden: false, text: "Live page", staging: "fixed" });
    release();
    expect(await exporting).toEqual({ liveHidden: true, exportVisible: true });
    expect({ hidden: root.hidden, staging: document.querySelector("[data-page-runtime-export]") }).toEqual({ hidden: false, staging: null });
  } finally { release(); root.remove(); }
});
