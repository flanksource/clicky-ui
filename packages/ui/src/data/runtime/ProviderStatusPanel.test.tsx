import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { ChatModel } from "../chat/types";
import type { SpecRuntimeFamily } from "./runtime-mode";
import { ProviderStatusPanel } from "./ProviderStatusPanel";

const MODELS: ChatModel[] = [
  {
    id: "claude-agent/sonnet",
    provider: "claude-agent",
    label: "Claude Sonnet",
    reasoning: true,
    configured: true,
    availability: { state: "available" },
  },
  {
    id: "claude-agent/opus",
    provider: "claude-agent",
    label: "Claude Opus",
    reasoning: true,
    configured: false,
    availability: {
      state: "not_authenticated",
      reason: "Claude Agent is not authenticated.",
      remediation: "Run claude login, then refresh.",
    },
  },
];

const FAMILIES: SpecRuntimeFamily[] = [
  {
    id: "claude",
    label: "Claude",
    provider: "claude-agent",
    modes: [
      { id: "agent", label: "Agent", backend: "claude-agent" },
      {
        id: "cli",
        label: "CLI",
        backend: "claude-cli",
        provider: "claude-agent",
        availability: {
          state: "missing_executable",
          reason: "Claude CLI was not found on PATH.",
          remediation: "Install Claude CLI, then refresh.",
        },
      },
    ],
  },
  {
    id: "codex",
    label: "Codex",
    provider: "codex-cli",
    modes: [
      {
        id: "cmux",
        label: "cmux",
        backend: "codex-cmux",
        availability: {
          state: "disabled",
          reason: "Codex cmux is disabled.",
          remediation: "Enable Codex cmux, then refresh.",
        },
      },
    ],
  },
];

describe("ProviderStatusPanel", () => {
  it("groups provider issues and expands the first provider needing attention", () => {
    render(<ProviderStatusPanel models={MODELS} families={FAMILIES} />);

    const panel = screen.getByRole("button", {
      name: "Provider status, 3 issues",
    });
    expect(panel).toHaveAttribute("aria-expanded", "true");

    const claude = screen.getByRole("button", {
      name: "Claude, needs attention",
    });
    expect(claude).toHaveAttribute("aria-expanded", "true");
    expect(
      screen.getByText("Claude CLI was not found on PATH.")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Run claude login, then refresh.")
    ).toBeInTheDocument();

    const codex = screen.getByRole("button", { name: "Codex, disabled" });
    expect(codex).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(codex);
    expect(screen.getByText("Codex cmux is disabled.")).toBeInTheDocument();
    expect(claude).toHaveAttribute("aria-expanded", "false");
  });

  it("collapses the whole inventory by default for embedded spec editors", () => {
    render(
      <ProviderStatusPanel
        models={MODELS}
        families={FAMILIES}
        defaultCollapsed
      />
    );

    const panel = screen.getByRole("button", {
      name: "Provider status, 3 issues",
    });
    expect(panel).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("Claude")).not.toBeInTheDocument();

    fireEvent.click(panel);
    expect(screen.getByText("Claude")).toBeInTheDocument();
  });

  it("expands the first issue when an async catalog arrives while collapsed", () => {
    const { rerender } = render(
      <ProviderStatusPanel
        models={[]}
        families={[
          {
            id: "claude",
            label: "Claude",
            provider: "claude-agent",
            modes: [{ id: "agent", label: "Agent", backend: "claude-agent" }],
          },
        ]}
        defaultCollapsed
      />
    );

    rerender(
      <ProviderStatusPanel
        models={MODELS}
        families={FAMILIES}
        defaultCollapsed
      />
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Provider status, 3 issues" })
    );

    expect(
      screen.getByText("Claude CLI was not found on PATH.")
    ).toBeInTheDocument();
  });
});
