import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AdvancedChatConfig } from "./AdvancedChatConfig";

describe("AdvancedChatConfig", () => {
  it("keeps the bar's cost cap out of the runtime and in the budget", () => {
    const onRuntimeChange = vi.fn();
    const onBudgetChange = vi.fn();
    render(
      <AdvancedChatConfig
        models={[]}
        runtime={{ mode: "cli", model: "gpt-5" }}
        onRuntimeChange={onRuntimeChange}
        reasoningEfforts={[]}
        permissionMode="default"
        budget={{ cost: 2, maxTokens: 4096 }}
        onBudgetChange={onBudgetChange}
      />,
    );

    expect(screen.queryByText("Usage (last turn)")).toBeNull();
    fireEvent.click(screen.getByTitle("Runtime options"));
    fireEvent.click(screen.getByRole("menuitem", { name: "Budget" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "$10.00" }));

    expect(onBudgetChange).toHaveBeenLastCalledWith({
      cost: 10,
      maxTokens: 4096,
    });
    for (const [runtime] of onRuntimeChange.mock.calls) {
      expect(runtime).not.toHaveProperty("budget");
    }
  });
});
