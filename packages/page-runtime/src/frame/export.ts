import postcss from "postcss";

function importConditions(css: string, suffix: string): string {
  let rest = suffix.trim();
  const layer = /^layer(?:\(([^)]+)\))?(?:\s+|$)/.exec(rest);
  if (layer) rest = rest.slice(layer[0].length);
  let supports = "";
  if (rest.startsWith("supports(")) {
    let depth = 1; let index = "supports(".length;
    for (; index < rest.length && depth > 0; index++) {
      if (rest[index] === "(") depth++; else if (rest[index] === ")") depth--;
    }
    if (depth) throw new Error(`HTML export invalid @import supports condition: ${rest}`);
    supports = rest.slice("supports".length, index); rest = rest.slice(index).trim();
  }
  let result = rest ? `@media ${rest} {${css}}` : css;
  if (supports) result = `@supports ${supports} {${result}}`;
  if (layer) result = `@layer ${layer[1] ?? ""} {${result}}`;
  return result;
}

async function assetUrl(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTML export asset ${url}: HTTP ${response.status}`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  let binary = "";
  for (let index = 0; index < bytes.length; index += 0x8000) binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
  return `data:${response.headers.get("content-type") ?? "application/octet-stream"};base64,${btoa(binary)}`;
}

async function inlineCss(options: { css: string; url: string; parents: string[] }): Promise<string> {
  if (options.parents.includes(options.url)) throw new Error(`HTML export cyclic stylesheet import: ${options.url}`);
  const ast = postcss.parse(options.css, { from: options.url });
  const imports: Promise<void>[] = [];
  ast.walkAtRules("import", (rule) => {
    imports.push((async () => {
      const match = /^(?:url\(\s*["']?([^"')]+)["']?\s*\)|["']([^"']+)["'])\s*(.*)$/.exec(rule.params);
      if (!match) throw new Error(`HTML export unsupported @import: ${rule.params}`);
      const url = new URL(match[1] ?? match[2]!, options.url).href;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTML export stylesheet ${url}: HTTP ${response.status}`);
      const css = await inlineCss({ css: await response.text(), url, parents: [...options.parents, options.url] });
      rule.replaceWith(postcss.parse(importConditions(css, match[3]!)));
    })());
  });
  await Promise.all(imports);
  const assets: Promise<void>[] = [];
  ast.walkDecls((decl) => {
    const urls = [...decl.value.matchAll(/url\(\s*(["']?)([^"')]+)\1\s*\)/g)];
    if (!urls.length) return;
    assets.push((async () => {
      for (const match of urls.reverse()) {
        const target = match[2]!;
        if (target.startsWith("data:") || target.startsWith("#")) continue;
        const data = await assetUrl(new URL(target, options.url).href);
        decl.value = `${decl.value.slice(0, match.index)}url(${JSON.stringify(data)})${decl.value.slice(match.index! + match[0].length)}`;
      }
    })());
  });
  await Promise.all(assets);
  return ast.toString();
}

export async function exportHtml(): Promise<string> {
  const clone = document.documentElement.cloneNode(true) as HTMLElement;
  clone.querySelectorAll("script").forEach((node) => node.remove());
  clone.querySelectorAll("[data-page-agent], [data-react-grab]").forEach((node) => node.remove());
  // During an export render (export-page.ts) the live root is hidden and the export compile renders after it.
  const exportRender = clone.querySelector<HTMLElement>("[data-page-runtime-export]");
  if (exportRender) { clone.querySelector("[data-page-runtime-live]")?.remove(); exportRender.removeAttribute("data-page-runtime-export"); exportRender.id = "root"; }
  for (const link of clone.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')) {
    const response = await fetch(link.href);
    if (!response.ok) throw new Error(`HTML export stylesheet ${link.href}: HTTP ${response.status}`);
    const style = document.createElement("style"); style.textContent = await inlineCss({ css: await response.text(), url: link.href, parents: [] }); link.replaceWith(style);
  }
  for (const sheet of document.adoptedStyleSheets) {
    const style = document.createElement("style"); style.textContent = [...sheet.cssRules].map((rule) => rule.cssText).join("\n"); clone.querySelector("head")!.append(style);
  }
  for (const style of clone.querySelectorAll("style")) style.textContent = await inlineCss({ css: style.textContent, url: location.href, parents: [] });
  const originals = [...document.images].filter((image) => !image.closest("[data-page-agent], [data-react-grab]") && !(exportRender && image.closest("[data-page-runtime-live]")));
  for (const [index, image] of [...clone.querySelectorAll<HTMLImageElement>("img")].entries()) {
    const original = originals[index];
    if (!original) throw new Error("HTML export image disappeared from source document");
    image.src = await assetUrl(original.currentSrc); image.removeAttribute("srcset"); image.removeAttribute("sizes");
  }
  clone.querySelectorAll("picture source").forEach((source) => source.remove());
  return `<!doctype html>\n${clone.outerHTML}`;
}
