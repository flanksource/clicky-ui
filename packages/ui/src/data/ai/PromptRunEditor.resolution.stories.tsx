import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { PromptRunEditor } from "./PromptRunEditor";
import type { AIPromptRunValue } from "./PromptRunEditor/model";

function ResolvedProfileStory() {
  const [value, setValue] = useState<AIPromptRunValue>({
    runtimeProfile: "review-profile",
    spec: {},
  });
  return (
    <div className="grid max-w-3xl gap-density-4 p-density-4">
      <PromptRunEditor
        value={value}
        onChange={setValue}
        models={[
          { id: "review-model", label: "Review model", provider: "anthropic", reasoning: true },
          { id: "operator-model", label: "Operator model", provider: "openai", reasoning: true },
        ]}
        families={[
          { id: "operator", label: "Operator family", provider: "openai", modes: [{ id: "cmux", label: "cmux" }] },
          { id: "review", label: "Review family", provider: "anthropic", modes: [{ id: "cmux", label: "cmux" }] },
        ]}
        profiles={[{ id: "review-profile", name: "Review profile", presets: ["review-preset"], spec: {} }]}
        presets={[{ id: "review-preset", name: "Review preset", spec: { model: "review-model", mode: "cmux" } }]}
        resolution={{ spec: { model: "review-model", mode: "cmux" }, constraints: {}, trace: [] }}
      />
      <pre aria-label="Request overrides" className="rounded-md border border-border bg-muted p-density-3 text-xs">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}

const meta = {
  title: "AI/PromptRunEditor/Resolved profile",
  component: PromptRunEditor,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof PromptRunEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InheritedRuntime: Story = {
  render: () => <ResolvedProfileStory />,
};
