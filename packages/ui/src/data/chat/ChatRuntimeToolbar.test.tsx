import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MOCK_MODELS } from "./Chat.fixtures";
import { ChatRuntimeToolbar } from "./ChatRuntimeToolbar";
import { PromptInput } from "./PromptInput";

const RUNTIME = {
  mode: "api",
  model: MOCK_MODELS[0]!.id,
  effort: "medium",
};

describe("ChatRuntimeToolbar narrow layout", () => {
  it("lets every flex ancestor between the runtime bar and the form shrink so the bar can collapse settings", () => {
    render(
      <PromptInput
        onSubmit={vi.fn()}
        enableAttachments
        toolbar={
          <ChatRuntimeToolbar
            models={MOCK_MODELS}
            runtime={RUNTIME}
            reasoningEfforts={["low", "medium", "high"]}
            onRuntimeChange={vi.fn()}
          />
        }
      />,
    );

    // A flex item defaults to min-width:auto (its max-content width), so one
    // ancestor without min-w-0 makes the bar measure at full width and clip.
    const barRoot = screen.getByRole("group", { name: "Runtime" })
      .parentElement as HTMLElement;
    const barSlot = barRoot.parentElement as HTMLElement;
    const toolbar = barSlot.parentElement as HTMLElement;
    const toolbarRow = toolbar.parentElement as HTMLElement;
    expect(barRoot).toHaveClass("min-w-0");
    // The slot owns all space the context gauge leaves, so the bar is
    // measured against the real width rather than shrunk by a spacer.
    expect(barSlot).toHaveClass("min-w-0", "flex-1");
    expect(toolbar).toHaveClass("min-w-0", "flex-1");
    expect(toolbarRow).toHaveClass("min-w-0");
  });
});
