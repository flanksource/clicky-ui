import type { PageBridge } from "@flanksource/page-runtime/host";
import type { ReviewActionRequest } from "@flanksource/page-runtime/host";
import { exportElement, type ExportFormat } from "../review/export";

export async function reviewBlob(options: { bridge: PageBridge; request: ReviewActionRequest; format: ExportFormat; title: string }): Promise<Blob> {
  if (!options.request.content) throw new Error("Frame returned no review export content");
  const snapshot = await options.bridge.request({ type: "export", format: "html" });
  if (snapshot.message.type !== "snapshot") throw new Error("Frame returned no styled HTML snapshot");
  const documentCopy = new DOMParser().parseFromString(snapshot.message.html, "text/html");
  documentCopy.body.innerHTML = options.request.content.html;
  for (const element of documentCopy.querySelectorAll("script,[data-page-agent],[data-react-grab],[data-react-grab-ignore]")) element.remove();
  for (const element of documentCopy.querySelectorAll("*")) for (const name of element.getAttributeNames()) if (name.startsWith("on")) element.removeAttribute(name);
  const frame = document.createElement("iframe");
  frame.title = "Preparing review export";
  frame.sandbox.add("allow-same-origin");
  frame.style.position = "fixed"; frame.style.left = "-20000px";
  frame.style.width = `${Math.max(1, options.request.element.selection.rect.width)}px`;
  frame.style.height = `${Math.max(1, options.request.element.selection.rect.height)}px`;
  try {
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("Review export document timed out")), 15000);
      frame.onload = () => { clearTimeout(timer); resolve(); };
      frame.onerror = () => { clearTimeout(timer); reject(new Error("Review export document failed")); };
      frame.srcdoc = documentCopy.documentElement.outerHTML;
      document.body.append(frame);
    });
    const doc = frame.contentDocument;
    if (!doc) throw new Error("Review export document is unavailable");
    await doc.fonts.ready;
    await Promise.all([...doc.images].map(image => image.decode()));
    return await exportElement(doc.body, options.format, options.title);
  } finally { frame.remove(); }
}

export async function publishReviewBlob(options: { blob: Blob; format: ExportFormat; title: string }): Promise<string> {
  const response = await fetch(`/__playground/exports/${options.title}.${options.format}`, { method: "PUT", headers: { "Content-Type": options.blob.type }, body: options.blob });
  const result = await response.json() as { url?: string; error?: string };
  if (!response.ok || typeof result.url !== "string") throw new Error(result.error ?? `Export publication failed: HTTP ${response.status}`);
  return new URL(result.url, location.href).href;
}
