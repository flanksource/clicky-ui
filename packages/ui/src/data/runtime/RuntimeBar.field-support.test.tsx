import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RuntimeBar } from "./RuntimeBar";

describe("RuntimeBar field support", () => {
  it("keeps family and mode controls when model and effort are unsupported", () => {
    render(
      <RuntimeBar
        variant="combo"
        value={{ backend: "gemini-cli" }}
        onChange={vi.fn()}
        showModel={false}
        showEffort={false}
      />,
    );

    const trigger = screen.getByRole("button", {
      name: "Runtime: Gemini, CLI",
    });
    expect(trigger).toHaveTextContent("Gemini CLI");
    fireEvent.click(trigger);
    expect(screen.getByRole("radiogroup", { name: "Family" })).toBeInTheDocument();
    expect(
      screen.getByRole("radiogroup", { name: "Runtime mode" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("slider", { name: "Reasoning effort" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Prompt default" }),
    ).not.toBeInTheDocument();
  });
});
