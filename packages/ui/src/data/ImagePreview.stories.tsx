import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { ImagePreview } from "./ImagePreview";

const TRANSPARENT_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180"><circle cx="90" cy="90" r="70" fill="#2563eb" fill-opacity=".8"/><circle cx="170" cy="90" r="70" fill="#dc2626" fill-opacity=".6"/></svg>',
)}`;

const meta: Meta<typeof ImagePreview> = {
  title: "Data/ImagePreview",
  component: ImagePreview,
  parameters: {
    docs: {
      description: {
        component:
          "An image centered on a checkerboard so transparency shows, scaled to fit its pane. Click the image to toggle its actual size. A URL that fails to load shows an alert naming the image instead of a broken icon.",
      },
    },
  },
  decorators: [(Story) => <div style={{ height: 320 }}><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof ImagePreview>;

export const Transparent: Story = {
  args: { src: TRANSPARENT_SVG, alt: "Overlapping circles" },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("img", { name: "Overlapping circles" })).toBeVisible();
  },
};

export const LoadError: Story = {
  args: { src: "/missing/diagram.png", alt: "diagram.png" },
  play: async ({ canvasElement }) => {
    await expect(await within(canvasElement).findByRole("alert")).toHaveTextContent("Could not load diagram.png");
  },
};
