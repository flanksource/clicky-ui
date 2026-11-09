// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { captureVocabularyPreviews } from "@flanksource/clicky-ui/comments";
import { captureVocabulary } from "./vocabulary.ts";

vi.mock("@flanksource/clicky-ui/comments", () => ({ captureVocabularyPreviews: vi.fn() }));

const page = "vocabularies/shapes.tsx";
const images = [
  { id: "circle", image: "data:image/webp;base64,Y2lyY2xl", width: 120, height: 120 },
  { id: "square", image: "data:image/webp;base64,c3F1YXJl", width: 80, height: 80 },
];

beforeEach(() => { vi.resetAllMocks(); });

describe("page agent vocabulary capture", () => {
  it("refuses capture before readiness without invoking the capture function", async () => {
    expect(await captureVocabulary({ ready: false, page })).toEqual({
      type: "error", error: { phase: "render", message: "page is not ready for vocabulary capture", file: page },
    });
    expect(captureVocabularyPreviews).not.toHaveBeenCalled();
  });

  it("captures the document through the shared function and returns its images", async () => {
    vi.mocked(captureVocabularyPreviews).mockResolvedValue(images);
    expect(await captureVocabulary({ ready: true, page })).toEqual({ type: "vocabulary-previews", images });
    expect(captureVocabularyPreviews).toHaveBeenCalledExactlyOnceWith(document);
  });

  it.each([new Error("duplicate vocabulary id circle"), "image decode failed: broken.webp"])("returns a render error with the capture failure message %s", async (error) => {
    vi.mocked(captureVocabularyPreviews).mockRejectedValue(error);
    expect(await captureVocabulary({ ready: true, page })).toEqual({
      type: "error", error: { phase: "render", message: error instanceof Error ? error.message : error, file: page },
    });
  });
});
