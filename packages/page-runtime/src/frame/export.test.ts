// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { exportHtml } from "./export.ts";

afterEach(() => { document.head.innerHTML = ""; document.body.innerHTML = ""; vi.unstubAllGlobals(); });

it("exports only page content and never fetches assets from agent or picker hosts", async () => {
  document.body.innerHTML = '<div data-page-agent><img src="/agent.svg"></div><div data-react-grab><img src="/picker.svg"></div><main id="root"><h1>Report</h1><img src="/report.svg"></main>';
  Object.defineProperty(document, "adoptedStyleSheets", { value: [], configurable: true });
  for (const image of document.images) Object.defineProperty(image, "currentSrc", { value: image.src });
  const fetch = vi.fn(async () => new Response("<svg/>", { headers: { "content-type": "image/svg+xml" } }));
  vi.stubGlobal("fetch", fetch);
  const html = await exportHtml();
  expect({ agent: html.includes("data-page-agent"), picker: html.includes("data-react-grab"), report: html.includes("Report"), inlined: html.includes('src="data:image/svg+xml;base64,PHN2Zy8+"'), assets: fetch.mock.calls }).toEqual({
    agent: false, picker: false, report: true, inlined: true, assets: [[new URL("/report.svg", location.href).href]],
  });
});
