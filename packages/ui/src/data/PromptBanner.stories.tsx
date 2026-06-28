import type { Decorator, Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useRef } from "react";
import { expect, userEvent, within } from "storybook/test";
import type { PromptSnapshot } from "../hooks/use-prompts";
import { PromptBanner } from "./PromptBanner";

const PROMPTS: PromptSnapshot[] = [
  {
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
        },
      },
      required: ["decision"],
    },
  },
  {
    id: "prompt-compatibility",
    kind: "approval",
    title: "Compatibility warning",
    description: "The commit removes exported functionality and needs a decision.",
    owner: "commit:compatibility",
    labels: { session: "storybook" },
    state: "pending",
    schema: {
      type: "object",
      properties: {
        choice: {
          type: "string",
          title: "Choose",
          enum: ["0", "1"],
          "x-enum-labels": {
            "0": "Continue commit",
            "1": "Cancel commit",
          },
          "x-enum-display": "radio",
        },
      },
      required: ["choice"],
    },
  },
  {
    id: "prompt-region",
    kind: "configuration",
    title: "Choose deployment region",
    description: "Pick the primary region for this release.",
    owner: "session:weekly-planning",
    labels: { session: "weekly-planning" },
    state: "pending",
    value: { region: "eu-west-1" },
    schema: {
      type: "object",
      properties: {
        region: {
          type: "string",
          title: "Region",
          enum: ["eu-west-1", "us-east-1", "ap-southeast-2"],
        },
      },
      required: ["region"],
    },
  },
  {
    id: "prompt-budget",
    kind: "approval",
    title: "Approve higher budget",
    description: "The requested instance shape exceeds the default budget.",
    owner: "session:weekly-planning",
    labels: { session: "weekly-planning" },
    state: "pending",
    value: { approve: true },
    schema: {
      type: "object",
      properties: {
        approve: {
          type: "boolean",
          title: "Approve budget increase",
        },
      },
      required: ["approve"],
    },
  },
  {
    id: "prompt-old",
    kind: "approval",
    title: "Cancelled prompt",
    owner: "deploy:payments-api",
    labels: { env: "prod" },
    state: "cancelled",
    cancelled: true,
    createdAt: "2026-06-28T04:50:00Z",
    resolvedAt: "2026-06-28T04:52:00Z",
    schema: {
      type: "object",
      properties: {
        ok: { type: "boolean", title: "Ok" },
      },
    },
  },
  {
    id: "prompt-answered",
    kind: "approval",
    title: "Approved dependency upgrade",
    owner: "session:weekly-planning",
    labels: { session: "weekly-planning" },
    state: "answered",
    value: { decision: "approve", reason: "Version check passed" },
    createdAt: "2026-06-28T05:02:00Z",
    resolvedAt: "2026-06-28T05:04:00Z",
    schema: {
      type: "object",
      properties: {
        decision: {
          type: "string",
          title: "Decision",
          enum: ["approve", "reject"],
          "x-enum-labels": { approve: "Approve", reject: "Reject" },
        },
        reason: { type: "string", title: "Reason" },
      },
      required: ["decision"],
    },
  },
];

function promptMatchesQuery(prompt: PromptSnapshot, query: URLSearchParams) {
  const owner = query.get("owner");
  if (owner && prompt.owner !== owner) return false;
  const kind = query.get("kind");
  if (kind && prompt.kind !== kind) return false;
  const state = query.get("state");
  if (state && prompt.state !== state) return false;

  for (const label of query.getAll("label")) {
    const equalsAt = label.indexOf("=");
    const key = equalsAt === -1 ? label : label.slice(0, equalsAt);
    const value = equalsAt === -1 ? "" : label.slice(equalsAt + 1);
    if (prompt.labels?.[key] !== value) return false;
  }

  return true;
}

class FakePromptEventSource {
  private listeners: Record<string, ((event: MessageEvent) => void)[]> = {};
  onerror: ((event: Event) => void) | null = null;

  constructor(url: string | URL) {
    setTimeout(() => {
      const query = new URL(String(url), "http://storybook.local").searchParams;
      this.emit(
        "prompts",
        PROMPTS.filter((prompt) => promptMatchesQuery(prompt, query)),
      );
    }, 0);
  }

  addEventListener(type: string, callback: (event: MessageEvent) => void) {
    (this.listeners[type] ??= []).push(callback);
  }

  close() {}

  private emit(type: string, data: unknown) {
    for (const callback of this.listeners[type] ?? []) {
      callback(new MessageEvent(type, { data: JSON.stringify(data) }));
    }
  }
}

