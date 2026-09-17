import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { SessionHeader } from "./SessionHeader";
import {
  KV_STORE_EVENTS,
  STOPPED_JVM_TRACE_SESSION,
  runningSessionFixture,
  sessionFixture,
} from "./session-story.fixtures";

// A deadline relative to when the story renders, so the countdown is live.
const inMinutes = (minutes: number) => new Date(Date.now() + minutes * 60_000).toISOString();
const agoMinutes = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString();

const meta = {
  title: "Clicky-RPC/SessionHeader",
  component: SessionHeader,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Props-only header for one commons-db query session (`GET /api/v1/sessions/{id}`): state with an unresponsive badge, owner host and pid, label chips, restart lineage links, a stopAt countdown, and Stop/Extend/Restart gated by `controllable` and `restartable`. Pair it with `useSession` for data and actions.",
      },
    },
  },
  args: {
    session: STOPPED_JVM_TRACE_SESSION,
    getSessionHref: (id: string) => `#/traces/sessions/${id}`,
    onStop: fn(),
    onExtend: fn(),
    onRestart: fn(),
  },
  argTypes: { session: { control: "object" } },
  render: (args) => (
    <div className="max-w-4xl">
      <SessionHeader {...args} />
    </div>
  ),
} satisfies Meta<typeof SessionHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const RunningWithCountdown: Story = {
  args: { session: runningSessionFixture(inMinutes(6)) },
};

export const Stopping: Story = {
  args: { session: runningSessionFixture(inMinutes(6), { state: "stopping", stopReason: "stopped by admin" }) },
};

export const StoppedRestartable: Story = {};

export const Interrupted: Story = {
  args: {
    session: sessionFixture({
      state: "interrupted",
      stopReason: "heartbeat lost",
      controllable: false,
      localWriter: false,
      stoppedAt: agoMinutes(2),
    }),
  },
};

export const RunningButUnresponsive: Story = {
  args: {
    session: runningSessionFixture(inMinutes(6), {
      unresponsive: true,
      controllable: false,
      localWriter: false,
      heartbeatAt: agoMinutes(4),
    }),
  },
};

export const EventsUnavailable: Story = {
  args: { session: sessionFixture({ eventsAvailable: false, localWriter: false }) },
};

export const EventsUnavailableInKvStore: Story = {
  args: { session: sessionFixture({ eventsAvailable: false, localWriter: false, events: KV_STORE_EVENTS }) },
};

export const ActionFailed: Story = {
  args: {
    session: runningSessionFixture(inMinutes(6)),
    actionError: new Error(
      "POST /api/v1/sessions/7c1e2f4a-3b5d-4e6f-8a9b-0c1d2e3f4a5b/extend?duration=300000ms failed: session is not controllable by this principal",
    ),
  },
};

export const NotControllable: Story = {
  args: {
    session: runningSessionFixture(inMinutes(12), {
      controllable: false,
      localWriter: false,
      owner: { host: "mission-control-oipa-7a01", pid: 1, boot: "e93a1f7c" },
    }),
  },
};

export const FailedWithWarning: Story = {
  args: {
    session: sessionFixture({
      state: "failed",
      stopReason: "",
      error: "probe detached: class com.example.messaging.FileMessageListener was retransformed",
      warning: "status write failed 2 times: redis i/o timeout",
      restartable: true,
    }),
  },
};

export const RestartPromptsForDuration: Story = {
  args: {
    session: sessionFixture({ params: { ...STOPPED_JVM_TRACE_SESSION.params, durationMs: 0 } }),
  },
};

export const MutatingKindConfirms: Story = {
  args: {
    mutating: true,
    session: runningSessionFixture(inMinutes(3), {
      profile: "trace-capture/jvm_redefine",
      labels: { target: "cycle", origin: "web", label: "FileMessageListener (patch)" },
      handle: "com.example.messaging.FileMessageListener@617519d6",
    }),
  },
};

export const RestartLineage: Story = {
  args: {
    session: sessionFixture({
      restartOf: "3f0a9c12-7b44-4e21-9d0e-5a6b7c8d9e0f",
      restartedAs: ["9d2f3a5b-4c6e-4f70-9bac-1d2e3f4a5b6c"],
    }),
  },
};
