import type { Decorator, Meta, StoryObj } from "@storybook/react-vite";
import { useEffect } from "react";
import { fn } from "storybook/test";
import type { PromptSnapshot } from "../hooks/use-prompts";
import { PromptForm } from "./PromptForm";

const PURGE_PROMPT: PromptSnapshot = {
  id: "prompt-purge-staged",
  kind: "form",
  title: "Purge staged activities?",
  description: "Review the staged GUIDs in the step's response before purging them.",
  owner: "run:storybook",
  labels: { node: "purge" },
  state: "pending",
  value: { expectedActivities: 4, reload: false },
  schema: {
    type: "object",
    properties: {
      expectedActivities: {
        type: "integer",
        title: "Reviewed staged count",
        description: "The purge refuses to run when the staged count differs.",
        minimum: 0,
      },
      reload: { type: "boolean", title: "Reload mode" },
    },
    required: ["expectedActivities"],
  },
};

const fakeAnswerFetch: typeof fetch = async (input) => {
  if (String(input).includes("/prompts/") && String(input).endsWith("/answer")) {
    return new Response(null, { status: 204 });
  }
  return new Response("not found", { status: 404 });
};

const refusingAnswerFetch: typeof fetch = async () =>
  new Response("prompt prompt-purge-staged is already answered", { status: 409 });

function withPromptApi(stub: typeof fetch): Decorator {
  // PromptForm only fetches on Submit/Cancel, so installing the stub after mount is early enough.
  return function PromptApi(Story) {
    useEffect(() => {
      const original = globalThis.fetch;
      globalThis.fetch = stub;
      return () => {
        globalThis.fetch = original;
      };
    }, []);
    return <Story />;
  };
}

const meta = {
  title: "Data/PromptForm",
  component: PromptForm,
  decorators: [
    (Story) => (
      <div className="max-w-xl rounded-md border border-border p-density-4">
        <Story />
      </div>
    ),
  ],
  tags: ["autodocs"],
  args: {
    prompt: PURGE_PROMPT,
    basePath: "/api",
    onResolved: fn(),
  },
  argTypes: {
    prompt: {
      control: "object",
      description: "Pending prompt snapshot. The JSON Schema drives the rendered answer form.",
      table: { category: "Data" },
    },
    basePath: {
      control: "text",
      description: "Base path that exposes `/prompts/:id/answer`.",
      table: { category: "Transport" },
    },
    onResolved: { control: false, table: { category: "Events" } },
    frame: { control: false, table: { category: "Layout" } },
  },
  parameters: {
    docs: {
      description: {
        component:
          "The answer form of a pending prompt, inline: the prompt's title and description, its schema through `JsonSchemaForm`, and Submit/Cancel, which post the values or a cancellation to the prompt API. `PromptDialog` is this form inside a `Modal`; a `frame` lays the parts out for another container.",
      },
    },
  },
} satisfies Meta<typeof PromptForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Inline: Story = {
  decorators: [withPromptApi(fakeAnswerFetch)],
};

export const RefusedAnswer: Story = {
  decorators: [withPromptApi(refusingAnswerFetch)],
  parameters: {
    docs: { description: { story: "Submit against a prompt the server has already resolved: the refusal shows beside the actions and the form stays answerable." } },
  },
};