const fakeAnswerFetch: typeof fetch = async (input) => {
  if (String(input).includes("/prompts/") && String(input).endsWith("/answer")) {
    return new Response("", { status: 204 });
  }
  return new Response("not found", { status: 404 });
};

const withFakePromptApi: Decorator = (Story) => {
  const originalEventSource = useRef<typeof globalThis.EventSource | undefined>(undefined);
  const originalFetch = useRef<typeof globalThis.fetch | undefined>(undefined);

  if (globalThis.EventSource !== (FakePromptEventSource as unknown as typeof EventSource)) {
    originalEventSource.current = globalThis.EventSource;
    globalThis.EventSource = FakePromptEventSource as unknown as typeof EventSource;
  }
  if (globalThis.fetch !== fakeAnswerFetch) {
    originalFetch.current = globalThis.fetch;
    globalThis.fetch = fakeAnswerFetch;
  }

  useEffect(
    () => () => {
      if (originalEventSource.current) globalThis.EventSource = originalEventSource.current;
      if (originalFetch.current) globalThis.fetch = originalFetch.current;
    },
    [],
  );

  return <Story />;
};

const meta = {
  title: "Data/PromptBanner",
  component: PromptBanner,
  decorators: [withFakePromptApi],
  tags: ["autodocs"],
  args: {
    basePath: "/api/todos",
    enabled: true,
    owner: "deploy:payments-api",
  },
  argTypes: {
    basePath: {
      control: "text",
      description: "Base path that exposes the prompt list, stream, and answer endpoints.",
      table: { category: "Transport" },
    },
    enabled: {
      control: "boolean",
      description: "Start or stop the prompt subscription.",
      table: { category: "State" },
    },
    owner: {
      control: "text",
      description: "Optional prompt owner scope.",
      table: { category: "Filter" },
    },
    kind: {
      control: "text",
      description: "Optional prompt kind scope.",
      table: { category: "Filter" },
    },
    labels: {
      control: "object",
      description: "Optional label filters sent as repeated `label=key=value` query params.",
      table: { category: "Filter" },
    },
    title: {
      control: "text",
      description: "Override the count-aware banner headline.",
      table: { category: "Content" },
    },
    inlineActions: {
      control: "inline-radio",
      options: ["auto", false],
      description: "Enable schema-detected approve/reject inline actions.",
      table: { category: "Behavior" },
    },
    showSummary: {
      control: "boolean",
      description: "Show compact prompt counts and recent prompt history.",
      table: { category: "Content" },
    },
    historyLimit: {
      control: { type: "number", min: 0, max: 10, step: 1 },
      description: "Maximum recent prompts shown in the summary list.",
      table: { category: "Content" },
    },
    className: {
      control: "text",
      description: "Classes for the banner container.",
      table: { category: "Layout" },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Inline pending-prompt affordance for task, session, or owner-scoped workflows. It subscribes to the prompt stream, shows the first pending prompt with schema-detected quick actions when possible, and includes compact prompt history.",
      },
    },
  },
} satisfies Meta<typeof PromptBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="max-w-xl">
      <PromptBanner {...args} />
    </div>
  ),
};

export const InlineSelectApproval: Story = {
  args: {
    owner: "commit:compatibility",
  },
  render: (args) => (
    <div className="max-w-xl">
      <PromptBanner {...args} />
    </div>
  ),
};

export const SummaryHistory: Story = {
  args: {
    owner: "session:weekly-planning",
    historyLimit: 4,
  },
  render: (args) => (
    <div className="max-w-xl">
      <PromptBanner {...args} />
    </div>
  ),
};

export const DialogFallback: Story = {
  args: {
    owner: "session:weekly-planning",
    kind: "configuration",
  },
  render: (args) => (
    <div className="max-w-xl">
      <PromptBanner {...args} />
    </div>
  ),
};

export const CustomHeadline: Story = {
  args: {
    owner: "session:weekly-planning",
    title: "Release planning is waiting for input",
  },
  render: (args) => (
    <div className="max-w-xl">
      <PromptBanner {...args} />
    </div>
  ),
};

export const OpensDialog: Story = {
  args: {
    owner: "session:weekly-planning",
    kind: "configuration",
  },
  render: (args) => (
    <div className="max-w-xl">
      <PromptBanner {...args} />
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const screen = within(canvasElement.ownerDocument.body);

    await step("open the prompt dialog from the banner", async () => {
      await userEvent.click(await screen.findByRole("button", { name: "Answer" }));
      await expect(screen.getByRole("dialog", { name: "Choose deployment region" })).toBeInTheDocument();
    });
  },
};
