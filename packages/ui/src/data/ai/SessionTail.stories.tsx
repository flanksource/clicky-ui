import { useEffect, useRef } from "react";
import type { Decorator, Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor, within } from "storybook/test";
import { EventSourceProvider } from "../../hooks/event-source-provider";
import type { EventSourceLike } from "../../hooks/event-source";
import { SessionTail } from "./SessionTail";
import type { SessionUIMessage, UnifiedSessionInput } from "./SessionViewer.unified";

const text = (id: string, body: string): SessionUIMessage => ({
  id,
  role: "assistant",
  parts: [{ type: "text", text: body }],
  provenance: { sessionId: "tail", cwd: "/work/repo" },
});

const tool = (id: string, toolName: string, input: Record<string, unknown>): SessionUIMessage => ({
  id,
  role: "assistant",
  parts: [{ type: "dynamic-tool", toolName, toolCallId: `${id}-call`, input }],
  provenance: { sessionId: "tail", cwd: "/work/repo" },
});

const session = (messages: SessionUIMessage[]): UnifiedSessionInput => ({
  id: "tail",
  provider: "anthropic",
  model: "claude-sonnet-5",
  revision: 1,
  lifecycleStatus: "running",
  messages,
});

const LONG_TEXT =
  "I traced the flaky retry to the backoff timer in the scheduler: the timer is re-armed on every heartbeat, so a slow heartbeat starves the retry and the task is reported as stalled even though it is still making progress.";

const SESSIONS: Record<string, UnifiedSessionInput> = {
  "/stories/captain/sessions/tool": session([
    text("m1", "Checking the scheduler"),
    tool("m2", "Read", { file_path: "/work/repo/pkg/scheduler/backoff.go" }),
  ]),
  "/stories/captain/sessions/bash": session([
    text("m1", "Running the focused tests"),
    tool("m2", "Bash", { command: "go test ./pkg/scheduler/... -run TestBackoff -count=1" }),
  ]),
  "/stories/captain/sessions/text": session([
    tool("m1", "Grep", { pattern: "rearm", path: "pkg" }),
    text("m2", LONG_TEXT),
  ]),
  "/stories/captain/sessions/empty": session([]),
};

// Serves the session for `${src}?tail=N`; the follow stream never emits.
const sessionFetch: typeof fetch = async (input) => {
  const src = String(input).split("?")[0] ?? "";
  const body = SESSIONS[src];
  return new Response(JSON.stringify(body ?? { error: `session ${src} not found` }), {
    status: body ? 200 : 404,
    headers: { "Content-Type": "application/json" },
  });
};

const silentStream = (url: string): EventSourceLike => ({
  url,
  readyState: 1,
  onopen: null,
  onmessage: null,
  onerror: null,
  addEventListener: () => undefined,
  removeEventListener: () => undefined,
  close: () => undefined,
});

const withStaticSessions: Decorator = (Story) => {
  const original = useRef<typeof globalThis.fetch | undefined>(undefined);
  if (globalThis.fetch !== sessionFetch) {
    original.current = globalThis.fetch;
    globalThis.fetch = sessionFetch;
  }
  useEffect(
    () => () => {
      if (original.current) globalThis.fetch = original.current;
    },
    [],
  );
  return (
    <EventSourceProvider value={silentStream}>
      <div className="w-96 max-w-full rounded-md border border-border p-density-2">
        <Story />
      </div>
    </EventSourceProvider>
  );
};

const meta = {
  title: "AI/SessionTail",
  component: SessionTail,
  tags: ["autodocs"],
  decorators: [withStaticSessions],
  parameters: {
    docs: {
      description: {
        component:
          "A one-line view of a live captain session: only the newest assistant text or tool call (icon, tool name and input summary), with a spinner while following. Full text is in the hover title. Loads and follows `src` through the same remote-session hook as `SessionInspector`.",
      },
    },
  },
  argTypes: {
    src: { control: "text" },
    follow: { control: "boolean" },
    emptyLabel: { control: "text" },
    className: { table: { disable: true } },
  },
} satisfies Meta<typeof SessionTail>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LatestToolCall: Story = {
  args: { src: "/stories/captain/sessions/tool" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByTestId("session-tail-tool")).toHaveTextContent("Read"));
    await expect(canvas.getByRole("status", { name: "Following session" })).toBeInTheDocument();
  },
};

export const LatestBashCommand: Story = {
  args: { src: "/stories/captain/sessions/bash" },
};

export const LatestTextClamped: Story = {
  args: { src: "/stories/captain/sessions/text" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() =>
      expect(canvas.getByTestId("session-tail-text")).toHaveAttribute("title", LONG_TEXT),
    );
  },
};

export const NotFollowing: Story = {
  args: { src: "/stories/captain/sessions/text", follow: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByTestId("session-tail-text")).toBeInTheDocument());
    await expect(canvas.queryByRole("status")).not.toBeInTheDocument();
  },
};

export const EmptyBeforeFirstEntry: Story = {
  args: { src: "/stories/captain/sessions/empty", emptyLabel: "Waiting for the agent to start" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Waiting for the agent to start")).toBeInTheDocument();
  },
};
