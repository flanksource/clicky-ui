import { domToWebp } from "modern-screenshot";
import { VOCABULARY_PREVIEW_ATTRIBUTE } from "./comment-vocabulary";

export type VocabularyPreviewImage = { id: string; image: string; width: number; height: number };

export async function captureVocabularyPreviews(
  root: ParentNode,
  { maxWidth = 640 }: { maxWidth?: number } = {},
): Promise<VocabularyPreviewImage[]> {
  if (!Number.isFinite(maxWidth) || maxWidth <= 0) throw new Error(`Invalid vocabulary preview maxWidth: ${maxWidth}`);
  const ids = new Set<string>();
  const markers = [...root.querySelectorAll(`[${VOCABULARY_PREVIEW_ATTRIBUTE}]`)].map(element => {
    const id = element.getAttribute(VOCABULARY_PREVIEW_ATTRIBUTE)!;
    if (!id) throw new Error(`Empty vocabulary preview id "${id}"`);
    if (ids.has(id)) throw new Error(`Duplicate vocabulary preview id "${id}"`);
    ids.add(id);
    return { id, element };
  });
  await document.fonts.ready;
  await Promise.all(markers.flatMap(({ element }) => [...element.querySelectorAll("img")].map(async image => {
    try {
      await image.decode();
    } catch (cause) {
      throw new Error(`Failed to decode vocabulary preview image "${image.currentSrc || image.src}"`, { cause });
    }
  })));
  const images: VocabularyPreviewImage[] = [];
  for (const { id, element } of markers) {
    const { width, height } = element.getBoundingClientRect();
    if (width === 0 || height === 0) throw new Error(`Vocabulary preview "${id}" has zero size`);
    const scale = Math.min(1, maxWidth / width);
    const image = await domToWebp(element, { width, height, scale });
    if (!image.startsWith("data:image/webp;base64,")) throw new Error(`Vocabulary preview "${id}" did not render as WebP`);
    images.push({ id, image, width: Math.floor(width * scale), height: Math.floor(height * scale) });
  }
  return images;
}
