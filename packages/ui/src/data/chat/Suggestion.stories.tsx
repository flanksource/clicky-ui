import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { Suggestions } from "./Suggestion";
import type { Suggestion } from "./types";

const SUGGESTIONS: Suggestion[] = [
  "What pods are running in default?",
  { label: "Recent errors", prompt: "Show errors from the last hour across all namespaces" },
  { label: "Restart a service", prompt: "Restart the payments-api deployment" },
];

const meta = {
  title: "Chat/Suggestions",
  component: Suggestions,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A wrap of suggested-prompt pills shown on the chat empty state. Each suggestion is a plain string or a `{ label, prompt }` pair; clicking a pill calls `onSelect` with its prompt text. Renders nothing when the list is empty.",
      },
    },
  },
  argTypes: { suggestions: { control: false } },
  args: { suggestions: SUGGESTIONS, onSelect: fn() },
} satisfies Meta<typeof Suggestions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="max-w-2xl">
      <Suggestions {...args} />
    </div>
  ),
};
