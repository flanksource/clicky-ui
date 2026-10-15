import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

class CaptureTrack {
  readyState: MediaStreamTrackState = "live";
  displaySurface = "browser";
  captureHandle: string | null = null;
  readonly clones: CaptureTrack[] = [];
  readonly cropTo: ReturnType<typeof vi.fn>;
  readonly stop = vi.fn(() => {
    this.readyState = "ended";
  });
  readonly addEventListener = vi.fn();
  readonly getSettings = vi.fn(() => ({ displaySurface: this.displaySurface }));
  readonly getCaptureHandle = vi.fn(() =>
    this.captureHandle ? { handle: this.captureHandle } : null,
  );

  constructor(
    crop: () => Promise<void>,
    private readonly cloneCrop: () => Promise<void> = crop,
  ) {
    this.cropTo = vi.fn(crop);
  }

  clone() {
    const track = new CaptureTrack(this.cloneCrop);
    track.displaySurface = this.displaySurface;
    track.captureHandle = this.captureHandle;
    this.clones.push(track);
    return track;
  }
}

class CaptureStream {
  constructor(private readonly tracks: CaptureTrack[]) {}

  getTracks() {
    return this.tracks;
  }

  getVideoTracks() {
    return this.tracks;
  }
}

function installCaptureBrowser(source: CaptureTrack) {
  const getDisplayMedia = vi.fn(async () => new CaptureStream([source]));
  const setCaptureHandleConfig = vi.fn(({ handle }: { handle: string }) => {
    source.captureHandle = handle;
  });
  vi.stubGlobal("navigator", {
    mediaDevices: { getDisplayMedia, setCaptureHandleConfig },
  });
  vi.stubGlobal("MediaStream", CaptureStream);
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    callback(0);
    return 1;
  });
  vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
  vi.spyOn(HTMLVideoElement.prototype, "videoWidth", "get").mockReturnValue(
    2048,
  );
  vi.spyOn(HTMLVideoElement.prototype, "videoHeight", "get").mockReturnValue(
    1536,
  );
  const drawImage = vi.fn();
  const canvases: HTMLCanvasElement[] = [];
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(
    function (this: HTMLCanvasElement) {
      canvases.push(this);
      return { drawImage } as unknown as CanvasRenderingContext2D;
    },
  );
  vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation(
    (callback) => callback(new Blob(["png"], { type: "image/png" })),
  );
  return { getDisplayMedia, drawImage, canvases };
}

