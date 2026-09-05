import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import type { FixtureFenceSchemas } from "../FixtureEditor";
import { PromptRunEditor } from "./PromptRunEditor";
import type { AIPromptRunValue } from "./PromptRunEditor/model";

const fixtureSchemas: FixtureFenceSchemas = {
  "yaml contract": {
    type: "object",
    properties: {
      policy: { type: "string", title: "Policy", description: "Policy checked by the runner." },
      retries: { type: "integer", title: "Retries", minimum: 0 },
    },
    required: ["policy"],
  },
};

function VerificationFixtureStory() {
  const [value, setValue] = useState<AIPromptRunValue>({
    spec: {
      model: "anthropic/claude-sonnet-4-6",
      mode: "api",
      workflow: {
        verify: {
          fixture: "# Verification\n\n```yaml contract\npolicy: smoke\nretries: 1\n```\n",
        },
      },
    },
  });
  return (
    <div className="max-w-3xl p-density-4">
      <PromptRunEditor
        value={value}
        onChange={setValue}
        specSections={["verify"]}
        fixtureSchemas={fixtureSchemas}
      />
      <pre aria-label="Saved verification fixture" className="mt-density-4 whitespace-pre-wrap text-sm">
        {value.spec?.workflow?.verify?.fixture}
      </pre>
    </div>
  );
}

const meta = {
  title: "AI/PromptRunEditor/Verification fixture",
  component: PromptRunEditor,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: "Pass runner-owned fixtureSchemas to the prompt run editor. Open Edit spec, then expand the contract fence to edit its schema fields. The schema map also populates Add fence and remains outside the serialized runtime spec.",
      },
    },
  },
} satisfies Meta<typeof PromptRunEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const HostSchemas: Story = {
  render: () => <VerificationFixtureStory />,
};
