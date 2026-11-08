import { captureVocabularyPreviews } from "@flanksource/clicky-ui/comments";
import type { FrameMessage } from "../../schema.ts";

type VocabularyReply = Extract<FrameMessage, { type: "vocabulary-previews" | "error" }>;

export async function captureVocabulary(options: { ready: boolean; page: string }): Promise<VocabularyReply> {
  try {
    if (!options.ready) throw new Error("page is not ready for vocabulary capture");
    return { type: "vocabulary-previews", images: await captureVocabularyPreviews(document) };
  } catch (error) {
    return { type: "error", error: { phase: "render", message: error instanceof Error ? error.message : String(error), file: options.page } };
  }
}
