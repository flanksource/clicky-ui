import { domToCanvas, domToForeignObjectSvg } from "modern-screenshot";

export type ExportFormat = "svg" | "png" | "html";

const EXPORTS_ROUTE = "/__playground/exports";

const MIME: Record<ExportFormat, string> = {
  svg: "image/svg+xml",
  png: "image/png",
  html: "text/html",
};

// reviewContent is what an export captures: the review panel's content when
// the reviewable renders one (ReviewVariant), otherwise the element itself.
// Panels of nested reviewables belong to them, not to this element.
export function reviewContent(element: HTMLElement): HTMLElement {
  return (
    Array.from(
      element.querySelectorAll<HTMLElement>("[data-review-content]"),
    ).find(
      (content) => content.parentElement?.closest("[data-review-id]") === element,
    ) ?? element
  );
}

function escapeAttribute(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

function stylesheetMarkup(sheet: CSSStyleSheet): string {
  let rules: CSSRuleList;
  try {
    rules = sheet.cssRules;
  } catch {
    // Cross-origin sheets hide their rules; reference them instead.
    if (!sheet.href)
      throw new Error("Unreadable stylesheet has no href to link");
    return `<link rel="stylesheet" href="${escapeAttribute(sheet.href)}">`;
  }
  return `<style>${Array.from(rules, (rule) => rule.cssText).join("\n")}</style>`;
}

export type Crop = { x: number; y: number; width: number; height: number };

const BACKGROUND_TOLERANCE = 8;

// contentBounds is the smallest pixel rectangle holding every pixel that
// differs from the background, or null when the image is all background.
export function contentBounds(
  image: { data: Uint8ClampedArray; width: number; height: number },
  background: readonly [number, number, number, number],
): Crop | null {
  let left = image.width;
  let top = image.height;
  let right = -1;
  let bottom = -1;
  for (let y = 0; y < image.height; y++) {
    for (let x = 0; x < image.width; x++) {
      const offset = (y * image.width + x) * 4;
      const differs = background.some(
        (channel, index) =>
          Math.abs((image.data[offset + index] ?? 0) - channel) >
          BACKGROUND_TOLERANCE,
      );
      if (!differs) continue;
      left = Math.min(left, x);
      right = Math.max(right, x);
      top = Math.min(top, y);
      bottom = Math.max(bottom, y);
    }
  }
  return right < 0
    ? null
    : { x: left, y: top, width: right - left + 1, height: bottom - top + 1 };
}

function rgba(color: string): [number, number, number, number] {
  const context = document.createElement("canvas").getContext("2d");
  if (!context) throw new Error("browser could not create a canvas");
  context.fillStyle = color;
  context.fillRect(0, 0, 1, 1);
  const [r = 0, g = 0, b = 0, a = 0] = context.getImageData(0, 0, 1, 1).data;
  return [r, g, b, a];
}

// autocrop renders the element once and returns that canvas with the crop of
// its non-background content, in canvas pixels and in CSS pixels.
async function autocrop(
  element: HTMLElement,
  options: { backgroundColor: string; scale: number },
): Promise<{ canvas: HTMLCanvasElement; pixels: Crop; css: Crop }> {
  const canvas = await domToCanvas(element, options);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("browser could not read the export canvas");
  const pixels = contentBounds(
    context.getImageData(0, 0, canvas.width, canvas.height),
    rgba(options.backgroundColor),
  );
  if (!pixels) throw new Error("Nothing visible to export in this element");
  const { scale } = options;
  const x = Math.floor(pixels.x / scale);
  const y = Math.floor(pixels.y / scale);
  return {
    canvas,
    pixels,
    css: {
      x,
      y,
      width: Math.ceil((pixels.x + pixels.width) / scale) - x,
      height: Math.ceil((pixels.y + pixels.height) / scale) - y,
    },
  };
}

function croppedPng(canvas: HTMLCanvasElement, crop: Crop): Promise<Blob> {
  const cropped = document.createElement("canvas");
  cropped.width = crop.width;
  cropped.height = crop.height;
  const context = cropped.getContext("2d");
  if (!context) throw new Error("browser could not create a crop canvas");
  context.drawImage(
    canvas,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    crop.width,
    crop.height,
  );
  return new Promise((resolve, reject) =>
    cropped.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("PNG encoding failed"))),
      MIME.png,
    ),
  );
}

