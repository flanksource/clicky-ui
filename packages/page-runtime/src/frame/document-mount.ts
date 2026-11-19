import { mountPage, type PageLayout, type PageModule, type ReactRuntime } from "./mount-page.ts";
import { waitForReadiness } from "./readiness.ts";
import type { JsonValue } from "../schema.ts";

export function documentError(error: unknown): void {
  const status = document.getElementById("facet-document-status");
  if (!status) throw error;
  status.textContent = error instanceof Error ? error.message : String(error);
  status.setAttribute("role", "alert");
}

export async function mount(module: PageModule, runtime: ReactRuntime, options?: { layout: PageLayout; prepareStyles: (root: HTMLElement) => Promise<void> }): Promise<void> {
  const root = document.getElementById("facet-root");
  const data = document.getElementById("facet-document-data");
  const status = document.getElementById("facet-document-status");
  if (!root || !data || !status) throw new Error("Incomplete Facet document");
  try {
    const mounted = mountPage({
      module, runtime, root, file: document.title, data: JSON.parse(data.textContent ?? "") as JsonValue,
      ...(options ? { layout: options.layout } : {}), wrap: children => children, send: () => undefined,
    });
    await mounted.mounted;
    await options?.prepareStyles(root);
    await waitForReadiness({
      root, mounted: mounted.mounted, ...(module.ready ? { hook: module.ready } : {}),
      timeoutMs: 30000, status: () => undefined,
    });
    status.remove();
  } catch (error) {
    documentError(error);
  }
}
