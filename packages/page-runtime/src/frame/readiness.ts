import type { FrameMessage } from "../schema.ts";

export type ReadinessOptions = { root: HTMLElement; mounted: Promise<void>; hook?: (() => Promise<void>) | Promise<void>; timeoutMs: number; status: (state: Extract<FrameMessage, { type: "status" }>["state"]) => void };
const frame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

function diagramsReady(root: HTMLElement): boolean {
  for (const element of root.querySelectorAll("[data-facet-error]")) throw new Error(element.getAttribute("data-facet-error")!);
  return [...root.querySelectorAll("[data-facet-diagram]")].every((d) => d.getAttribute("data-facet-ready") === "true") && [...root.querySelectorAll("[data-facet-arrow]")].every((d) => d.getAttribute("data-facet-arrow-ready") === "true");
}

async function stylesheetsReady(stopped: () => boolean): Promise<void> {
  while (!stopped()) {
    const links = [...document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')];
    const failed = links.find((link) => link.dataset.pageRuntime === "error");
    if (failed) throw new Error(`stylesheet failed: ${failed.href}`);
    if (links.every((link) => link.dataset.pageRuntime === "loaded" || (link.dataset.pageRuntime === undefined && link.sheet !== null))) return;
    await frame();
  }
}

export async function waitForReadiness(options: ReadinessOptions): Promise<void> {
  let lastActivity = performance.now(); let stopped = false;
  const mutation = new MutationObserver(() => { lastActivity = performance.now(); });
  const resize = new ResizeObserver(() => { lastActivity = performance.now(); });
  mutation.observe(options.root, { childList: true, subtree: true, attributes: true, characterData: true });
  resize.observe(options.root);
  let timer: ReturnType<typeof setTimeout> | undefined;
  const ready = async () => {
    await options.mounted; if (stopped) return; options.status("mounted");
    await stylesheetsReady(() => stopped); if (stopped) return; options.status("stylesheets");
    await document.fonts.ready; if (stopped) return; options.status("fonts");
    await Promise.all([...document.images].map(async (image) => { await image.decode(); if (!image.naturalWidth) throw new Error(`image failed: ${image.src}`); }));
    if (stopped) return; options.status("images");
    if (options.hook) await (typeof options.hook === "function" ? options.hook() : options.hook);
    if (stopped) return; options.status("hook");
    while (!stopped && !diagramsReady(options.root)) await frame();
    if (stopped) return; options.status("diagrams");
    options.status("quiescence");
    while (!stopped) {
      await stylesheetsReady(() => stopped);
      await document.fonts.ready;
      await Promise.all([...document.images].map((image) => image.decode()));
      if (diagramsReady(options.root) && document.fonts.status === "loaded" && performance.now() - lastActivity >= 200) break;
      await frame();
    }
    if (!stopped) options.status("ready");
  };
  try {
    await Promise.race([ready(), new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error(`readiness timeout after ${options.timeoutMs}ms`)), options.timeoutMs); })]);
  } finally { stopped = true; clearTimeout(timer); mutation.disconnect(); resize.disconnect(); }
}
