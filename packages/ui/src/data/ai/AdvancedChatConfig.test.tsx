import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AdvancedChatConfig } from "./AdvancedChatConfig";

describe("AdvancedChatConfig", () => {
  it("shows the provider inventory expanded below cost", () => {
    render(
      <AdvancedChatConfig
        models={[]}
        runtime={{ backend: "claude-agent" }}
        onRuntimeChange={vi.fn()}
        runtimeFamilies={[
          {
            id: "claude",
            label: "Claude",
            provider: "claude-agent",
            modes: [
              {
                id: "agent",
                label: "Agent",
                backend: "claude-agent",
              },
            ],
          },
        ]}
        reasoningEfforts={[]}
        permissionMode="default"
      />
    );

    const cost = screen.getByText("Cost (last turn)");
    const providerStatus = screen.getByRole("button", {
      name: "Provider status, all providers ready",
    });
    expect(providerStatus).toHaveAttribute("aria-expanded", "true");
    expect(
      cost.compareDocumentPosition(providerStatus) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });
});