describe("captureScreenshot", () => {
  beforeEach(() => vi.resetModules());
  afterEach(() => {
    document.body.replaceChildren();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("captures two comments from one shared display without recropping the source", async () => {
    let sourceCropCount = 0;
    const source = new CaptureTrack(
      () =>
        ++sourceCropCount === 1
          ? Promise.resolve()
          : new Promise<void>(() => {}),
      () => Promise.resolve(),
    );
    const { getDisplayMedia, drawImage } = installCaptureBrowser(source);
    const { captureScreenshot } = await import("./screenshot");
    const first = document.createElement("div");
    const second = document.createElement("section");
    document.body.append(first, second);
    vi.spyOn(first, "getBoundingClientRect").mockReturnValue(
      DOMRect.fromRect({ x: 100, y: 50, width: 40, height: 20 }),
    );
    vi.spyOn(second, "getBoundingClientRect").mockReturnValue(
      DOMRect.fromRect({ x: 200, y: 100, width: 60, height: 30 }),
    );

    expect(await captureScreenshot(first)).toMatchObject({
      status: "captured",
    });
    const next = await Promise.race([
      captureScreenshot(second),
      new Promise<string>((resolve) =>
        setTimeout(() => resolve("stalled"), 1000),
      ),
    ]);

    expect(next).toMatchObject({ status: "captured" });
    expect(getDisplayMedia).toHaveBeenCalledTimes(1);
    expect(source.cropTo).not.toHaveBeenCalled();
    expect(source.stop).not.toHaveBeenCalled();
    expect(source.clones).toHaveLength(2);
    expect(source.clones.map((track) => track.stop.mock.calls.length)).toEqual([
      1, 1,
    ]);
    expect(
      drawImage.mock.calls.map(([, x, y, width, height]) => [
        x,
        y,
        width,
        height,
      ]),
    ).toEqual([
      [200, 100, 80, 40],
      [400, 200, 120, 60],
    ]);
  });

  it("saves only the selected element without native cropping", async () => {
    const source = new CaptureTrack(
      () => Promise.resolve(),
      () => Promise.reject(new Error("crop unavailable on cloned track")),
    );
    const { canvases, drawImage } = installCaptureBrowser(source);
    const { captureScreenshot } = await import("./screenshot");
    const element = document.createElement("div");
    document.body.append(element);
    vi.spyOn(element, "getBoundingClientRect").mockReturnValue(
      DOMRect.fromRect({ x: 100, y: 50, width: 40, height: 20 }),
    );

    expect(await captureScreenshot(element)).toMatchObject({
      status: "captured",
    });
    expect(canvases[0]?.width).toBe(80);
    expect(canvases[0]?.height).toBe(40);
    expect(drawImage).toHaveBeenCalledWith(
      expect.any(HTMLVideoElement),
      200,
      100,
      80,
      40,
      0,
      0,
      80,
      40,
    );
    expect(source.clones[0]?.cropTo).not.toHaveBeenCalled();
  });

  it("rejects a non-tab display instead of saving its full frame", async () => {
    const source = new CaptureTrack(() => Promise.resolve());
    source.displaySurface = "monitor";
    const { canvases } = installCaptureBrowser(source);
    const { captureScreenshot } = await import("./screenshot");

    expect(await captureScreenshot(document.createElement("div"))).toEqual({
      status: "unavailable",
      reason: "failed",
    });
    expect(canvases).toHaveLength(0);
    expect(source.stop).toHaveBeenCalledTimes(1);
  });

  it("rejects another tab even when its display surface is a browser", async () => {
    const source = new CaptureTrack(() => Promise.resolve());
    source.getCaptureHandle.mockReturnValue({ handle: "another-tab" });
    const { canvases } = installCaptureBrowser(source);
    const { captureScreenshot } = await import("./screenshot");

    expect(await captureScreenshot(document.createElement("div"))).toEqual({
      status: "unavailable",
      reason: "failed",
    });
    expect(canvases).toHaveLength(0);
    expect(source.stop).toHaveBeenCalledTimes(1);
  });

  it("rejects an element outside the captured viewport", async () => {
    const source = new CaptureTrack(() => Promise.resolve());
    const { canvases } = installCaptureBrowser(source);
    const { captureScreenshot } = await import("./screenshot");
    const element = document.createElement("div");
    document.body.append(element);
    vi.spyOn(element, "getBoundingClientRect").mockReturnValue(
      DOMRect.fromRect({ x: -100, y: 50, width: 40, height: 20 }),
    );

    expect(await captureScreenshot(element)).toEqual({
      status: "unavailable",
      reason: "failed",
    });
    expect(canvases).toHaveLength(0);
  });

  it("does not request display capture when tab identity cannot be checked", async () => {
    const getDisplayMedia = vi.fn();
    vi.stubGlobal("navigator", { mediaDevices: { getDisplayMedia } });
    const { captureScreenshot } = await import("./screenshot");

    expect(await captureScreenshot(document.createElement("div"))).toEqual({
      status: "unavailable",
      reason: "unsupported",
    });
    expect(getDisplayMedia).not.toHaveBeenCalled();
  });

  it("rejects a frame whose dimensions do not match the tab viewport", async () => {
    const source = new CaptureTrack(() => Promise.resolve());
    const { canvases } = installCaptureBrowser(source);
    vi.spyOn(HTMLVideoElement.prototype, "videoHeight", "get").mockReturnValue(
      1000,
    );
    const { captureScreenshot } = await import("./screenshot");
    const element = document.createElement("div");
    document.body.append(element);
    vi.spyOn(element, "getBoundingClientRect").mockReturnValue(
      DOMRect.fromRect({ x: 100, y: 50, width: 40, height: 20 }),
    );

    expect(await captureScreenshot(element)).toEqual({
      status: "unavailable",
      reason: "failed",
    });
    expect(canvases).toHaveLength(0);
  });

  it("stops the shared display when a frame never becomes playable", async () => {
    const source = new CaptureTrack(() => Promise.resolve());
    installCaptureBrowser(source);
    vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(
      () => new Promise<void>(() => {}),
    );
    const { captureScreenshot } = await import("./screenshot");
    vi.useFakeTimers();

    const pending = captureScreenshot(document.createElement("div"));
    await vi.advanceTimersByTimeAsync(10_000);

    expect(await pending).toEqual({ status: "unavailable", reason: "failed" });
    expect(source.clones[0]?.stop).toHaveBeenCalledTimes(1);
    expect(source.stop).toHaveBeenCalledTimes(1);
  });
});
