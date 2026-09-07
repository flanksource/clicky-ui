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

  it("seeds the composer from a draft without submitting it", () => {
    const onSubmit = vi.fn();
    render(
      <PromptInput
        onSubmit={onSubmit}
        draft={{ id: 1, text: "Explain this figure" }}
      />,
    );

    expect(screen.getByRole("textbox")).toHaveValue("Explain this figure");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("re-seeds on a new id even when the text repeats, and not on the same id", () => {
    const draft = { id: 1, text: "Trace the formula" };
    const { rerender } = render(
      <PromptInput onSubmit={vi.fn()} draft={draft} />,
    );
    const textbox = screen.getByRole("textbox");

    fireEvent.change(textbox, { target: { value: "my own words" } });
    rerender(<PromptInput onSubmit={vi.fn()} draft={draft} />);
    expect(textbox).toHaveValue("my own words");

    rerender(
      <PromptInput onSubmit={vi.fn()} draft={{ id: 2, text: draft.text }} />,
    );
    expect(textbox).toHaveValue("Trace the formula");
  });
});
