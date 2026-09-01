import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RuntimeBar } from "./RuntimeBar";

describe("RuntimeBar field support", () => {
  it("keeps family and mode controls when model and effort are unsupported", () => {
    // A mode is family-independent, so the family comes from the model: "cli"
    // alone would land on the first family that serves it. The composite id
    // this replaced carried both halves in one token, which is the conflation
    // the runtime rework removed.
    render(
      <RuntimeBar
        variant="combo"
        value={{ mode: "cli", model: "gemini-3.5-flash" }}
        onChange={vi.fn()}
        models={[
          {
            id: "gemini-3.5-flash",
            provider: "googleai",
            label: "Gemini 3.5 Flash",
            reasoning: false,
            configured: true,
          },
        ]}
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
