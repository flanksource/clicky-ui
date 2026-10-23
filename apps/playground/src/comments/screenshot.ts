import type {
  CommentScreenshotCapture,
  CommentScreenshotUnavailableReason,
} from "../../plugins/comments-model";

type CapturedTabTrack = MediaStreamTrack & {
  getCaptureHandle?: () => { handle: string } | null;
};

type CaptureMediaDevices = MediaDevices & {
  setCaptureHandleConfig?: (config: {
    handle: string;
    exposeOrigin: boolean;
    permittedOrigins: string[];
  }) => void;
};

let retainedDisplayStream: MediaStream | undefined;
let pendingDisplayStream: Promise<MediaStream> | undefined;
let captureHandle: string | undefined;
let captureVersion = 0;
const CAPTURE_TIMEOUT_MS = 10_000;

function stopStream(stream: MediaStream): void {
  stream.getTracks().forEach((track) => track.stop());
}

function requestNewDisplayStream(): Promise<MediaStream> {
  const mediaDevices = navigator.mediaDevices as CaptureMediaDevices;
  captureHandle ??= crypto.randomUUID();
  if (!mediaDevices.setCaptureHandleConfig) {
    throw new Error("browser does not support capture handles");
  }
  mediaDevices.setCaptureHandleConfig({
    handle: captureHandle,
    exposeOrigin: false,
    permittedOrigins: [window.location.origin],
  });
  return navigator.mediaDevices.getDisplayMedia({
    video: { displaySurface: "browser" },
    audio: false,
    preferCurrentTab: true,
    selfBrowserSurface: "include",
    monitorTypeSurfaces: "exclude",
  } as DisplayMediaStreamOptions);
}

function isCurrentTab(stream: MediaStream): boolean {
  const track = stream.getVideoTracks()[0] as CapturedTabTrack | undefined;
  return (
    track?.readyState === "live" &&
    track.getSettings().displaySurface === "browser" &&
    track.getCaptureHandle?.()?.handle === captureHandle
  );
}

function assertCurrentTab(stream: MediaStream): void {
  const track = stream.getVideoTracks()[0] as CapturedTabTrack | undefined;
  if (!track || track.readyState !== "live") {
    throw new Error("selected display stream has no live video track");
  }
  if (!isCurrentTab(stream)) {
    throw new Error("select this tab to capture a playground element");
  }
}

function retainDisplayStream(stream: MediaStream): MediaStream {
  try {
    assertCurrentTab(stream);
  } catch (error) {
    stopStream(stream);
    throw error;
  }
  retainedDisplayStream = stream;
  stream.getTracks().forEach((track) => {
    track.addEventListener(
      "ended",
      () => {
        if (retainedDisplayStream === stream) retainedDisplayStream = undefined;
      },
      { once: true },
    );
  });
  return stream;
}

function requestDisplayStream(): Promise<MediaStream> {
  if (retainedDisplayStream && isCurrentTab(retainedDisplayStream)) {
    return Promise.resolve(retainedDisplayStream);
  }
  if (retainedDisplayStream) stopStream(retainedDisplayStream);
  retainedDisplayStream = undefined;
  if (pendingDisplayStream) return pendingDisplayStream;

  const version = captureVersion;
  const request = requestNewDisplayStream().then((stream) => {
    if (version !== captureVersion) {
      stopStream(stream);
      throw new Error("Screenshot capture session was closed");
    }
    return retainDisplayStream(stream);
  });
  pendingDisplayStream = request;
  void request.then(
    () => {
      if (pendingDisplayStream === request) pendingDisplayStream = undefined;
    },
    () => {
      if (pendingDisplayStream === request) pendingDisplayStream = undefined;
    },
  );
  return request;
}

export function releaseScreenshotCapture(): void {
  captureVersion++;
  if (retainedDisplayStream) stopStream(retainedDisplayStream);
  retainedDisplayStream = undefined;
  pendingDisplayStream = undefined;
}

function nextPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