// standaloneHtml renders the element as a self-contained document that keeps
// the page's stylesheets and the root theme/density attributes. The element
// keeps its laid-out width and is clipped to the crop.
export function standaloneHtml(
  element: HTMLElement,
  title: string,
  crop: Crop,
): string {
  const doc = element.ownerDocument;
  const root = doc.documentElement;
  const rootAttributes = Array.from(root.attributes, (attribute) =>
    ` ${attribute.name}="${escapeAttribute(attribute.value)}"`,
  ).join("");
  const styles = Array.from(doc.styleSheets, stylesheetMarkup).join("\n");
  return [
    "<!doctype html>",
    `<html${rootAttributes}>`,
    "<head>",
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    `<title>${title.replace(/</g, "&lt;")}</title>`,
    styles,
    "</head>",
    `<body class="${escapeAttribute(doc.body.className)}">`,
    `<div style="overflow:hidden;width:${crop.width}px;height:${crop.height}px">`,
    `<div style="margin:${-crop.y}px 0 0 ${-crop.x}px;width:${element.offsetWidth}px">`,
    element.outerHTML,
    "</div>",
    "</div>",
    "</body>",
    "</html>",
  ].join("\n");
}

export async function exportElement(
  element: HTMLElement,
  format: ExportFormat,
  title: string,
): Promise<Blob> {
  const options = {
    backgroundColor: getComputedStyle(element.ownerDocument.body)
      .backgroundColor,
    scale: window.devicePixelRatio,
  };
  const { canvas, pixels, css } = await autocrop(element, options);
  if (format === "png") return croppedPng(canvas, pixels);
  if (format === "html")
    return new Blob([standaloneHtml(element, title, css)], {
      type: MIME.html,
    });
  const svg = await domToForeignObjectSvg(element, options);
  // The foreignObject is sized in percent of the viewBox; pin it to the
  // element's laid-out size so cropping the viewBox does not reflow it.
  const foreignObject = svg.querySelector("foreignObject");
  if (!foreignObject) throw new Error("SVG export has no foreignObject");
  foreignObject.setAttribute("width", String(element.offsetWidth));
  foreignObject.setAttribute("height", String(element.offsetHeight));
  svg.setAttribute("viewBox", `${css.x} ${css.y} ${css.width} ${css.height}`);
  svg.setAttribute("width", String(css.width));
  svg.setAttribute("height", String(css.height));
  return new Blob([new XMLSerializer().serializeToString(svg)], {
    type: MIME.svg,
  });
}

// copyElement must run inside the click gesture: the clipboard item takes the
// pending export so the Clipboard API activation is not lost while it renders.
export function copyElement(
  element: HTMLElement,
  format: ExportFormat,
  title: string,
): Promise<void> {
  const blob = exportElement(element, format, title);
  const text = async () =>
    new Blob([await (await blob).text()], { type: "text/plain" });
  const item =
    format === "png"
      ? { "image/png": blob }
      : format === "html"
        ? { "text/html": blob, "text/plain": text() }
        : { "text/plain": text() };
  return navigator.clipboard.write([new ClipboardItem(item)]);
}

// publishElement stores the export on the dev server and returns its direct
// download URL.
export async function publishElement(
  element: HTMLElement,
  format: ExportFormat,
  title: string,
): Promise<string> {
  const response = await fetch(`${EXPORTS_ROUTE}/${title}.${format}`, {
    method: "PUT",
    headers: { "Content-Type": MIME[format] },
    body: await exportElement(element, format, title),
  });
  const payload = (await response.json()) as { url?: string; error?: string };
  if (!response.ok || typeof payload.url !== "string")
    throw new Error(payload.error ?? `Publishing ${format} export failed`);
  return new URL(payload.url, window.location.href).href;
}

export async function downloadElement(
  element: HTMLElement,
  format: ExportFormat,
  title: string,
): Promise<void> {
  const url = URL.createObjectURL(await exportElement(element, format, title));
  try {
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title}.${format}`;
    link.click();
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}
