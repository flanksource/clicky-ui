import type { Meta, StoryObj } from "@storybook/react-vite";
import { ErrorWrapper } from "./ErrorWrapper";

const STORY_ERROR = new Error("The dashboard request failed with HTTP 502", {
  cause: "upstream service unavailable",
});
STORY_ERROR.stack = [
  "Error: The dashboard request failed with HTTP 502",
  "    at loadDashboard (src/pages/Dashboard.tsx:84:15)",
  "    at Dashboard (src/pages/Dashboard.tsx:27:3)",
].join("\n");

function BrokenDashboard(): never {
  throw STORY_ERROR;
}

const meta = {
  title: "Components/ErrorWrapper",
  component: ErrorWrapper,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Full-page React error boundary with normalized diagnostics and a support-ready copy action.",
      },
    },
  },
  argTypes: {
    children: { control: false },
    onError: { control: false },
  },
} satisfies Meta<typeof ErrorWrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <ErrorWrapper>
      <BrokenDashboard />
    </ErrorWrapper>
  ),
};
