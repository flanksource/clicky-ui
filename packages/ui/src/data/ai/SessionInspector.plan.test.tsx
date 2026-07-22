import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SessionPlanPanel } from "./SessionInspector.plan";

describe("SessionPlanPanel", () => {
  it("renders plan content without a bordered container", async () => {
    render(
      <SessionPlanPanel
        plan={{
          path: ".gavel/plans/session-inspector.md",
          content: "# Implement parity panels",
          events: [],
        }}
      />,
    );

    const heading = await screen.findByRole("heading", {
      name: "Implement parity panels",
    });
    const panel = heading.closest("section");

    expect(panel).not.toHaveClass("border", "rounded-lg", "bg-background");
  });
});
