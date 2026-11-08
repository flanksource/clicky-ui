import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { VocabularyPreview } from "./VocabularyPreview";
import { captureVocabularyPreviews } from "./vocabulary-capture";

const meta = {
  title: "Comments/Vocabulary preview",
  component: VocabularyPreview,
  tags: ["browser"],
} satisfies Meta<typeof VocabularyPreview>;
export default meta;

export const Capture: StoryObj<typeof meta> = {
  render: () => <div className="space-y-4 p-4">
    <VocabularyPreview id="box/compact"><div className="h-20 w-40 rounded border border-border bg-muted p-4">Compact specimen</div></VocabularyPreview>
    <VocabularyPreview id="box/wide"><div className="h-40 w-[960px] rounded border border-primary bg-primary/10 p-4">Wide specimen</div></VocabularyPreview>
  </div>,
  play: async ({ canvasElement }) => {
    const maxWidth = 240;
    const images = await captureVocabularyPreviews(canvasElement, { maxWidth });
    await expect(images.map(({ id }) => id)).toEqual(["box/compact", "box/wide"]);
    for (const preview of images) {
      await expect(preview.image).toMatch(/^data:image\/webp;base64,/);
      const image = new Image();
      image.src = preview.image;
      await image.decode();
      await expect(image.naturalWidth).toBeLessThanOrEqual(maxWidth);
      await expect([image.naturalWidth, image.naturalHeight]).toEqual([preview.width, preview.height]);
      const marker = canvasElement.querySelector(`[data-vocabulary-preview="${preview.id}"]`)!;
      const bounds = marker.getBoundingClientRect();
      await expect(Math.abs(image.naturalHeight - image.naturalWidth * bounds.height / bounds.width)).toBeLessThanOrEqual(1);
    }
    await expect(images[1]?.width).toBe(maxWidth);
  },
};
