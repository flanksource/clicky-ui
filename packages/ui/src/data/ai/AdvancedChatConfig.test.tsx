import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AdvancedChatConfig } from "./AdvancedChatConfig";

describe("AdvancedChatConfig", () => {
  it.each(["No limit", "$2.00"])(
    "handles cost choice %s without reporting a runtime change",
    (choice) => {
      const onRuntimeChange = vi.fn();
      const onBudgetChange = vi.fn();
      render(
        <AdvancedChatConfig
          models={[]}
          runtime={{
            mode: "cli",
            model: "gpt-5",
            fallbacks: [{ model: "gpt-5-mini" }],
          }}
          reasoningEfforts={[]}
          permissionMode="default"
          budget={{ cost: 2, maxTokens: 4096 }}
          onRuntimeChange={onRuntimeChange}
          onBudgetChange={onBudgetChange}
        />,
      );
      fireEvent.click(screen.getByTitle("Runtime options"));
      fireEvent.click(screen.getByRole("menuitem", { name: "Budget" }));
      fireEvent.click(screen.getByRole("menuitem", { name: choice }));
      expect(onRuntimeChange).not.toHaveBeenCalled();
      if (choice === "No limit")
        expect(onBudgetChange).toHaveBeenCalledExactlyOnceWith({
          maxTokens: 4096,
        });
      else expect(onBudgetChange).not.toHaveBeenCalled();
    },
  );

  it("forwards effort changes without changing the budget", () => {
    const onRuntimeChange = vi.fn();
    const onBudgetChange = vi.fn();
    render(
      <AdvancedChatConfig
        models={[]}
        runtime={{ mode: "cli", model: "gpt-5", effort: "high" }}
        reasoningEfforts={["low", "high"]}
        permissionMode="default"
        budget={{ cost: 2, maxTokens: 4096 }}
        onRuntimeChange={onRuntimeChange}
        onBudgetChange={onBudgetChange}
      />,
    );
    fireEvent.click(screen.getByTitle("Reasoning effort"));
    fireEvent.click(screen.getByRole("menuitem", { name: "Low" }));
    expect(onRuntimeChange).toHaveBeenCalledExactlyOnceWith({
      mode: "cli",
      model: "gpt-5",
      effort: "low",
    });
    expect(onBudgetChange).not.toHaveBeenCalled();
  });

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
    expect(onRuntimeChange).not.toHaveBeenCalled();
  });
});
