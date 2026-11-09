import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { ViolationLocations } from "./ViolationLocations";
import type { EntityHref, ViolationLocation } from "./types";

// A stand-in screenshot: a 480×240 table whose second row is the flagged region.
const SCREENSHOT = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="240" viewBox="0 0 480 240">
    <rect width="480" height="240" fill="#f4f4f5"/>
    <rect x="0" y="0" width="480" height="40" fill="#d4d4d8"/>
    <text x="16" y="26" font-family="sans-serif" font-size="14">Policy · Activity · Status</text>
    <rect x="0" y="80" width="480" height="40" fill="#fecaca"/>
    <text x="16" y="106" font-family="sans-serif" font-size="14">P-1001 · Billing · 02 Pending</text>
    <text x="16" y="66" font-family="sans-serif" font-size="14">P-1000 · Billing · 01 Active</text>
    <text x="16" y="146" font-family="sans-serif" font-size="14">P-1002 · Billing · 01 Active</text>
  </svg>`,
)}`;

const WORK_DIR = "/repo/rules";

const fileAtRef: ViolationLocation = {
  ref: "main",
  file: `${WORK_DIR}/pc/ACME/tr/Billing/data.xml`,
  line: 12,
  column: 3,
  message: "the transaction's PlanGUID",
};

const policy: ViolationLocation = {
  entity: { kind: "Policy", id: "7f3a2c10-5b0a-4c53-9a73-0c9d3f5e8b11", name: "P-1001" },
  message: "spawned InvoiceStart 3 times",
};

const transaction: ViolationLocation = {
  entity: { kind: "AsTransaction", id: "c8d73550-1111-4c53-9a73-0c9d3f5e8b11" },
};

const page: ViolationLocation = {
  url: { url: "https://oipa.example.com/entity/policy/7f3a2c10", css: ".row[data-activity='a1']" },
  message: "the pending activity row",
};

const screenshot: ViolationLocation = {
  image: { src: SCREENSHOT, x: 0, y: 80, width: 480, height: 40 },
  message: "the row as captured",
};

const policyHref: EntityHref = (entity) =>
  entity.kind === "Policy" ? `#/entity/policy/${entity.id}` : undefined;

const meta = {
  title: "Data/Lint/ViolationLocations",
  component: ViolationLocations,
  parameters: {
    docs: {
      description: {
        component:
          "Every place a lint violation applies, the first one primary. A location renders by its target: a file (with the git ref it was read at) opens through the host's `onOpenFile`; an entity is a `Kind · name` chip the host can link through `entityHref`; a URL is an external link with its selector beside it; an image region is a cropped preview of that rectangle linking to the full image.",
      },
    },
  },
  args: { workDir: WORK_DIR, locations: [fileAtRef] },
} satisfies Meta<typeof ViolationLocations>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A file read at a git ref: the ref is a muted prefix before `path:line:column`. */
export const FileAtRef: Story = {
  args: { locations: [fileAtRef], onOpenFile: () => undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("main")).toBeInTheDocument();
    await expect(canvas.getByText("pc/ACME/tr/Billing/data.xml:12:3")).toBeInTheDocument();
  },
};

/** The host links Policy entities; the AsTransaction stays a plain chip. */
export const Entities: Story = {
  args: { locations: [policy, transaction], entityHref: policyHref },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("link", { name: /Policy · P-1001/ })).toHaveAttribute(
      "href",
      "#/entity/policy/7f3a2c10-5b0a-4c53-9a73-0c9d3f5e8b11",
    );
    await expect(canvas.queryByRole("link", { name: /AsTransaction/ })).toBeNull();
  },
};

/** One URL per selector strategy; the strategy and value are shown beside the link. */
export const UrlSelectors: Story = {
  args: {
    locations: [
      page,
      { url: { url: "https://oipa.example.com/activity/a1", xpath: "//tr[@data-id='a1']" } },
      { url: { url: "https://oipa.example.com/activity/a1", testId: "activity-status" } },
      { url: { url: "https://oipa.example.com/activity/a1", role: "button", name: "Process" } },
      { url: { url: "https://oipa.example.com/activity/a1", text: "02 Pending" } },
      { url: { url: "https://oipa.example.com/" } },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("css: .row[data-activity='a1']")).toBeInTheDocument();
    await expect(canvas.getByText('role: button[name="Process"]')).toBeInTheDocument();
  },
};

/** A 480×40 region of a screenshot, previewed cropped and linking to the full image. */
export const ImageRegion: Story = {
  args: { locations: [screenshot] },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("0,80 480×40")).toBeInTheDocument();
  },
};

/** Every kind of target in one list, the file first and therefore primary. */
export const Mixed: Story = {
  args: {
    locations: [fileAtRef, policy, page, screenshot, { file: `${WORK_DIR}/pc/ACME/tr/Billing/XMLData.xml`, line: 40 }],
    entityHref: policyHref,
    onOpenFile: () => undefined,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("5 locations")).toBeInTheDocument();
    const rows = canvas.getAllByTestId("lint-violation-location");
    await expect(rows[0]).toHaveAttribute("data-primary");
    await expect(rows[1]).not.toHaveAttribute("data-primary");
  },
};
