import type { Meta, StoryObj } from "@storybook/react-vite";
import { Clicky } from "./Clicky";
import { clickyFixture } from "./Clicky.fixtures";

const meta: Meta<typeof Clicky> = {
  title: "Data/Clicky",
  component: Clicky,
  parameters: {
    docs: {
      description: {
        component:
          "Renderer for Clicky AST documents produced by the sibling clicky stack. It handles text, tables, trees, badges, code, stack traces, downloads, and command links from one JSON document.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Clicky>;

export const RichDocument: Story = {
  args: {
    data: clickyFixture,
  },
};

export const JsonStringPayload: Story = {
  args: {
    data: JSON.stringify(clickyFixture),
  },
};

export const WithDownloadControls: Story = {
  args: {
    data: clickyFixture,
    view: { pdf: false, json: true },
    download: { all: true, label: "report" },
  },
};

export const RemoteUrl: Story = {
  args: {
    url: "/samples/clicky/services.json",
    data: clickyFixture,
    view: [],
    download: { all: true, label: "artifact" },
  },
};
