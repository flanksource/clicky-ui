import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Message } from "./Message";

describe("Message fork provenance", () => {
  it("renders a fork seed as a collapsed provenance chip instead of a user bubble", () => {
    render(
      <Message
        message={{
          id: "fork-seed",
          role: "user",
          parts: [
            {
              type: "data-fork-seed",
              data: { forkedFrom: "source-1", title: "Source chat" },
            },
            {
              type: "text",
              text: '<captain-fork source-session="source-1">\nUSER:\nQuestion\n</captain-fork>',
            },
          ],
        }}
      />,
    );

    const chip = screen.getByText("Forked from Source chat").closest("details");
    expect(chip).not.toHaveAttribute("open");
    expect(screen.queryByText("Question")).not.toBeInTheDocument();
    fireEvent.click(screen.getByText("Forked from Source chat"));
    expect(chip).toHaveAttribute("open");
  });
});
