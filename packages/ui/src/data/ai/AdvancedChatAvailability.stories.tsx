import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ChatModel, ChatModelRuntime } from "../chat/types";
import type { SpecRuntimeFamily } from "../runtime/runtime-mode";
import { ToolPreferences } from "./ToolPreferences";

const MODELS: ChatModel[] = [
  {
    id: "claude-sonnet",
    provider: "claude-agent",
    label: "Claude Sonnet",
    configured: true,
    reasoning: true,
    runtime: { backend: "claude-agent", model: "claude-sonnet" },
    availability: { state: "available" },
  },
  {
    id: "claude-opus",
    provider: "claude-agent",
    label: "Claude Opus",
    configured: false,
    reasoning: true,
    runtime: { backend: "claude-agent", model: "claude-opus" },
    availability: {
      state: "not_authenticated",
      reason: "Claude Agent is installed but not authenticated.",
      remediation: "Authenticate with `claude login`, then refresh.",
    },
  },
  {
    id: "codex-gpt-5",
    provider: "codex",
    label: "GPT-5",
    configured: true,
    reasoning: true,
    runtime: { backend: "codex", model: "codex-gpt-5" },
    availability: { state: "available" },
  },
  {
    id: "gemini-pro",
    provider: "gemini",
    label: "Gemini Pro",
    configured: true,
    reasoning: true,
    runtime: { backend: "gemini", model: "gemini-pro" },
    availability: { state: "available" },
  },
];

const FAMILIES: SpecRuntimeFamily[] = [
  {
    id: "claude",
    label: "Claude",
    provider: "claude-agent",
    modes: [
      {
        id: "agent",
        label: "Agent",
        backend: "claude-agent",
        provider: "claude-agent",
        title: "Claude Agent",
      },
      {
        id: "cli",
        label: "CLI",
        backend: "claude-cli",
        provider: "claude-agent",
        availability: {
          state: "missing_executable",
          reason: "`claude` was not found on PATH.",
          remediation: "Install Claude CLI or add it to PATH, then refresh.",
        },
      },
    ],
  },
  {
    id: "codex",
    label: "Codex",
    provider: "codex",
    modes: [
      {
        id: "agent",
        label: "Agent",
        backend: "codex",
        provider: "codex",
      },
      {
        id: "cmux",
        label: "cmux",
        backend: "codex-cmux",
        provider: "codex",
        availability: {
          state: "disabled",
          reason: "The cmux mode is disabled in Captain configuration.",
          remediation: "Enable Codex cmux on the Whoami page, then refresh.",
        },
      },
    ],
  },
  {
    id: "gemini",
    label: "Gemini",
    provider: "gemini",
    modes: [
      {
        id: "api",
        label: "API",
        backend: "gemini",
        provider: "gemini",
      },
    ],
  },
];

function AvailabilityStory() {
  const [runtime, setRuntime] = useState<ChatModelRuntime>({
    backend: "claude-agent",
    model: "claude-sonnet",
  });
  return (
    <div className="flex min-h-96 items-start justify-end bg-background p-6">
      <ToolPreferences
        tools={[]}
        value={{}}
        onRule={() => {}}
        models={MODELS}
        runtime={runtime}
        onRuntimeChange={setRuntime}
        runtimeFamilies={FAMILIES}
      />
    </div>
  );
}

const meta = {
  title: "AI/Advanced Chat Availability",
  component: ToolPreferences,
} satisfies Meta<typeof ToolPreferences>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ProviderStatusDisclosure: Story = {
  render: () => <AvailabilityStory />,
};
