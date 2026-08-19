import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Callout } from "./Callout";
import { CALLOUT_TONES } from "./callout-tones";

const meta: Meta<typeof Callout> = {
  title: "Data/Callout",
  component: Callout,
  args: {
    variant: "note",
    children: "Access reviews run twice a year, in January and July.",
  },
  parameters: {
    docs: {
      description: {
        component:
          "An emphasised aside. The five named tones mirror GitHub's alert types, so a document can use `<CalloutBox variant=\"caution\">` in MDX and `> [!CAUTION]` in plain markdown and get the same box either way. `Markdown` renders authored `<CalloutBox>` tags through this component when `callouts` is set, and `MdxEditorField` edits them in place when `callouts` is enabled.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Callout>;

export const Tones: Story = {
  render: () => (
    <div>
      {CALLOUT_TONES.map((tone) => (
        <Callout key={tone} variant={tone}>
          {`A ${tone} callout, labelled with its own tone name.`}
        </Callout>
      ))}
      <Callout>An untinted default callout draws no header row at all.</Callout>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Caution")).toBeInTheDocument();
  },
};

/** The annotation style the policy corpus uses: identifier, label and attribution on one row. */
export const Annotation: Story = {
  args: {
    variant: "caution",
    badge: "BCR-08",
    label: "Gap",
    source: "Policy Owner",
    children: "Recovery time objectives are stated but not yet evidenced by a test.",
  },
};

/** A blocking callout takes the full border instead of the left rule. */
export const Emphasis: Story = {
  args: {
    variant: "warning",
    emphasis: true,
    label: "TO BE AUTHORED",
    children: "This section has no approved text yet and must not be published.",
  },
};

/** The glyph is named independently of the tone, for an amber note that reads as a question. */
export const IconOverride: Story = {
  args: {
    variant: "warning",
    icon: "important",
    label: "TODO",
    children: "Run the first tabletop exercise and retain the record.",
  },
};

export const WithTitle: Story = {
  args: {
    variant: "tip",
    title: "Rotate before the deadline",
    children: "Keys rotate on a 90-day cycle; the register tracks the next due date.",
  },
};
