import type {
  CommentScreenshotCapture,
  CommentScreenshotUnavailableReason,
} from "../../plugins/comments-model";

type CroppableTrack = MediaStreamTrack & {
  cropTo?: (target: unknown) => Promise<void>;
};

type CropTargetFactory = {
  fromElement?: (element: Element) => Promise<unknown>;
};

let retainedDisplayStream: MediaStream | undefined;
let pendingDisplayStream: Promise<MediaStream> | undefined;
const CAPTURE_TIMEOUT_MS = 10_000;

function stopStream(stream: MediaStream): void {
  stream.getTracks().forEach((track) => track.stop());
}

function requestNewDisplayStream(): Promise<MediaStream> {
  return navigator.mediaDevices.getDisplayMedia({
    video: { displaySurface: "browser" },
    audio: false,
    preferCurrentTab: true,
  } as DisplayMediaStreamOptions);
}

function hasLiveVideo(stream: MediaStream): boolean {
  return stream.getVideoTracks().some((track) => track.readyState === "live");
}

function retainDisplayStream(stream: MediaStream): MediaStream {
  if (!hasLiveVideo(stream)) {
    stopStream(stream);
    throw new Error("selected display stream has no live video track");
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
  if (retainedDisplayStream && hasLiveVideo(retainedDisplayStream)) {
    return Promise.resolve(retainedDisplayStream);
  }
  if (retainedDisplayStream) stopStream(retainedDisplayStream);
  retainedDisplayStream = undefined;
  if (pendingDisplayStream) return pendingDisplayStream;

  const request = requestNewDisplayStream().then(retainDisplayStream);
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

function nextPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

async function cropToElement(
  track: CroppableTrack | undefined,
  element: Element,
): Promise<void> {
  const cropTarget = (
    window as typeof window & { CropTarget?: CropTargetFactory }
  ).CropTarget;
  if (!track?.cropTo || !cropTarget?.fromElement) return;
  try {
    await track.cropTo(await cropTarget.fromElement(element));
  } catch {
    // Region Capture is optional; the selected page frame remains useful.
  }
}

async function frameToDataUrl(stream: MediaStream): Promise<string> {
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.srcObject = stream;
  try {
    await video.play();
    await nextPaint();

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1;
    canvas.height = video.videoHeight || 1;
    const context = canvas.getContext("2d");
    if (!context)
      throw new Error("browser could not create a screenshot canvas");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

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
  if (!navigator.mediaDevices?.getDisplayMedia) {
    return { status: "unavailable", reason: "unsupported" };
  }

  try {
    const stream = await requestDisplayStream();
    const source = stream.getVideoTracks()[0];
    if (!source) throw new Error("selected display stream has no video track");

    // Keep the shared source uncropped so each comment starts with a fresh frame.
    const track = source.clone() as CroppableTrack;
    const captureStream = new MediaStream([track]);
    let timeout: ReturnType<typeof setTimeout> | undefined;
    try {
      const frame = (async () => {
        await cropToElement(track, element);
        return frameToDataUrl(captureStream);
      })();
      const stalled = new Promise<never>((_, reject) => {
        timeout = setTimeout(() => {
          if (retainedDisplayStream === stream) retainedDisplayStream = undefined;
          stopStream(stream);
          reject(new Error("screenshot capture timed out"));
        }, CAPTURE_TIMEOUT_MS);
      });
      return { status: "captured", dataUrl: await Promise.race([frame, stalled]) };
    } finally {
      clearTimeout(timeout);
      track.stop();
    }
  } catch (error) {
    return { status: "unavailable", reason: unavailableReason(error) };
  }
}
