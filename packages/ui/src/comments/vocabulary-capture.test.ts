import { domToWebp } from "modern-screenshot";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { captureVocabularyPreviews } from "./vocabulary-capture";

vi.mock("modern-screenshot", () => ({ domToWebp: vi.fn() }));
const IMAGE = "data:image/webp;base64,c3BlY2ltZW4=";

function marker({ id, width = 320, height = 120, root = document.body }: {
  id: string; width?: number; height?: number; root?: ParentNode;
}) {
  const element = document.createElement("div");
  element.setAttribute("data-vocabulary-preview", id);
  element.getBoundingClientRect = () => new DOMRect(0, 0, width, height);
  root.appendChild(element);
  return element;
}

describe("captureVocabularyPreviews", () => {
  beforeEach(() => {
    vi.mocked(domToWebp).mockReset().mockResolvedValue(IMAGE);
    Object.defineProperty(document, "fonts", { configurable: true, value: { ready: Promise.resolve() } });
  });
  afterEach(() => {
    document.body.replaceChildren();
    Reflect.deleteProperty(document, "fonts");
    vi.restoreAllMocks();
  });

  it("captures only descendants of root, in document order", async () => {
    marker({ id: "outside" });
    const root = document.createElement("main");
    document.body.append(root);
    const first = marker({ id: "z-last-alphabetically", root });
    const section = document.createElement("section");
    root.append(section);
    const second = marker({ id: "a-first-alphabetically", root: section });
    expect(await captureVocabularyPreviews(root)).toEqual([
      { id: "z-last-alphabetically", image: IMAGE, width: 320, height: 120 },
      { id: "a-first-alphabetically", image: IMAGE, width: 320, height: 120 },
    ]);
    expect(vi.mocked(domToWebp).mock.calls).toEqual([
      [first, { width: 320, height: 120, scale: 1 }],
      [second, { width: 320, height: 120, scale: 1 }],
    ]);
  });

  it("rejects duplicate ids before rendering and names the duplicate", async () => {
    marker({ id: "box/header" });
    marker({ id: "box/header" });
    await expect(captureVocabularyPreviews(document)).rejects.toThrow('Duplicate vocabulary preview id "box/header"');
    expect(domToWebp).not.toHaveBeenCalled();
  });

  it("rejects an empty id and names it", async () => {
    marker({ id: "" });
    await expect(captureVocabularyPreviews(document)).rejects.toThrow('Empty vocabulary preview id ""');
    expect(domToWebp).not.toHaveBeenCalled();
  });

  it.each([{ width: 0, height: 120 }, { width: 320, height: 0 }])("rejects a zero-size marker: %o", async (size) => {
    marker({ id: "box/hidden", ...size });
    await expect(captureVocabularyPreviews(document)).rejects.toThrow('Vocabulary preview "box/hidden" has zero size');
    expect(domToWebp).not.toHaveBeenCalled();
  });

  it.each([
    { options: undefined, expectedWidth: 640, expectedHeight: 160, scale: 0.5 },
    { options: { maxWidth: 320 }, expectedWidth: 320, expectedHeight: 80, scale: 0.25 },
  ])("scales wide previews without changing their layout: %o", async ({ options, expectedWidth, expectedHeight, scale }) => {
    const element = marker({ id: "box/wide", width: 1280, height: 320 });
    expect(await captureVocabularyPreviews(document, options)).toEqual([
      { id: "box/wide", image: IMAGE, width: expectedWidth, height: expectedHeight },
    ]);
    expect(domToWebp).toHaveBeenCalledWith(element, { width: 1280, height: 320, scale });
  });

  it("waits for fonts and all images to decode before rendering", async () => {
    const element = marker({ id: "box/image" });
    const image = document.createElement("img");
    image.src = "https://example.test/specimen.webp";
    element.append(image);
    const fonts = Promise.withResolvers<FontFaceSet>();
    const decoded = Promise.withResolvers<void>();
    const otherDecoded = Promise.withResolvers<void>();
    const otherImage = document.createElement("img");
    otherImage.src = "https://example.test/other.webp";
    marker({ id: "box/other-image" }).append(otherImage);
    const decodeStarted: string[] = [];
    image.decode = () => { decodeStarted.push(image.src); return decoded.promise; };
    otherImage.decode = () => { decodeStarted.push(otherImage.src); return otherDecoded.promise; };
    Object.defineProperty(document, "fonts", { configurable: true, value: { ready: fonts.promise } });
    const captured = captureVocabularyPreviews(document);
    expect(domToWebp).not.toHaveBeenCalled();
    fonts.resolve(document.fonts);
    await Promise.resolve();
    expect(decodeStarted).toEqual([image.src, otherImage.src]);
    expect(domToWebp).not.toHaveBeenCalled();
    decoded.resolve();
    await Promise.resolve();
    expect(domToWebp).not.toHaveBeenCalled();
    otherDecoded.resolve();
    await expect(captured).resolves.toHaveLength(2);
    expect(domToWebp).toHaveBeenCalledTimes(2);
  });

  it("rejects a failed image decode and names its src", async () => {
    const element = marker({ id: "box/image" });
    const image = document.createElement("img");
    image.src = "https://example.test/broken.webp";
    image.decode = () => Promise.reject(new Error("Invalid image"));
    element.append(image);
    await expect(captureVocabularyPreviews(document)).rejects.toThrow(image.src);
    expect(domToWebp).not.toHaveBeenCalled();
  });

  it("propagates renderer failures", async () => {
    marker({ id: "box/error" });
    vi.mocked(domToWebp).mockRejectedValueOnce(new Error("Capture failed"));
    await expect(captureVocabularyPreviews(document)).rejects.toThrow("Capture failed");
  });

  it("rejects a renderer format fallback and names the marker", async () => {
    marker({ id: "box/unsupported" });
    vi.mocked(domToWebp).mockResolvedValueOnce("data:image/png;base64,c3BlY2ltZW4=");
    await expect(captureVocabularyPreviews(document)).rejects.toThrow('Vocabulary preview "box/unsupported" did not render as WebP');
  });

  it.each([0, -1, NaN, Infinity])("rejects invalid maxWidth %s", async (maxWidth) => {
    await expect(captureVocabularyPreviews(document, { maxWidth })).rejects.toThrow("maxWidth");
  });

  it("returns an empty list for a root with no markers", async () => {
    expect(await captureVocabularyPreviews(document)).toEqual([]);
    expect(domToWebp).not.toHaveBeenCalled();
  });
});
