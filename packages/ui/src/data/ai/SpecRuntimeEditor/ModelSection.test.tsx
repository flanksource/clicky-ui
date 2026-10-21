import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ModelSection } from "./ModelSection";

describe("ModelSection", () => {
  it("shows provider readiness without runtime identity or budget controls", () => {
    render(
      <ModelSection
        models={[
          {
            id: "claude-sonnet",
            provider: "anthropic",
            label: "Claude Sonnet",
            reasoning: true,
            configured: false,
            availability: {
              state: "not_authenticated",
              reason: "Login required",
            },
          },
        ]}
      />,
    );
    expect(
      screen.getByRole("button", { name: "Provider status, 1 issue" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("group", { name: "Runtime" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Max turns")).not.toBeInTheDocument();
    expect(screen.queryByText("Max tokens")).not.toBeInTheDocument();
    expect(screen.queryByText("Max cost (USD)")).not.toBeInTheDocument();
    expect(screen.queryByText("Timeout")).not.toBeInTheDocument();
  });
});
