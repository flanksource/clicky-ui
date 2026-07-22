import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SessionChatComposer } from "./SessionChatComposer";

const capabilities = {
  interrupt: true,
  steer: false,
  followUp: true,
  resume: true,
};

describe("SessionChatComposer", () => {
  it("renders a host accessory on the same row as the prompt input", () => {
    render(
      <SessionChatComposer
        status="idle"
        capabilities={capabilities}
        inputAccessory={<label>Target model</label>}
        onSubmit={vi.fn()}
      />,
    );

    const textbox = screen.getByRole("textbox");
    expect(screen.getByText("Target model").parentElement).toBe(
      textbox.parentElement,
    );
  });

  it("renders host controls inside the prompt toolbar", () => {
    render(
      <SessionChatComposer
        status="idle"
        capabilities={capabilities}
        toolbar={<label>Target model</label>}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByText("Target model")).toBeInTheDocument();
  });

  it("shows queued messages and accepts a follow-up during a running turn", () => {
    const onSubmit = vi.fn();
    render(
      <SessionChatComposer
        status="running"
        capabilities={capabilities}
        queued={[{ messageId: "m1", text: "after this" }]}
        onSubmit={onSubmit}
        onInterrupt={vi.fn()}
      />,
    );

    expect(screen.getByText("Queued: after this")).toBeInTheDocument();
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "next" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    expect(onSubmit).toHaveBeenCalledWith("next");
  });
});
