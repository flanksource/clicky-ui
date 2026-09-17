import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

class CaptureTrack {
  readyState: MediaStreamTrackState = "live";
  readonly clones: CaptureTrack[] = [];
  readonly cropTo: ReturnType<typeof vi.fn>;
  readonly stop = vi.fn(() => {
    this.readyState = "ended";
  });
  readonly addEventListener = vi.fn();

  constructor(
    crop: () => Promise<void>,
    private readonly cloneCrop: () => Promise<void> = crop,
  ) {
    this.cropTo = vi.fn(crop);
  }

  clone() {
    const track = new CaptureTrack(this.cloneCrop);
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
  vi.stubGlobal("navigator", { mediaDevices: { getDisplayMedia } });
  vi.stubGlobal("MediaStream", CaptureStream);
  vi.stubGlobal("CropTarget", { fromElement: vi.fn(async (element) => element) });
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    callback(0);
    return 1;
  });
  vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
    drawImage: vi.fn(),
  } as unknown as CanvasRenderingContext2D);
  vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation(
    (callback) => callback(new Blob(["png"], { type: "image/png" })),
  );
  return getDisplayMedia;
}

describe("captureScreenshot", () => {
  beforeEach(() => vi.resetModules());
  afterEach(() => {
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
    const getDisplayMedia = installCaptureBrowser(source);
    const { captureScreenshot } = await import("./screenshot");
    const first = document.createElement("div");
    const second = document.createElement("section");

    expect(await captureScreenshot(first)).toMatchObject({ status: "captured" });
    const next = await Promise.race([
      captureScreenshot(second),
      new Promise<string>((resolve) => setTimeout(() => resolve("stalled"), 1000)),
    ]);

    expect(next).toMatchObject({ status: "captured" });
    expect(getDisplayMedia).toHaveBeenCalledTimes(1);
    expect(source.cropTo).not.toHaveBeenCalled();
    expect(source.stop).not.toHaveBeenCalled();
    expect(source.clones).toHaveLength(2);
    expect(source.clones.map((track) => track.stop.mock.calls.length)).toEqual([
      1, 1,
    ]);
  });

  it("finishes a comment when cropping a cloned track stalls", async () => {
    const source = new CaptureTrack(
      () => Promise.resolve(),
      () => new Promise<void>(() => {}),
    );
    installCaptureBrowser(source);
    const { captureScreenshot } = await import("./screenshot");
    vi.useFakeTimers();

    const pending = captureScreenshot(document.createElement("div"));
    await vi.advanceTimersByTimeAsync(10_000);

    expect(await pending).toEqual({ status: "unavailable", reason: "failed" });
    expect(source.clones[0]?.stop).toHaveBeenCalledTimes(1);
    expect(source.stop).toHaveBeenCalledTimes(1);
  });
});
