import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "../components/button";
import { regionAnchor } from "./anchoring/region-anchor";
import type { RegionAnchor } from "./annotation-types";
import { RegionOverlay, type RegionOverlayItem } from "./RegionOverlay";

const meta = {
  title: "Comments/RegionOverlay",
  component: RegionOverlay,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
} satisfies Meta<typeof RegionOverlay>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A self-contained 400x240 mock of a checkout screen, so the story needs no hosted image. */
const SCREENSHOT = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="240" viewBox="0 0 400 240">
    <rect width="400" height="240" fill="#f4f4f5"/>
    <rect x="24" y="24" width="352" height="32" rx="6" fill="#e4e4e7"/>
    <rect x="24" y="76" width="220" height="100" rx="6" fill="#ffffff" stroke="#d4d4d8"/>
    <rect x="264" y="76" width="112" height="100" rx="6" fill="#ffffff" stroke="#d4d4d8"/>
    <rect x="264" y="196" width="112" height="28" rx="6" fill="#2563eb"/>
  </svg>`,
)}`;

const image = <img src={SCREENSHOT} alt="Checkout screen" width={400} height={240} className="block max-w-full" />;

const EXISTING: RegionOverlayItem[] = [
  { id: "total", region: { x: 0.66, y: 0.317, w: 0.28, h: 0.417 }, label: "Order total" },
  { id: "pay", region: { x: 0.66, y: 0.817, w: 0.28, h: 0.117 }, label: "Pay button" },
];

/** Regions already commented on, placed by fractions of the image. */
export const ExistingRegions: Story = {
  args: { regions: EXISTING, activeId: "pay", children: image },
};

function Drawing() {
  const [regions, setRegions] = useState<RegionOverlayItem[]>(EXISTING);
  const [drawing, setDrawing] = useState(true);
  const [last, setLast] = useState<RegionAnchor | null>(null);
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button size="sm" variant={drawing ? "secondary" : "outline"} aria-pressed={drawing} onClick={() => setDrawing(!drawing)}>
          {drawing ? "Drawing: drag over the image" : "Draw a region"}
        </Button>
        <span className="text-xs text-muted-foreground">{last ? regionAnchor(last) : "No region drawn yet"}</span>
      </div>
      <RegionOverlay
        regions={regions}
        drawing={drawing}
        onDraw={(region) => {
          setLast(region);
          setRegions((current) => [...current, { id: `region-${current.length + 1}`, region, label: `Region ${current.length + 1}` }]);
        }}
      >
        {image}
      </RegionOverlay>
    </div>
  );
}

/** Drag over the image to draw a region; each one is reported as a normalized x, y, w, h. */
export const DrawARegion: Story = {
  args: { regions: [], children: image },
  render: () => <Drawing />,
};
