import type { UploadedAttachment } from "../src/comments/gavel-todo";

/** Dispatched by the page-world grabber when the user closes it; the isolated-world bridge clears the site's `enabled` flag and forwards it to the background. */
export const CLOSED_EVENT = "playground-grabber:closed";
/** Dispatched by the page-world early script once the document is ready and the site is enabled; the bridge forwards it as a `page-enabled` request. */
export const ENABLED_EVENT = "playground-grabber:enabled";
/** Dispatched by the page-world grabber to ask for a screenshot of the visible tab; the bridge answers with `CAPTURE_RESULT_EVENT`. */
export const CAPTURE_REQUEST_EVENT = "playground-grabber:capture";
export const CAPTURE_RESULT_EVENT = "playground-grabber:captured";

/** Dispatched by the page-world grabber to upload a screenshot to the tab's gavel server; the bridge answers with `UPLOAD_RESULT_EVENT`. */
export const UPLOAD_REQUEST_EVENT = "playground-grabber:upload";
export const UPLOAD_RESULT_EVENT = "playground-grabber:uploaded";

/** `id` pairs a result with the request it answers. */
export type CaptureRequestDetail = { id: string };
export type CaptureResultDetail = { id: string } & ({ ok: true; dataUrl: string } | { ok: false; error: string });
export type UploadRequestDetail = { id: string; dataUrl: string; name: string };
export type UploadResultDetail = { id: string } & ({ ok: true; attachment: UploadedAttachment } | { ok: false; error: string });

/** What extension pages (popup, relay, panel) and the bridge ask the background worker. */
export type BackgroundRequest =
  /** Show the grabber on `tabId` with that tab's effective settings. */
  | { type: "activate"; tabId: number }
  /** Close the grabber on `tabId` and forget its activation. */
  | { type: "deactivate"; tabId: number }
  /** The sender tab's document loaded while enabled for its site: activate it. */
  | { type: "page-enabled" }
  /** A PNG data URL of the sender tab's visible area. */
  | { type: "capture" }
  /** Upload a PNG data URL to the sender tab's gavel server as a todo attachment. */
  | { type: "upload-attachment"; dataUrl: string; name: string }
  /** The settings the sender tab's grabber was activated with. */
  | { type: "activation" };

export type BackgroundResponse<T> = { ok: true; value: T } | { ok: false; error: string };

export async function requestBackground<T>(request: BackgroundRequest): Promise<T> {
  const response = (await chrome.runtime.sendMessage(request)) as BackgroundResponse<T> | undefined;
  if (!response) throw new Error("The grabber's background worker did not answer");
  if (!response.ok) throw new Error(response.error);
  return response.value;
}
