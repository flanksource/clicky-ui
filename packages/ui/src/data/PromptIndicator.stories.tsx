import type { Decorator, Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useRef } from "react";
import { expect, userEvent, within } from "storybook/test";
import type { PromptSnapshot } from "../hooks/use-prompts";
import { PromptIndicator } from "./PromptIndicator";

const regionSchema: PromptSnapshot["schema"] = {
  type: "object",
  properties: { region: { type: "string", title: "Region", enum: ["eu-west-1", "us-east-1", "ap-southeast-2"] } },
  required: ["region"],
};

const PROMPTS: PromptSnapshot[] = [
  {
    id: "prompt-target",
    kind: "form",
    title: "Pick the purge target",
    description: "Choose the database connection the purge runs against.",
    owner: "run:purge",
    state: "pending",
    schema: regionSchema,
  },
  {
    id: "prompt-reviewed",
    kind: "form",
    title: "Confirm the reviewed count",
    owner: "run:purge",
    state: "pending",
    value: { reviewed: 3 },
    schema: { type: "object", properties: { reviewed: { type: "integer", title: "Reviewed staged activities" } } },
  },
  {
    id: "prompt-answered",
    kind: "form",
    title: "Choose deployment region",
    owner: "run:purge",
    state: "answered",
    value: { region: "eu-west-1" },
    schema: regionSchema,
  },
  {
    id: "prompt-cancelled",
    kind: "form",
    title: "Reload mode",
    owner: "run:purge",
    state: "cancelled",
    cancelled: true,
    schema: { type: "object", properties: { reload: { type: "boolean", title: "Reload" } } },
  },
  {
    id: "prompt-quiet",
    kind: "form",
    title: "Earlier region",
    owner: "run:quiet",
    state: "answered",
    value: { region: "us-east-1" },
    schema: regionSchema,
  },
];

class FakePromptEventSource {
  private listeners: Record<string, ((event: MessageEvent) => void)[]> = {};
  onerror: ((event: Event) => void) | null = null;

  constructor(url: string | URL) {
    const owner = new URL(String(url), "http://storybook.local").searchParams.get("owner");
    setTimeout(() => this.emit(PROMPTS.filter((prompt) => !owner || prompt.owner === owner)), 0);
  }

  addEventListener(type: string, callback: (event: MessageEvent) => void) {
    (this.listeners[type] ??= []).push(callback);
  }

  close() {}

  private emit(prompts: PromptSnapshot[]) {
    for (const callback of this.listeners.prompts ?? []) callback(new MessageEvent("prompts", { data: JSON.stringify(prompts) }));
  }
}

const fakeAnswerFetch: typeof fetch = async (input) =>
  String(input).endsWith("/answer") ? new Response("", { status: 204 }) : new Response("not found", { status: 404 });

const withFakePromptApi: Decorator = (Story) => {
  const original = useRef<{ eventSource: typeof EventSource; fetch: typeof fetch } | null>(null);
  if (!original.current) {
    original.current = { eventSource: globalThis.EventSource, fetch: globalThis.fetch };
    globalThis.EventSource = FakePromptEventSource as unknown as typeof EventSource;
    globalThis.fetch = fakeAnswerFetch;
  }
  useEffect(
    () => () => {
      if (!original.current) return;
      globalThis.EventSource = original.current.eventSource;
      globalThis.fetch = original.current.fetch;
    },
    [],
  );
  return <Story />;
};

const meta = {
  title: "Data/PromptIndicator",
  component: PromptIndicator,
  decorators: [withFakePromptApi],
  tags: ["autodocs"],
  args: { basePath: "/api/todos", owner: "run:purge" },
  argTypes: {
    basePath: { control: "text", description: "Base path that exposes the prompt list, stream, and answer endpoints." },
    owner: { control: "text", description: "Prompt owner scope, e.g. a run's prompt owner." },
    autoOpen: { control: "boolean", description: "Open each newly pending prompt's dialog once, without a click." },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Compact header status for a scope's prompts: an amber, pulsing \"N pending\" while prompts wait, a muted \"Prompts\" otherwise. Clicking it opens a panel listing the prompts (pending first, then answered and closed); a pending one opens the answer dialog.",
      },
    },
  },
  render: (args) => (
    <div className="flex justify-end border-b border-border bg-card px-4 py-2">
      <PromptIndicator {...args} />
    </div>
  ),
} satisfies Meta<typeof PromptIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Pending: Story = {};

export const NothingPending: Story = { args: { owner: "run:quiet" } };

export const OpensPromptFromPanel: Story = {
  play: async ({ canvasElement, step }) => {
    const screen = within(canvasElement.ownerDocument.body);
    await step("open the panel from the indicator", async () => {
      await userEvent.click(await screen.findByRole("button", { name: "2 pending" }));
      await expect(screen.getByRole("dialog", { name: "Prompts" })).toBeInTheDocument();
    });
    await step("answer a pending prompt", async () => {
      await userEvent.click(screen.getByRole("button", { name: /Pick the purge target/ }));
      await expect(await screen.findByRole("dialog", { name: "Pick the purge target" })).toBeInTheDocument();
    });
  },
};

export const AutoOpen: Story = { args: { autoOpen: true } };
