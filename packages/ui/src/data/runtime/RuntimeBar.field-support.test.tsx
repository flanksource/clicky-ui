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

    expect(screen.getByTitle("Runtime mode — CLI")).toHaveTextContent("CLI");
    fireEvent.click(screen.getByTitle("Family — Gemini"));
    expect(screen.getByRole("menu", { name: "Family" })).toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: "Gemini" }),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText("Model id")).not.toBeInTheDocument();
    expect(screen.queryByTitle("Reasoning effort")).not.toBeInTheDocument();
  });
});
