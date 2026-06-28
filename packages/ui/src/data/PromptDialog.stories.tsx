import type { Decorator, Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useRef, useState } from "react";
import { fn } from "storybook/test";
import type { PromptSnapshot } from "../hooks/use-prompts";
import { PromptDialog, type PromptDialogProps } from "./PromptDialog";

const APPROVAL_PROMPT: PromptSnapshot = {
  id: "prompt-prod-deploy",
  kind: "approval",
  title: "Approve production deploy",
  description: "The deployment has passed checks and is waiting for a human decision.",
  owner: "deploy:payments-api",
  labels: { env: "prod", session: "storybook" },
  state: "pending",
  value: { decision: "approve", reason: "Change window is open" },
  schema: {
    type: "object",
    properties: {
      decision: {
        type: "string",
        title: "Decision",
        enum: ["approve", "reject"],
        "x-enum-display": "radio",
        "x-enum-labels": {
          approve: "Approve",
          reject: "Reject",
        },
      },
      reason: {
        type: "string",
        title: "Reason",
        description: "Shown in the audit log.",
      },
      duration: {
        type: "integer",
        title: "Approval window",
        description: "Minutes before this approval expires.",
        minimum: 5,
        maximum: 120,
      },
    },
    required: ["decision", "reason"],
  },
};

const CONFIG_PROMPT: PromptSnapshot = {
  id: "prompt-runtime-config",
  kind: "configuration",
  title: "Choose runtime options",
  description: "Provide the remaining values before the task can continue.",
  owner: "session:release-42",
  labels: { session: "release-42" },
  state: "pending",
  value: { region: "eu-west-1", replicas: 3, dryRun: true },
  schema: {
    type: "object",
    properties: {
      region: {
        type: "string",
        title: "Region",
        enum: ["eu-west-1", "us-east-1", "ap-southeast-2"],
      },
      replicas: {
        type: "integer",
        title: "Replicas",
        minimum: 1,
        maximum: 12,
      },
      dryRun: {
        type: "boolean",
        title: "Dry run first",
      },
    },
    required: ["region", "replicas"],
  },
};

const fakeAnswerFetch: typeof fetch = async (input) => {
  if (String(input).includes("/prompts/") && String(input).endsWith("/answer")) {
    return new Response("", { status: 204 });
  }
  return new Response("not found", { status: 404 });
};

const withFakePromptApi: Decorator = (Story) => {
  const original = useRef<typeof globalThis.fetch | undefined>(undefined);
  if (globalThis.fetch !== fakeAnswerFetch) {
    original.current = globalThis.fetch;
    globalThis.fetch = fakeAnswerFetch;
  }

  useEffect(
    () => () => {
      if (original.current) globalThis.fetch = original.current;
    },
    [],
  );

  return <Story />;
};

function PromptDialogPreview(args: PromptDialogProps) {
  const [open, setOpen] = useState(args.open);
  useEffect(() => setOpen(args.open), [args.open]);

  return (
    <>
      <button
        className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground"
        onClick={() => setOpen(true)}
      >
        Open prompt
      </button>
      <PromptDialog
        {...args}
        open={open}
        onClose={() => {
          setOpen(false);
          args.onClose();
        }}
      />
    </>
  );
}

const meta = {
  title: "Data/PromptDialog",
  component: PromptDialog,
  decorators: [withFakePromptApi],
  tags: ["autodocs"],
  args: {
    prompt: APPROVAL_PROMPT,
    basePath: "/api/todos",
    open: true,
    onClose: fn(),
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
    open: {
      control: "boolean",
      description: "Controls whether the answer modal is mounted.",
      table: { category: "State" },
    },
    onClose: { control: false, table: { category: "Events" } },
    onResolved: { control: false, table: { category: "Events" } },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Human answer dialog for pending prompt-manager requests. It renders the prompt schema with `JsonSchemaForm` inside `Modal` and posts either an answer payload or cancellation to the prompt API.",
      },
    },
  },
} satisfies Meta<typeof PromptDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Approval: Story = {
  render: (args) => <PromptDialogPreview {...args} />,
};

export const Configuration: Story = {
  args: {
    prompt: CONFIG_PROMPT,
    open: false,
  },
  render: (args) => <PromptDialogPreview {...args} />,
};