function frameRectForElement(
  video: HTMLVideoElement,
  element: Element,
): { x: number; y: number; width: number; height: number } {
  const bounds = element.getBoundingClientRect();
  if (!element.isConnected || bounds.width <= 0 || bounds.height <= 0) {
    throw new Error("selected element is no longer visible");
  }
  if (!video.videoWidth || !video.videoHeight) {
    throw new Error("captured tab has no video frame");
  }
  const scaleX = video.videoWidth / window.innerWidth;
  const scaleY = video.videoHeight / window.innerHeight;
  if (
    !Number.isFinite(scaleX) ||
    !Number.isFinite(scaleY) ||
    Math.abs(scaleX - scaleY) > Math.max(scaleX, scaleY) * 0.02
  ) {
    throw new Error("captured tab has invalid viewport dimensions");
  }
  const x = Math.max(0, Math.floor(bounds.left * scaleX));
  const y = Math.max(0, Math.floor(bounds.top * scaleY));
  const right = Math.min(video.videoWidth, Math.ceil(bounds.right * scaleX));
  const bottom = Math.min(video.videoHeight, Math.ceil(bounds.bottom * scaleY));
  if (right <= x || bottom <= y) {
    throw new Error("selected element is outside the captured viewport");
  }
  return { x, y, width: right - x, height: bottom - y };
}

async function frameToDataUrl(
  stream: MediaStream,
  element: Element,
): Promise<string> {
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.srcObject = stream;
  try {
    await video.play();
    await nextPaint();

    const rect = frameRectForElement(video, element);
    const canvas = document.createElement("canvas");
    canvas.width = rect.width;
    canvas.height = rect.height;
    const context = canvas.getContext("2d");
    if (!context)
      throw new Error("browser could not create a screenshot canvas");
    context.drawImage(
      video,
      rect.x,
      rect.y,
      rect.width,
      rect.height,
      0,
      0,
      canvas.width,
      canvas.height,
    );

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (value) =>
          value ? resolve(value) : reject(new Error("PNG encoding failed")),
        "image/png",
      );
    });
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("PNG serialization failed"));
      reader.onload = () => resolve(String(reader.result));
      reader.readAsDataURL(blob);
    });
  } finally {
    video.pause();
    video.srcObject = null;
  }
}

function unavailableReason(error: unknown): CommentScreenshotUnavailableReason {
  return error instanceof DOMException &&
    ["NotAllowedError", "AbortError"].includes(error.name)
    ? "cancelled"
    : "failed";
}

export async function captureScreenshot(
  element: Element,
): Promise<CommentScreenshotCapture> {
  const mediaDevices = navigator.mediaDevices as
    | CaptureMediaDevices
    | undefined;
  if (
    !mediaDevices?.getDisplayMedia ||
    !mediaDevices.setCaptureHandleConfig ||
    !crypto.randomUUID
  ) {
    return { status: "unavailable", reason: "unsupported" };
  }

  try {
    const stream = await requestDisplayStream();
    try {
      assertCurrentTab(stream);
    } catch (error) {
      if (retainedDisplayStream === stream) retainedDisplayStream = undefined;
      stopStream(stream);
      throw error;
    }
    const source = stream.getVideoTracks()[0];
    if (!source) throw new Error("selected display stream has no video track");

    const track = source.clone();
    const captureStream = new MediaStream([track]);
    let timeout: ReturnType<typeof setTimeout> | undefined;
    try {
      const frame = frameToDataUrl(captureStream, element);
      const stalled = new Promise<never>((_, reject) => {
        timeout = setTimeout(() => {
          if (retainedDisplayStream === stream)
            retainedDisplayStream = undefined;
          stopStream(stream);
          reject(new Error("screenshot capture timed out"));
        }, CAPTURE_TIMEOUT_MS);
      });
      return {
        status: "captured",
        dataUrl: await Promise.race([frame, stalled]),
      };
    } finally {
      clearTimeout(timeout);
      track.stop();
    }
  } catch (error) {
    return { status: "unavailable", reason: unavailableReason(error) };
  }
}
