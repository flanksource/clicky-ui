import { cascadeOrder } from "../../styles.ts";

/** Imports base stylesheets in their declared cascade layers and waits for every import to load. */
export function insertBaseStyles(options: { document: Document; stylesheets: Array<{ url: string; layer: string }>; timeoutMs: number }): { links: HTMLStyleElement[]; ready: Promise<void> } {
  const layerOrder = cascadeOrder(options.stylesheets.map(sheet => sheet.layer));
  const links = options.stylesheets.map(({ url, layer }) => {
    const link = options.document.createElement("style");
    link.textContent = `${layerOrder}\n@import url(${JSON.stringify(url)}) layer(${layer});`;
    link.dataset["pageRuntimeBase"] = url;
    return link;
  });
  const ready = Promise.all(links.map((link) => new Promise<void>((resolve, reject) => {
    const url = link.dataset["pageRuntimeBase"];
    const timer = setTimeout(() => reject(new Error(`${url}: base stylesheet timeout after ${options.timeoutMs}ms`)), options.timeoutMs);
    link.addEventListener("load", () => { clearTimeout(timer); resolve(); }, { once: true });
    link.addEventListener("error", () => { clearTimeout(timer); reject(new Error(`${url}: base stylesheet failed to load`)); }, { once: true });
  }))).then(() => undefined);
  options.document.head.append(...links);
  return { links, ready };
}

export function insertCss(options: { document: Document; previous?: HTMLStyleElement; css: string; timeoutMs: number }) {
  const style = options.document.createElement("style");
  style.id = "runtime-tailwind";
  const ready = /@import\s/.test(options.css) ? new Promise<void>((resolve, reject) => {
    const done = (error?: Error) => {
      clearTimeout(timer);
      style.removeEventListener("load", loaded);
      style.removeEventListener("error", failed);
      if (error) reject(error); else resolve();
    };
    const loaded = () => done();
    const failed = () => done(new Error("runtime Tailwind stylesheet import failed"));
    const timer = setTimeout(() => done(new Error(`runtime Tailwind stylesheet imports timeout after ${options.timeoutMs}ms`)), options.timeoutMs);
    style.addEventListener("load", loaded);
    style.addEventListener("error", failed);
  }) : Promise.resolve();
  style.textContent = options.css;
  if (options.previous) options.previous.replaceWith(style);
  else options.document.head.append(style);
  return { style, ready };
}
