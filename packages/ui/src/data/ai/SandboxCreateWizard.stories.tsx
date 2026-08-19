import type { Meta, StoryObj } from "@storybook/react";

import { SandboxCreateWizard } from "./SandboxCreateWizard";

const meta = {
  title: "AI/SandboxCreateWizard",
  component: SandboxCreateWizard,
  parameters: { layout: "fullscreen" },
  args: {
    open: true,
    catalog: {
      kinds: [
        {
          kind: "container",
          description: "Run the agent in an ephemeral container.",
          capabilities: ["wrap-command", "isolate-workspace"],
          modes: ["cli", "agent"],
          configSchema: {
            type: "object",
            required: ["image"],
            properties: {
              image: {
                type: "string",
                title: "Container image",
                default: "ghcr.io/flanksource/captain-agent:latest",
              },
            },
          },
        },
        {
          kind: "srt",
          description: "Confine the local command with sandbox-runtime.",
          capabilities: ["wrap-command"],
          modes: ["cli", "agent", "cmux"],
        },
        {
          kind: "git-agent",
          description: "Dispatch the run to an enrolled remote agent over git.",
          capabilities: ["remote-exec", "isolate-workspace", "egress-proxy"],
          modes: ["cli", "agent", "cmux"],
          configSchema: {
            type: "object",
            properties: {
              waitTimeout: {
                type: "string",
                title: "Wait timeout",
                default: "30m",
              },
            },
          },
        },
      ],
    },
    config: {
      credentials: [
        {
          id: "claude-subscription",
          token: "claude",
          label: "Claude Code subscription",
          category: "AI connections",
          reference: {},
        },
        {
          id: "codex-subscription",
          token: "codex",
          label: "Codex ChatGPT subscription",
          category: "AI connections",
          reference: {},
        },
      ],
      onCreate: (input) => ({ name: input.name, kind: input.kind }),
    },
    onClose: () => undefined,
  },
} satisfies Meta<typeof SandboxCreateWizard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CredentialExposure: Story = {};
