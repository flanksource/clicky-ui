import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PromptInput } from "./PromptInput";

describe("PromptInput", () => {
  it("keeps the default streaming behavior stop-only", () => {
    render(
      <PromptInput status="streaming" onSubmit={vi.fn()} onStop={vi.fn()} />,
    );

    expect(screen.getByRole("button", { name: "Stop" })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Send" }),
    ).not.toBeInTheDocument();
  });

  it("submits while streaming when explicitly enabled", () => {
    const onSubmit = vi.fn();
    render(
      <PromptInput
        status="streaming"
        allowSubmitWhileStreaming
        stopLabel="Interrupt"
        onSubmit={onSubmit}
        onStop={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByRole("textbox"), { target: { value: "btw" } });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    expect(
      screen.getByRole("button", { name: "Interrupt" }),
    ).toBeInTheDocument();
    expect(onSubmit).toHaveBeenCalledWith("btw", []);
  });
});
