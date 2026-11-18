import type { AgentRect } from "@flanksource/page-runtime/schema";

type Size = { width: number; height: number };
export function selectionCrop({ frame, rect, viewport, capture }: { frame: AgentRect; rect: AgentRect; viewport: Size; capture: Size }): { x: number; y: number; width: number; height: number } {
  if (![...Object.values(frame), ...Object.values(rect), ...Object.values(viewport), ...Object.values(capture)].every(Number.isFinite) || [frame, rect, viewport, capture].some((size) => size.width <= 0 || size.height <= 0)) throw new Error("Invalid selection geometry");
  const left = Math.max(0, frame.left, frame.left + rect.left);
  const top = Math.max(0, frame.top, frame.top + rect.top);
  const right = Math.min(viewport.width, frame.left + frame.width, frame.left + rect.left + rect.width);
  const bottom = Math.min(viewport.height, frame.top + frame.height, frame.top + rect.top + rect.height);
  if (right <= left || bottom <= top) throw new Error("Selection is outside the visible frame");
  const x = Math.round(left * capture.width / viewport.width);
  const y = Math.round(top * capture.height / viewport.height);
  return { x, y, width: Math.round(right * capture.width / viewport.width) - x, height: Math.round(bottom * capture.height / viewport.height) - y };
}

export async function captureSelection(options: { frame: HTMLIFrameElement; rect: AgentRect }): Promise<string> {
  type CaptureDevices = MediaDevices & { setCaptureHandleConfig?: (config: { handle: string; exposeOrigin: boolean; permittedOrigins: string[] }) => void };
  type CaptureTrack = MediaStreamTrack & { getCaptureHandle?: () => { handle: string } | null };
  const devices = navigator.mediaDevices as CaptureDevices | undefined;
  if (!devices?.getDisplayMedia || !devices.setCaptureHandleConfig) throw new Error("This browser cannot verify current-tab capture; screenshots require Chromium. Firefox and WebKit capture is unverified.");
  const handle = crypto.randomUUID();
  devices.setCaptureHandleConfig({ handle, exposeOrigin: false, permittedOrigins: [location.origin] });
  const stream = await devices.getDisplayMedia({ video: { displaySurface: "browser" }, audio: false, preferCurrentTab: true, selfBrowserSurface: "include", surfaceSwitching: "exclude" } as DisplayMediaStreamOptions);
  const video = document.createElement("video");
  try {
    const track = stream.getVideoTracks()[0] as CaptureTrack | undefined;
    if (!track || track.getSettings().displaySurface !== "browser" || track.getCaptureHandle?.()?.handle !== handle) throw new Error("Select this page-host tab to capture the selection");
    video.muted = true; video.playsInline = true; video.srcObject = stream;
    await video.play();
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => { video.cancelVideoFrameCallback(callback); reject(new Error("Current-tab capture did not produce a video frame")); }, 10000);
      const callback = video.requestVideoFrameCallback(() => { clearTimeout(timer); resolve(); });
    });
    const crop = selectionCrop({ frame: options.frame.getBoundingClientRect(), rect: options.rect, viewport: { width: innerWidth, height: innerHeight }, capture: { width: video.videoWidth, height: video.videoHeight } });
    const canvas = document.createElement("canvas"); canvas.width = crop.width; canvas.height = crop.height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Screenshot canvas is unavailable");
    context.drawImage(video, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height);
    return canvas.toDataURL("image/png");
  } finally {
    stream.getTracks().forEach((track) => track.stop()); video.pause(); video.srcObject = null;
  }
}
